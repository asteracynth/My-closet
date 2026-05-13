import { supabase } from '../lib/supabase.js';
import { rowToItem, itemToRow } from './mappers.js';
import { deleteImage } from './storage.js';

async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

export async function getAllItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToItem);
}

export async function getItem(id) {
  const { data, error } = await supabase.from('items').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToItem(data) : null;
}

export async function createItem(input) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');
  const row = itemToRow(input, userId);
  const { data, error } = await supabase.from('items').insert(row).select().single();
  if (error) throw error;
  return rowToItem(data);
}

export async function updateItem(id, patch) {
  const row = itemToRow(patch);
  // strip user_id from row to be safe (RLS still enforces ownership)
  delete row.user_id;
  const { data, error } = await supabase
    .from('items')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToItem(data);
}

export async function deleteItem(id) {
  // Fetch image path first so we can clean up the file from Storage too.
  const { data: existing } = await supabase
    .from('items')
    .select('image_path')
    .eq('id', id)
    .maybeSingle();
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
  if (existing?.image_path) await deleteImage(existing.image_path);
}

export async function incrementWearForItems(itemIds, date) {
  if (!itemIds || itemIds.length === 0) return;
  const { error } = await supabase.rpc('increment_wear_for_items', {
    p_item_ids: itemIds,
    p_date: date,
  });
  if (error) throw error;
}

export async function bulkPutItems(items) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');
  const rows = items.map((it) => ({
    ...itemToRow(it, userId),
    id: it.id,
    wear_count: it.wearCount || 0,
    last_worn_date: it.lastWornDate || null,
  }));
  const { error } = await supabase.from('items').upsert(rows);
  if (error) throw error;
}

export async function clearItems() {
  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');
  // grab all paths first to delete files
  const { data: rows } = await supabase.from('items').select('image_path').eq('user_id', userId);
  const paths = (rows ?? []).map((r) => r.image_path).filter(Boolean);
  const { error } = await supabase.from('items').delete().eq('user_id', userId);
  if (error) throw error;
  if (paths.length > 0) {
    await supabase.storage.from('closet-images').remove(paths);
  }
}
