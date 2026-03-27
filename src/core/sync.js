import chalk from "chalk";
import ora from "ora";
import { resolveDevice } from "../adb/devices.js";
import { scanMac } from "../scan/mac.js";
import { scanAndroid } from "../scan/android.js";
import { buildMap } from "./map.js";
import { diffFiles } from "./diff.js";
import { applyChanges } from "./apply.js";
import { loadConfig } from "./config.js";

export async function runSync(options) {
  try {
    const config = loadConfig();

    const device = await resolveDevice(options.device);
    console.log(chalk.green(`✔ Using device: ${device}`));

    console.log(chalk.cyan("\nStarting sync...\n"));

    if (options.dryRun) {
      console.log(chalk.yellow("⚠ Running in DRY RUN mode\n"));
    }

    /**
     * Scan Mac
     */
    const macSpinner = ora("Scanning Mac files...").start();
    const macFiles = scanMac(config.macRoot, config);
    macSpinner.succeed(`Mac files: ${macFiles.length}`);

    /**
     * Scan Android
     */
    const androidSpinner = ora("Scanning Android files...").start();
    const androidFiles = await scanAndroid(device, config);
    androidSpinner.succeed(`Android files: ${androidFiles.length}`);

    /**
     * Diff
     */
    const diffSpinner = ora("Calculating changes...").start();

    const macMap = buildMap(macFiles);
    const androidMap = buildMap(androidFiles);

    const diff = diffFiles(macMap, androidMap);

    diffSpinner.succeed("Diff calculated");

    /**
     * Summary
     */
    console.log(chalk.yellow("\nSummary:"));
    console.log("ADD:", diff.toAdd.length);
    console.log("UPDATE:", diff.toUpdate.length);
    console.log("DELETE:", diff.toDelete.length);

    /**
     * Verbose output
     */
    if (options.verbose) {
      console.log("\nChanges:\n");

      diff.toAdd.forEach((f) => console.log("+", f.path));
      diff.toUpdate.forEach((f) => console.log("~", f.path));
      diff.toDelete.forEach((f) => console.log("-", f.path));
    }

    /**
     * Auto mode selection (based on push changes only)
     */
    const pushChanges = diff.toAdd.length + diff.toUpdate.length;

    const threshold = config.tarThreshold ?? 20;


    const mode = pushChanges > threshold ? "tar" : "sequential";

    console.log(chalk.cyan(`\nAuto-selected mode: ${mode.toUpperCase()}`));

    /**
     * Dry run exit
     */
    if (options.dryRun) {
      console.log(chalk.blue("\nDry run complete. No changes applied.\n"));
      return;
    }

    /**
     * Apply changes
     */
    await applyChanges(device, diff, {
      ...options,
      macRoot: config.macRoot,
      androidRoot: config.androidRoot,
      mode,
    });
  } catch (err) {
    console.error(chalk.red("\n❌ Sync failed:"), err.message);
    process.exit(1);
  }
}
