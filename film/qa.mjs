#!/usr/bin/env node
// QA tool script: extracts a frame every 2s with ffmpeg, builds a contact-sheet png,
// and writes report.json flagging near-uniform frames, missing caption band, black frames,
// duplicate consecutive frames, audio silence > 1.2s, and total duration.
// Usage: node film/qa.mjs <video.mp4> <out_dir>

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node film/qa.mjs <video.mp4> <out_dir>");
  process.exit(1);
}

const videoPath = path.resolve(args[0]);
const outDir = path.resolve(args[1]);

if (!fs.existsSync(videoPath)) {
  console.error(`Error: video file not found: ${videoPath}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

console.log(`Analyzing video: ${videoPath}`);
console.log(`Output directory: ${outDir}`);

// 1. Get total duration via ffprobe
let durationSeconds = 0;
try {
  const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`, { encoding: "utf8" }).trim();
  durationSeconds = parseFloat(durStr) || 0;
} catch (e) {
  console.warn("Warning: ffprobe failed to get duration:", e.message);
}

// 2. Extract a frame every 2 seconds as PNG
console.log("Extracting frames every 2s...");
execSync(`ffmpeg -y -i "${videoPath}" -vf "fps=1/2" -q:v 2 "${path.join(outDir, "frame_%04d.png")}"`, { stdio: "inherit" });

// Count extracted frames
const frameFiles = fs.readdirSync(outDir).filter(f => f.startsWith("frame_") && f.endsWith(".png")).sort();
const numFrames = frameFiles.length;

// 3. Build contact-sheet png using ffmpeg tile filter
console.log("Building contact sheet PNG...");
if (numFrames > 0) {
  const cols = Math.ceil(Math.sqrt(numFrames));
  const rows = Math.ceil(numFrames / cols);
  try {
    execSync(`ffmpeg -y -i "${videoPath}" -vf "fps=1/2,scale=160:284,tile=${cols}x${rows}" "${path.join(outDir, "contact_sheet.png")}"`, { stdio: "inherit" });
  } catch (e) {
    console.warn("Warning: ffmpeg contact sheet tile generation failed:", e.message);
  }
}

// 4. Analyze frames via raw grayscale stream (64x64)
console.log("Analyzing frames (stddev, black frames, caption band, duplicates)...");
const rawFile = path.join(outDir, "frames_64x64.raw");
try {
  execSync(`ffmpeg -y -i "${videoPath}" -vf "fps=1/2,scale=64:64,format=gray" -f rawvideo -pix_fmt gray "${rawFile}"`, { stdio: "inherit" });
} catch (e) {
  console.warn("Warning: raw frame extraction failed:", e.message);
}

let rawBuffer = Buffer.alloc(0);
if (fs.existsSync(rawFile)) {
  rawBuffer = fs.readFileSync(rawFile);
  try { fs.unlinkSync(rawFile); } catch {}
}

const width = 64;
const height = 64;
const frameSize = width * height;
const actualFrames = Math.floor(rawBuffer.length / frameSize);

const nearUniformFrames = [];
const blackFrames = [];
const missingCaptionBandFrames = [];
const duplicateFrames = [];

let prevFrameBuffer = null;

for (let i = 0; i < actualFrames; i++) {
  const start = i * frameSize;
  const frameBuf = rawBuffer.subarray(start, start + frameSize);
  const timestampSeconds = i * 2;
  const frameIndex = i + 1;

  // Mean brightness
  let sum = 0;
  for (let p = 0; p < frameSize; p++) {
    sum += frameBuf[p];
  }
  const mean = sum / frameSize;

  // Standard deviation
  let sqDiffSum = 0;
  for (let p = 0; p < frameSize; p++) {
    const diff = frameBuf[p] - mean;
    sqDiffSum += diff * diff;
  }
  const stdDev = Math.sqrt(sqDiffSum / frameSize);

  // 1. Black frame check (mean < 5 and stdDev < 3)
  const isBlack = mean < 5 && stdDev < 3;
  if (isBlack) {
    blackFrames.push({ frameIndex, timestampSeconds, mean: Number(mean.toFixed(2)), stdDev: Number(stdDev.toFixed(2)) });
  }

  // 2. Near-uniform frame check (stdDev < 12) - unless black
  const isUniform = stdDev < 12 && !isBlack;
  if (isUniform) {
    nearUniformFrames.push({ frameIndex, timestampSeconds, stdDev: Number(stdDev.toFixed(2)) });
  }

  // 3. Caption band check (bottom 20% of frame, rows 51 to 63)
  let botSum = 0;
  let botCount = 0;
  for (let r = 51; r < height; r++) {
    for (let c = 0; c < width; c++) {
      botSum += frameBuf[r * width + c];
      botCount++;
    }
  }
  const botMean = botSum / botCount;
  let botSqDiff = 0;
  for (let r = 51; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const diff = frameBuf[r * width + c] - botMean;
      botSqDiff += diff * diff;
    }
  }
  const botStdDev = Math.sqrt(botSqDiff / botCount);
  const isCaptionMissing = botStdDev < 4 && !isBlack;
  if (isCaptionMissing) {
    missingCaptionBandFrames.push({ frameIndex, timestampSeconds, botStdDev: Number(botStdDev.toFixed(2)) });
  }

  // 4. Duplicate consecutive frame check (frozen video)
  if (prevFrameBuffer) {
    let mae = 0;
    for (let p = 0; p < frameSize; p++) {
      mae += Math.abs(frameBuf[p] - prevFrameBuffer[p]);
    }
    mae /= frameSize;
    if (mae < 1.0) {
      duplicateFrames.push({ frameIndex, timestampSeconds, meanAbsoluteError: Number(mae.toFixed(2)) });
    }
  }
  prevFrameBuffer = Buffer.from(frameBuf);
}

