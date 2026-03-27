#!/usr/bin/env node

import { Command } from "commander";
import { runSync } from "../src/core/sync.js";
import { listDevices } from "../src/adb/devices.js";

const program = new Command();

program
  .name("oms")
  .description("Offline Music Syncer (Mac → Android)")
  .version("1.0.0");

program
  .command("devices")
  .description("List connected Android devices")
  .action(async () => {
    await listDevices();
  });

program
  .command("sync")
  .description("Sync music from Mac to Android")
  .option("-d, --device <id>", "Specify device ID")
  .option("--dry-run", "Preview changes without applying")
  .option("-v, --verbose", "Show detailed changes")
  .action(async (options) => {
    await runSync(options);
  });

program.parse();
