import { getAllItems, bulkPutItems, clearItems } from '../db/itemsDB.js';
import { getAllOutfits, bulkPutOutfits, clearOutfits } from '../db/outfitsDB.js';
import { getAllWearLogs, bulkPutWearLogs, clearWearLogs } from '../db/wearLogDB.js';

export async function exportAllData() {
  const [items, outfits, wearLogs] = await Promise.all([
    getAllItems(),
    getAllOutfits(),
    getAllWearLogs(),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
    outfits,
    wearLogs,
  };
}

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importDataFromJSON(json, { merge = false } = {}) {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid backup file');
  }
  const { items, outfits, wearLogs } = json;
  if (!Array.isArray(items) || !Array.isArray(outfits) || !Array.isArray(wearLogs)) {
    throw new Error('Backup is missing required collections');
  }
  if (!merge) {
    await Promise.all([clearItems(), clearOutfits(), clearWearLogs()]);
  }
  await Promise.all([
    bulkPutItems(items),
    bulkPutOutfits(outfits),
    bulkPutWearLogs(wearLogs),
  ]);
}

export function readFileAsJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch (err) {
        reject(new Error('File is not valid JSON'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
