#!/usr/bin/env node
/**
 * QA Frames script:
 * Given a video path, extracts one frame every 3s using ffmpeg,
 * writes a contact sheet JPG (using ffmpeg tile filter),
 * and computes per-frame luma standard deviation.
 * Flags frames with std-dev < 12 as "empty scene".
 * Generates a JSON report.
 *
 * Usage: node scripts/qa_frames.mjs <videoPath> [outDir]
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/qa_frames.mjs <videoPath> [outDir]");
  process.exit(1);
}

const videoPath = path.resolve(args[0]);
const outDir = path.resolve(args[1] || "qa_output");

if (!fs.existsSync(videoPath)) {
  console.error(`Error: Video not found at ${videoPath}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

console.log(`Analyzing video: ${videoPath}`);
console.log(`Output directory: ${outDir}`);

// 1. Get video duration and dimensions using ffprobe
const probeRes = spawnSync("ffprobe", [
  "-v", "error",
  "-show_entries", "format=duration:stream=width,height",
  "-of", "json",
  videoPath
], { encoding: "utf8" });

let duration = 0;
let width = 1080;
let height = 1920;
try {
  const data = JSON.parse(probeRes.stdout);
  if (data.format && data.format.duration) {
    duration = parseFloat(data.format.duration);
  }
  if (data.streams && data.streams[0]) {
    width = data.streams[0].width || width;
    height = data.streams[0].height || height;
  }
} catch (e) {
  console.warn("Warning: Could not probe video metadata via ffprobe, using defaults.");
}

console.log(`Video duration: ${duration.toFixed(2)}s, Resolution: ${width}x${height}`);

// 2. Extract frames every 3 seconds as raw RGB24 at an analysis resolution to compute std-dev efficiently
const analysisWidth = 160;
const analysisHeight = Math.round(160 * (height / width));

const rawProcess = spawnSync("ffmpeg", [
  "-y",
  "-i", videoPath,
  "-vf", `fps=1/3,scale=${analysisWidth}:${analysisHeight}:flags=area`,
  "-f", "rawvideo",
  "-pix_fmt", "rgb24",
  "-"
], { maxBuffer: 1024 * 1024 * 256 });

if (rawProcess.error || rawProcess.status !== 0) {
  console.error("Error running ffmpeg for frame extraction:", rawProcess.stderr?.toString());
  process.exit(1);
}

const rawBuffer = rawProcess.stdout;
const frameSize = analysisWidth * analysisHeight * 3;
const totalFrames = Math.floor(rawBuffer.length / frameSize);

console.log(`Extracted ${totalFrames} frames (one every 3s). Analyzing standard deviations...`);

const framesReport = [];
let emptySceneCount = 0;

for (let i = 0; i < totalFrames; i++) {
  const timestamp = i * 3;
  const offset = i * frameSize;
  const frameBuf = rawBuffer.subarray(offset, offset + frameSize);

  let sum = 0;
  let sumSq = 0;
  const pixelCount = analysisWidth * analysisHeight;

  for (let p = 0; p < pixelCount; p++) {
    const r = frameBuf[p * 3];
    const g = frameBuf[p * 3 + 1];
    const b = frameBuf[p * 3 + 2];
    // Rec. 709 luma
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    sum += y;
    sumSq += y * y;
  }

  const mean = sum / pixelCount;
  const variance = (sumSq / pixelCount) - (mean * mean);
  const stdDev = Math.sqrt(Math.max(0, variance));

  const isEmpty = stdDev < 12;
  if (isEmpty) {
    emptySceneCount++;
  }

  framesReport.push({
    index: i,
    timestampSeconds: timestamp,
    meanLuma: Number(mean.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    status: isEmpty ? "empty scene" : "normal"
  });
}

// 3. Generate contact sheet JPG using ffmpeg tile filter
const contactSheetPath = path.join(outDir, "contact_sheet.jpg");
const cols = Math.min(10, totalFrames || 1);
const rows = Math.ceil((totalFrames || 1) / cols);

const tileRes = spawnSync("ffmpeg", [
  "-y",
  "-i", videoPath,
  "-vf", `fps=1/3,scale=180:320:flags=area,tile=${cols}x${rows}:padding=2:color=black`,
  "-q:v", "2",
  contactSheetPath
]);

if (tileRes.status !== 0) {
  console.warn("Warning: ffmpeg tile contact sheet generation failed:", tileRes.stderr?.toString());
} else {
  console.log(`Contact sheet generated at: ${contactSheetPath}`);
}

// 4. Write JSON report
const report = {
  videoPath,
  durationSeconds: duration,
  intervalSeconds: 3,
  totalFramesAnalyzed: totalFrames,
  emptySceneThresholdStdDev: 12,
  emptySceneCount,
  frames: framesReport
};

const reportPath = path.join(outDir, "qa_report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
console.log(`JSON report written to: ${reportPath}`);
console.log(`Summary: Analyzed ${totalFrames} frames. Flagged ${emptySceneCount} empty scene(s) (std-dev < 12).`);
