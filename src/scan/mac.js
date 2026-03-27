import fs from "fs";
import path from "path";

/**
 * Scan Mac directory recursively
 */
export function scanMac(root, config) {
  const result = [];

  function walk(dir) {
    let items;

    try {
      items = fs.readdirSync(dir);
    } catch {
      return; // skip unreadable dirs
    }

    for (const item of items) {
      // skip hidden files/folders
      if (item.startsWith(".")) continue;
      if (item.startsWith("._")) continue;

      // skip ignored patterns
      if (config.ignore.some((i) => item.includes(i))) continue;

      const fullPath = path.join(dir, item);

      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      // ✅ ALWAYS recurse into directories
      if (stat.isDirectory()) {
        walk(fullPath);
        continue;
      }

      // ✅ Only filter AFTER confirming it's a file
      const lower = item.toLowerCase();

      const isValidExt = config.extensions.some((ext) => lower.endsWith(ext));

      if (!isValidExt) continue;

      let relPath = path.relative(root, fullPath);

      relPath = relPath.replace(/\\/g, "/").trim();

      result.push({
        path: relPath,
        fullPath,
        size: stat.size,
        mtime: stat.mtimeMs,
      });
    }
  }

  walk(root);

  return result;
}
