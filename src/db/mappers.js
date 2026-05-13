import { getPublicUrl } from './storage.js';

// ---------- items ----------

export function rowToItem(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name || '',
    category: row.category || '',
    subcategory: row.subcategory || '',
    color: row.color || [],
    brand: row.brand || '',
    material: row.material || '',
    season: row.season || [],
    occasion: row.occasion || [],
    size: row.size || '',
    price: Number(row.price) || 0,
    purchaseDate: row.purchase_date || '',
    tags: row.tags || [],
    notes: row.notes || '',
    imagePath: row.image_path || '',
    imageUrl: row.image_path ? getPublicUrl(row.image_path) : '',
    status: row.status || 'active',
    wearCount: row.wear_count || 0,
    lastWornDate: row.last_worn_date || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function itemToRow(data, userId) {
  const row = {
    name: data.name ?? '',
    category: data.category ?? '',
    subcategory: data.subcategory ?? '',
    color: data.color ?? [],
    brand: data.brand ?? '',
    material: data.material ?? '',
    season: data.season ?? [],
    occasion: data.occasion ?? [],
    size: data.size ?? '',
    price: Number(data.price) || 0,
    purchase_date: data.purchaseDate || null,
    tags: data.tags ?? [],
    notes: data.notes ?? '',
    image_path: data.imagePath ?? '',
    status: data.status ?? 'active',
  };
  if (userId) row.user_id = userId;
  return row;
}

// ---------- outfits ----------

export function rowToOutfit(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name || '',
    itemIds: row.item_ids || [],
    occasion: row.occasion || '',
    season: row.season || '',
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function outfitToRow(data, userId) {
  const row = {
    name: data.name ?? '',
    item_ids: data.itemIds ?? [],
    occasion: data.occasion ?? '',
    season: data.season ?? '',
    notes: data.notes ?? '',
  };
  if (userId) row.user_id = userId;
  return row;
}

// ---------- wear logs ----------

export function rowToWearLog(row) {
  if (!row) return row;
  return {
    id: row.id,
    date: row.date,
    itemIds: row.item_ids || [],
    outfitId: row.outfit_id || null,
    notes: row.notes || '',
    createdAt: row.created_at,
  };
}

export function wearLogToRow(data, userId) {
  const row = {
    date: data.date,
    item_ids: data.itemIds ?? [],
    outfit_id: data.outfitId || null,
    notes: data.notes ?? '',
  };
  if (userId) row.user_id = userId;
  return row;
}
