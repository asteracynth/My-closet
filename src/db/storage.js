import { supabase, IMAGE_BUCKET } from '../lib/supabase.js';

export function getPublicUrl(path) {
  if (!path) return '';
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadImage(blob, userId, ext = 'jpg') {
  if (!blob) throw new Error('No image blob provided');
  if (!userId) throw new Error('Must be signed in to upload');
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: false,
      cacheControl: '3600',
    });
  if (error) throw error;
  return path;
}

export async function deleteImage(path) {
  if (!path) return;
  try {
    await supabase.storage.from(IMAGE_BUCKET).remove([path]);
  } catch (err) {
    console.warn('[storage] could not delete image:', err);
  }
}
