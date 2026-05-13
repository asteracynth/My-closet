import { supabase } from '../lib/supabase.js';
import { rowToWearLog, wearLogToRow } from './mappers.js';
import { incrementWearForItems } from './itemsDB.js';

async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

export async function getAllWearLogs() {
  const { data, error } = await supabase
    .from('wear_logs')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToWearLog);
}

export async function getWearLog(id) {
  const { data, error } = await supabase.from('wear_logs').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToWearLog(data) : null;
}

export async function getWearLogsByDate(date) {
  const { data, error } = await supabase.from('wear_logs').select('*').eq('date', date);
  if (error) throw error;
  return (data ?? []).map(rowToWearLog);
}

export async function getWearLogsForItem(itemId) {
  const all = await getAllWearLogs();
  return all.filter((log) => log.itemIds?.includes(itemId));
}

export async function createWearLog(input) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('wear_logs')
    .insert(wearLogToRow(input, userId))
    .select()
    .single();
  if (error) throw error;
  const log = rowToWearLog(data);
  if (log.itemIds.length > 0) {
    await incrementWearForItems(log.itemIds, log.date);
  }
  return log;
}

export async function deleteWearLog(id) {
  const { error } = await supabase.from('wear_logs').delete().eq('id', id);
  if (error) throw error;
}

export async function bulkPutWearLogs(logs) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');
  const rows = logs.map((l) => ({ ...wearLogToRow(l, userId), id: l.id }));
  const { error } = await supabase.from('wear_logs').upsert(rows);
  if (error) throw error;
}

export async function clearWearLogs() {
  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');
  const { error } = await supabase.from('wear_logs').delete().eq('user_id', userId);
  if (error) throw error;
}
