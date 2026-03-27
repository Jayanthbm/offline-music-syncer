/**
 * Convert file list → Map
 */
export function buildMap(files) {
  const map = new Map();

  for (const file of files) {
    map.set(file.path, file);
  }

  return map;
}