// Also run ffmpeg freezedetect filter for thorough video timeline check
let ffmpegFreezes = [];
try {
  const freezeOut = execSync(`ffmpeg -i "${videoPath}" -vf freezedetect=r=0.001:d=0.5 -f null - 2>&1`, { encoding: "utf8" });
  const regex = /freeze_start:\s*([\d.]+).*?freeze_duration:\s*([\d.]+)/g;
  let match;
  while ((match = regex.exec(freezeOut)) !== null) {
    ffmpegFreezes.push({
      startSeconds: parseFloat(match[1]),
      durationSeconds: parseFloat(match[2])
    });
  }
} catch (e) {
  // Ignore if freezedetect not supported or fails
}

// 5. Audio silence check (> 1.2s inside narration via silencedetect)
console.log("Checking audio silence (> 1.2s)...");
const audioSilences = [];
try {
  const silenceOut = execSync(`ffmpeg -i "${videoPath}" -af "silencedetect=noise=-30dB:d=1.2" -f null - 2>&1`, { encoding: "utf8" });
  const startRegex = /silence_start:\s*([\d.]+)/g;
  const endRegex = /silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/g;
  
  let starts = [];
  let match;
  while ((match = startRegex.exec(silenceOut)) !== null) {
    starts.push(parseFloat(match[1]));
  }
  while ((match = endRegex.exec(silenceOut)) !== null) {
    const end = parseFloat(match[1]);
    const duration = parseFloat(match[2]);
    const start = starts.shift() || (end - duration);
    audioSilences.push({
      startSeconds: Number(start.toFixed(2)),
      endSeconds: Number(end.toFixed(2)),
      durationSeconds: Number(duration.toFixed(2))
    });
  }
} catch (e) {
  console.warn("Warning: silencedetect analysis failed or no audio stream:", e.message);
}

// 6. Compile report
const flags = {
  nearUniformFrames,
  blackFrames,
  missingCaptionBandFrames,
  duplicateFrames,
  ffmpegFreezes,
  audioSilences
};

const hasFlags = (
  nearUniformFrames.length > 0 ||
  blackFrames.length > 0 ||
  missingCaptionBandFrames.length > 0 ||
  duplicateFrames.length > 0 ||
  ffmpegFreezes.length > 0 ||
  audioSilences.length > 0
);

const report = {
  video: path.basename(videoPath),
  durationSeconds: Number(durationSeconds.toFixed(2)),
  totalFramesChecked: actualFrames,
  hasFlags,
  flags
};

const reportPath = path.join(outDir, "report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

console.log(`\nQA Report generated: ${reportPath}`);
console.log(`Total Duration: ${report.durationSeconds}s`);
console.log(`Frames Checked: ${actualFrames}`);
console.log(`Near-Uniform Frames: ${nearUniformFrames.length}`);
console.log(`Black Frames: ${blackFrames.length}`);
console.log(`Missing Caption Band Frames: ${missingCaptionBandFrames.length}`);
console.log(`Duplicate / Frozen Frames: ${duplicateFrames.length} (ffmpeg freezes: ${ffmpegFreezes.length})`);
console.log(`Audio Silences (>1.2s): ${audioSilences.length}`);
console.log(`Has Flags: ${hasFlags}`);

if (hasFlags) {
  console.error("\nQA FAILED: Flags detected.");
  process.exit(1);
} else {
  console.log("\nQA PASSED: Zero flags detected.");
  process.exit(0);
}
