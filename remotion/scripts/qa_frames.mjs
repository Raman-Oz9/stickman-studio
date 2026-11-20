#!/usr/bin/env node
// QA frames script: extracts a frame every 2s with ffmpeg, builds a contact sheet JPG,
// and reports near-uniform (flat colour, std-dev < 12) frames as "empty scene" in a JSON report.
// Usage: node scripts/qa_frames.mjs <video.mp4> [output_dir]

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/qa_frames.mjs <video.mp4> [output_dir]");
  process.exit(1);
}

const videoPath = path.resolve(args[0]);
const outDir = path.resolve(args[1] || path.join(path.dirname(videoPath), "qa_frames_out"));

if (!fs.existsSync(videoPath)) {
  console.error(`Error: video file not found: ${videoPath}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

console.log(`Analyzing video: ${videoPath}`);
console.log(`Output directory: ${outDir}`);

// 1. Extract individual frames every 2 seconds
console.log("Extracting frames every 2s...");
execSync(`ffmpeg -y -i "${videoPath}" -vf "fps=1/2" -q:v 2 "${path.join(outDir, "frame_%04d.jpg")}"`, { stdio: "inherit" });

// 2. Build contact sheet JPG using ffmpeg tile filter
console.log("Building contact sheet...");
try {
  execSync(`ffmpeg -y -i "${videoPath}" -vf "fps=1/2,scale=180:320,tile=5x6" -q:v 2 "${path.join(outDir, "contact_sheet.jpg")}"`, { stdio: "inherit" });
} catch (e) {
  console.warn("Warning: ffmpeg contact sheet tile generation failed or video too short:", e.message);
}

// 3. Compute frame standard deviation using raw grayscale stream to detect flat / near-uniform frames ("empty scene")
console.log("Checking frame uniformity (empty scene detection)...");
const rawFile = path.join(outDir, "frames_32x32.raw");
execSync(`ffmpeg -y -i "${videoPath}" -vf "fps=1/2,scale=32:32,format=gray" -f rawvideo -pix_fmt gray "${rawFile}"`, { stdio: "inherit" });

const rawBuffer = fs.readFileSync(rawFile);
const frameSize = 32 * 32;
const numFrames = Math.floor(rawBuffer.length / frameSize);

const emptyScenes = [];
const allFramesStats = [];

for (let i = 0; i < numFrames; i++) {
  const start = i * frameSize;
  let sum = 0;
  for (let p = 0; p < frameSize; p++) {
    sum += rawBuffer[start + p];
  }
  const mean = sum / frameSize;

  let sqDiffSum = 0;
  for (let p = 0; p < frameSize; p++) {
    const diff = rawBuffer[start + p] - mean;
    sqDiffSum += diff * diff;
  }
  const stdDev = Math.sqrt(sqDiffSum / frameSize);
  const timestampSeconds = i * 2;

  const isUniform = stdDev < 12;
  allFramesStats.push({
    frameIndex: i + 1,
    timestampSeconds,
    mean: Number(mean.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    emptyScene: isUniform
  });

  if (isUniform) {
    emptyScenes.push({
      frameIndex: i + 1,
      timestampSeconds,
      stdDev: Number(stdDev.toFixed(2))
    });
  }
}

// Clean up raw temp file
try { fs.unlinkSync(rawFile); } catch {}

const report = {
  video: path.basename(videoPath),
  intervalSeconds: 2,
  totalFramesChecked: numFrames,
  emptySceneThresholdStdDev: 12,
  emptyScenesCount: emptyScenes.length,
  emptyScenes,
  frames: allFramesStats
};

const reportPath = path.join(outDir, "report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

console.log(`\nQA Complete.`);
console.log(`Checked ${numFrames} frames (1 every 2s).`);
console.log(`Found ${emptyScenes.length} near-uniform / empty scene frames (stdDev < 12).`);
console.log(`Report written to: ${reportPath}`);
console.log(`Contact sheet: ${path.join(outDir, "contact_sheet.jpg")}`);
