import path from "path";
import cliProgress from "cli-progress";
import chalk from "chalk";
import { adb } from "../adb/adb.js";
import { pushWithTar } from "./tarPush.js";

/**
 * Format bytes → human readable
 */
function formatBytes(bytes) {
  const sizes = ["B", "KB", "MB", "GB"];
  if (!bytes) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

function shortName(filePath) {
  return filePath.split("/").pop();
}

/**
 * Apply sync changes
 */
export async function applyChanges(device, diff, options = {}) {
  const { toAdd, toUpdate, toDelete } = diff;

  const { dryRun = false, macRoot, androidRoot, mode = "sequential" } = options;

  const pushList = [...toAdd, ...toUpdate];

  const totalBytes = pushList.reduce((sum, f) => sum + f.size, 0);

  const totalFiles = pushList.length;

  if (totalFiles + toDelete.length === 0) {
    console.log("\n✅ Already in sync\n");
    return;
  }

  console.log(chalk.cyan(`\nMode: ${mode.toUpperCase()}\n`));

  const startTime = Date.now();

  /**
   * Progress bar (single-line only)
   */
  const bar = new cliProgress.SingleBar(
    {
      format:
        "Progress |{bar}| {percentage}% | {file} | {files}/{totalFiles} | {speed}/s",
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  );

  let transferred = 0;
  let completedFiles = 0;

  let lastTime = Date.now();
  let lastBytes = 0;

  /**
   * DELETE (silent)
   */
  if (toDelete.length && !dryRun) {
    await Promise.all(
      toDelete.map((file) => adb(device, ["shell", `rm "${file.fullPath}"`])),
    );
  }

  /**
   * TAR MODE
   */
  if (pushList.length && mode === "tar") {
    bar.start(totalBytes || 1, 0, {
      files: 0,
      totalFiles,
      speed: "0 MB",
    });

    if (!dryRun) {
      const start = Date.now();

      await pushWithTar(device, pushList, macRoot, androidRoot);

      const duration = (Date.now() - start) / 1000;
      const speed = totalBytes / (duration || 1);

      transferred = totalBytes;
      completedFiles = totalFiles;

      bar.update(totalBytes, {
        file: "Batch transfer",
        files: completedFiles,
        totalFiles,
        speed: formatBytes(speed),
      });
    }
  }

  /**
   * SEQUENTIAL MODE
   */
  if (pushList.length && mode === "sequential") {
    bar.start(totalBytes || 1, 0, {
      file: "-",
      files: 0,
      totalFiles,
      speed: "0 MB",
    });

    for (const file of pushList) {
      const targetPath = path.posix.join(androidRoot, file.path);

      const dir = path.posix.dirname(targetPath);

      if (!dryRun) {
        await adb(device, ["shell", `mkdir -p "${dir}"`]);

        await adb(device, ["push", file.fullPath, targetPath]);
      }

      transferred += file.size;
      completedFiles++;

      const now = Date.now();
      const elapsed = (now - lastTime) / 1000;

      let speed = 0;

      if (elapsed > 0) {
        speed = (transferred - lastBytes) / elapsed;
        lastTime = now;
        lastBytes = transferred;
      }

      bar.update(transferred, {
        file: shortName(file.path),
        files: completedFiles,
        totalFiles,
        speed: formatBytes(speed),
      });
    }
  }

  /**
   * Stop progress bar BEFORE logging
   */
  bar.stop();

  /**
   * Final summary
   */
  const totalTime = (Date.now() - startTime) / 1000;
  const avgSpeed = totalBytes / (totalTime || 1);

  console.log(chalk.green("\n✅ Sync completed\n"));
  console.log(`${chalk.gray("Transferred:")} ${formatBytes(totalBytes)}`);
  console.log(`${chalk.gray("Files      :")} ${totalFiles}`);
  console.log(`${chalk.gray("Time       :")} ${totalTime.toFixed(2)}s`);
  console.log(`${chalk.gray("Avg Speed  :")} ${formatBytes(avgSpeed)}/s\n`);
}
