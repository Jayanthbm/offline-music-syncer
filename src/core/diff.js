/**
 * Compare Mac vs Android
 */
export function diffFiles(macMap, androidMap) {
  const toAdd = [];
  const toUpdate = [];
  const toDelete = [];

  // ADD + UPDATE
  for (const [path, macFile] of macMap) {
    if (!androidMap.has(path)) {
      toAdd.push(macFile);
    } else {
      const androidFile = androidMap.get(path);

      const sizeChanged = macFile.size !== androidFile.size;
      // const timeChanged = Math.abs(macFile.mtime - androidFile.mtime) > 1000;
      const timeChanged = false; // ignore for now

      if (sizeChanged || timeChanged) {
        toUpdate.push(macFile);
      }
    }
  }

  // DELETE
  for (const [path, androidFile] of androidMap) {
    if (!macMap.has(path)) {
      toDelete.push(androidFile);
    }
  }

  return {
    toAdd,
    toUpdate,
    toDelete,
  };
}
