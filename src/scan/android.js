import path from "path";
import { adb } from "../adb/adb.js";

export const ANDROID_ROOT = "/sdcard/Music";

/**
 * Scan Android using ls -lR (more reliable than stat)
 */
export async function scanAndroid(device, config) {
  const files = [];

  const cmd = `ls -lR "${ANDROID_ROOT}"`;

  const output = await adb(device, ["shell", cmd]);

  const lines = output.split("\n");

  let currentDir = ANDROID_ROOT;

  for (const line of lines) {
    if (!line.trim()) continue;

    // Directory header: /sdcard/Music/Artist:
    if (line.endsWith(":")) {
      currentDir = line.replace(":", "").trim();
      continue;
    }

    // Skip total lines
    if (line.startsWith("total")) continue;

    // Parse file line
    const parts = line.split(/\s+/);

    // Typical format:
    // -rw-rw---- 1 user group 12345 2023-10-01 12:00 filename.mp3
    if (parts.length < 8) continue;

    const size = Number(parts[4]);

    const name = parts.slice(7).join(" ");

    if (!name) continue;

    // Skip folders (they start with d)
    if (line.startsWith("d")) continue;

    // Only music files
    if (!config.extensions.some((ext) => name.toLowerCase().endsWith(ext))) {
      continue;
    }

    const fullPath = `${currentDir}/${name}`;
    const relPath = path.relative(ANDROID_ROOT, fullPath);

    // Skip hidden/system
    if (relPath.startsWith(".")) continue;

    files.push({
      path: relPath,
      fullPath,
      size,
      mtime: 0, // ⚠️ we'll ignore mtime for now
    });
  }

  return files;
}
