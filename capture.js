// capture.js — manages video recording and screenshot evidence
// Playwright handles video natively; ffmpeg used for post-processing

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Playwright records video automatically when context has recordVideo set.
// This module finalises the video path after the context closes.

export async function finaliseVideo(context, sessionId, bugIndex = null) {
  // Must close context first for Playwright to write the video file
  // The caller should close context, then call this with the page's video()
  const videoDir = path.resolve("output/videos");
  fs.mkdirSync(videoDir, { recursive: true });

  const suffix = bugIndex !== null ? `_bug${bugIndex}` : "";
  const destPath = path.join(videoDir, `${sessionId}${suffix}.mp4`);

  return { path: destPath };
}

export async function savePageVideo(page, sessionId, bugIndex = null) {
  try {
    const video = page.video();
    if (!video) return null;

    const videoDir = path.resolve("output/videos");
    fs.mkdirSync(videoDir, { recursive: true });

    const suffix = bugIndex !== null ? `_bug${bugIndex}` : "";
    const destPath = path.join(videoDir, `${sessionId}${suffix}.mp4`);

    const srcPath = await video.path();
    if (srcPath && fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      return destPath;
    }
  } catch (err) {
    console.warn("Could not save video:", err.message);
  }
  return null;
}

export function trimVideo(inputPath, outputPath, startSec, endSec) {
  // Uses ffmpeg to trim video to relevant bug window
  // Only called if ffmpeg is available
  try {
    const duration = endSec - startSec;
    execSync(
      `ffmpeg -y -ss ${startSec} -i "${inputPath}" -t ${duration} -c copy "${outputPath}" 2>/dev/null`,
      { stdio: "pipe" }
    );
    return outputPath;
  } catch {
    // ffmpeg not available or failed — return original
    return inputPath;
  }
}

export function screenshotSummary(sessionId) {
  const dir = path.resolve("output/screenshots");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(sessionId) && f.endsWith(".png"))
    .sort()
    .map((f) => path.join(dir, f));
}

export function cleanupOldSessions(keepDays = 7) {
  const dirs = ["output/videos", "output/screenshots", "output/sessions"];
  const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      const fp = path.join(dir, file);
      const stat = fs.statSync(fp);
      if (stat.mtimeMs < cutoff) fs.unlinkSync(fp);
    }
  }
}