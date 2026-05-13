const MAX_WIDTH = 800;
const QUALITY = 0.82;

/**
 * Reads a user-supplied image file, scales it down to MAX_WIDTH if needed,
 * and returns a JPEG Blob ready to upload to storage.
 */
export async function compressImageFile(file) {
  if (!file) throw new Error('No file provided');
  if (!file.type.startsWith('image/')) throw new Error('File is not an image');

  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > MAX_WIDTH) {
    height = Math.round((MAX_WIDTH / width) * height);
    width = MAX_WIDTH;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Could not encode image'));
      },
      'image/jpeg',
      QUALITY
    );
  });
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
