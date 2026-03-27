import { execa } from "execa";
import chalk from "chalk";
import { selectFromList } from "../utils/prompt.js";

/**
 * Get connected Android devices (robust parsing)
 */
export async function getDevices() {
  try {
    const { stdout } = await execa("adb", ["devices"]);

    const lines = stdout
      .split("\n")
      .slice(1) // skip header
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("*")); // remove empty + daemon logs

    const devices = [];

    for (const line of lines) {
      // Example formats:
      // 192.168.31.140:5555 device
      // emulator-5554 device
      // XYZ unauthorized

      const parts = line.split(/\s+/);

      const id = parts[0];
      const status = parts[1];

      if (status === "device") {
        devices.push(id);
      }
    }

    return devices;
  } catch (err) {
    console.log(chalk.red("❌ Failed to run adb. Is it installed?"));
    throw err;
  }
}

/**
 * Resolve which device to use
 */
export async function resolveDevice(preferredDevice) {
  const devices = await getDevices();

  // Debug (can remove later)
  // console.log("Devices detected:", devices);

  if (devices.length === 0) {
    console.log(chalk.red("❌ No Android devices connected"));
    process.exit(1);
  }

  // If user passed --device
  if (preferredDevice) {
    if (!devices.includes(preferredDevice)) {
      console.log(chalk.red(`❌ Device not found: ${preferredDevice}`));
      console.log(chalk.yellow("Available devices:"));
      devices.forEach((d) => console.log(`- ${d}`));
      process.exit(1);
    }

    return preferredDevice;
  }

  // If only one device → auto select
  if (devices.length === 1) {
    console.log(chalk.green(`Using device: ${devices[0]}`));
    return devices[0];
  }

  // Multiple devices → prompt user
  const selected = await selectFromList(
    "Select Android device:",
    devices
  );

  if (!selected) {
    console.log(chalk.red("❌ No device selected"));
    process.exit(1);
  }

  console.log(chalk.green(`Using device: ${selected}`));

  return selected;
}

/**
 * CLI: list devices
 */
export async function listDevices() {
  const devices = await getDevices();

  if (devices.length === 0) {
    console.log(chalk.red("❌ No devices connected"));
    return;
  }

  console.log(chalk.green("Connected devices:\n"));

  devices.forEach((d, i) => {
    console.log(`${i + 1}. ${d}`);
  });
}
