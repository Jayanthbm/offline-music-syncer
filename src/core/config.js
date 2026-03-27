import fs from "fs";
import os from "os";
import path from "path";

export function loadConfig() {
  const configPath = path.resolve("oms.config.json");

  if (!fs.existsSync(configPath)) {
    throw new Error("❌ Missing oms.config.json in project root");
  }

  const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  return normalizeConfig(raw);
}

/**
 * Normalize + sanitize config
 */
function normalizeConfig(config) {
  const macRoot = config.macRoot.replace("~", os.homedir());

  return {
    macRoot,
    androidRoot: config.androidRoot,
    extensions: config.extensions || [".mp3", ".m4a"],
    ignore: config.ignore || [],
    tarThreshold: config.tarThreshold,
  };
}
