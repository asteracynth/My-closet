import { supabase } from '../lib/supabase.js';
import { rowToOutfit, outfitToRow } from './mappers.js';

async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

export async function getAllOutfits() {
  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToOutfit);
}

export async function getOutfit(id) {
  const { data, error } = await supabase.from('outfits').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToOutfit(data) : null;
}

export async function createOutfit(input) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('outfits')
    .insert(outfitToRow(input, userId))
    .select()
    .single();
  if (error) throw error;
  return rowToOutfit(data);
}

export async function updateOutfit(id, patch) {
  const row = outfitToRow(patch);
  delete row.user_id;
  const { data, error } = await supabase
    .from('outfits')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToOutfit(data);
}

export async function deleteOutfit(id) {
  const { error } = await supabase.from('outfits').delete().eq('id', id);
  if (error) throw error;
}

export async function bulkPutOutfits(outfits) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');
  const rows = outfits.map((o) => ({ ...outfitToRow(o, userId), id: o.id }));
  const { error } = await supabase.from('outfits').upsert(rows);
  if (error) throw error;
}

export async function clearOutfits() {
  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');
  const { error } = await supabase.from('outfits').delete().eq('user_id', userId);
  if (error) throw error;
}
