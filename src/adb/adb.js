import { execa } from "execa";

export async function adb(device, args) {
  const cmd = device ? ["-s", device, ...args] : args;

  try {
    const { stdout } = await execa("adb", cmd, {
      maxBuffer: 1024 * 1024 * 50,
      reject: false, // ✅ IMPORTANT: don't throw on non-zero exit
    });

    return stdout;
  } catch (err) {
    // fallback (rare)
    return err.stdout || "";
  }
}
