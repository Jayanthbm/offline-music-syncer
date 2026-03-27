import { spawn } from "child_process";

/**
 * Push files using tar streaming (NO BUFFER)
 */
export async function pushWithTar(device, files, macRoot, androidRoot) {
  return new Promise((resolve, reject) => {
    const relativePaths = files.map((f) => f.path);

    /**
     * macOS tar (disable metadata)
     */
    const tar = spawn(
      "tar",
      ["--no-xattrs", "--no-mac-metadata", "-cf", "-", ...relativePaths],
      {
        cwd: macRoot,
      },
    );

    /**
     * Android extract
     */
    const adb = spawn("adb", [
      "-s",
      device,
      "shell",
      `cd "${androidRoot}" && tar -xf -`,
    ]);

    /**
     * Pipe tar → adb
     */
    tar.stdout.pipe(adb.stdin);

    tar.stderr.on("data", () => {}); // ignore noise

    tar.on("error", reject);
    adb.on("error", reject);

    adb.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`adb exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}
