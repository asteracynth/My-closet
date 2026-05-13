import { categoryLabel } from '../constants/categories.js';

export function activeItems(items) {
  return items.filter((i) => i.status === 'active');
}

export function totalValue(items) {
  return activeItems(items).reduce((sum, i) => sum + (Number(i.price) || 0), 0);
}

export function mostWornItem(items) {
  const sorted = [...items].sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0));
  return sorted[0] || null;
}

export function leastWornActiveItem(items) {
  const active = activeItems(items);
  if (active.length === 0) return null;
  return [...active].sort((a, b) => (a.wearCount || 0) - (b.wearCount || 0))[0];
}

export function categoryDistribution(items) {
  const map = new Map();
  for (const i of activeItems(items)) {
    map.set(i.category, (map.get(i.category) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([key, value]) => ({ name: categoryLabel(key), key, value }))
    .sort((a, b) => b.value - a.value);
}

export function colorDistribution(items, limit = 8) {
  const map = new Map();
  for (const i of activeItems(items)) {
    for (const c of i.color || []) {
      map.set(c, (map.get(c) || 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([color, value]) => ({ color, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function topWornItems(items, limit = 10) {
  return [...items]
    .filter((i) => (i.wearCount || 0) > 0)
    .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
    .slice(0, limit)
    .map((i) => ({
      name: i.name.length > 18 ? i.name.slice(0, 18) + '…' : i.name,
      fullName: i.name,
      value: i.wearCount || 0,
    }));
}

export function spendingOverTime(items) {
  const map = new Map();
  for (const i of items) {
    if (!i.purchaseDate || !i.price) continue;
    const month = i.purchaseDate.slice(0, 7);
    map.set(month, (map.get(month) || 0) + Number(i.price));
  }
  return Array.from(map.entries())
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function seasonDistribution(items) {
  const map = new Map();
  for (const i of activeItems(items)) {
    for (const s of i.season || []) {
      map.set(s, (map.get(s) || 0) + 1);
    }
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function occasionDistribution(items) {
  const map = new Map();
  for (const i of activeItems(items)) {
    for (const o of i.occasion || []) {
      map.set(o, (map.get(o) || 0) + 1);
    }
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function costPerWear(items) {
  return items
    .filter((i) => i.price > 0 && (i.wearCount || 0) > 0)
    .map((i) => ({
      id: i.id,
      name: i.name,
      cpw: i.price / i.wearCount,
      price: i.price,
      wearCount: i.wearCount,
    }));
}

export function topValueItems(items, limit = 5) {
  return [...costPerWear(items)].sort((a, b) => a.cpw - b.cpw).slice(0, limit);
}

export function worstValueItems(items, limit = 5) {
  return [...costPerWear(items)].sort((a, b) => b.cpw - a.cpw).slice(0, limit);
}

export function itemsWornThisMonth(wearLogs) {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const ids = new Set();
  for (const log of wearLogs) {
    if (log.date?.startsWith(ym)) {
      for (const id of log.itemIds || []) ids.add(id);
    }
  }
  return ids.size;
}

export function itemsNeverWorn(items) {
  return activeItems(items).filter((i) => (i.wearCount || 0) === 0).length;
}
