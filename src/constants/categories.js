export const CATEGORIES = [
  { value: 'tops', label: 'Tops', vi: 'Áo trên' },
  { value: 'bottoms', label: 'Bottoms', vi: 'Quần' },
  { value: 'dresses', label: 'Dresses & Skirts', vi: 'Váy/Đầm' },
  { value: 'outerwear', label: 'Outerwear', vi: 'Áo khoác' },
  { value: 'shoes', label: 'Shoes', vi: 'Giày dép' },
  { value: 'bags', label: 'Bags', vi: 'Túi xách' },
  { value: 'accessories', label: 'Accessories', vi: 'Phụ kiện' },
  { value: 'sportswear', label: 'Sportswear', vi: 'Đồ thể thao' },
  { value: 'sleepwear', label: 'Sleepwear', vi: 'Đồ ngủ' },
  { value: 'underwear', label: 'Underwear', vi: 'Đồ lót' },
];

export const SEASONS = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'winter', label: 'Winter' },
  { value: 'all-season', label: 'All-season' },
];

export const OCCASIONS = [
  { value: 'casual', label: 'Casual' },
  { value: 'work', label: 'Work' },
  { value: 'formal', label: 'Formal' },
  { value: 'sport', label: 'Sport' },
  { value: 'party', label: 'Party' },
];

export const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'donated', label: 'Donated' },
  { value: 'sold', label: 'Sold' },
  { value: 'damaged', label: 'Damaged' },
];

export const COMMON_COLORS = [
  '#000000', '#ffffff', '#9ca3af', '#7c2d12', '#dc2626',
  '#f97316', '#facc15', '#84cc16', '#16a34a', '#0ea5e9',
  '#2563eb', '#7c3aed', '#db2777', '#f9a8d4', '#fde68a',
  '#a78bfa', '#fb7185', '#86efac', '#fdba74', '#c084fc',
];

export const PASTEL_PALETTE = [
  '#9b76f0', '#f25478', '#5e955f', '#fb923c', '#0ea5e9',
  '#facc15', '#a78bfa', '#fb7185', '#86efac', '#fdba74',
];

export const categoryLabel = (value) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? value;
