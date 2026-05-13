import { useMemo, useState } from 'react';
import { Search, Check, Shirt } from 'lucide-react';
import { categoryLabel } from '../../constants/categories.js';

export default function ItemPicker({ items, selectedIds, onToggle }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.name, i.brand, categoryLabel(i.category), ...(i.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [items, query]);

  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-400" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your closet…"
          className="input-field pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-lavender-500 text-center py-6">No items found</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[420px] overflow-y-auto pr-1 scroll-hide">
          {filtered.map((it) => {
            const selected = selectedIds.includes(it.id);
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => onToggle(it.id)}
                className={
                  'relative aspect-square rounded-2xl overflow-hidden border-2 transition ' +
                  (selected ? 'border-lavender-500 ring-2 ring-lavender-200' : 'border-transparent')
                }
              >
                {it.imageUrl ? (
                  <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-lavender-50 text-lavender-300">
                    <Shirt size={20} />
                  </div>
                )}
                {selected && (
                  <span className="absolute top-1 right-1 w-6 h-6 rounded-full bg-lavender-500 text-white flex items-center justify-center">
                    <Check size={14} />
                  </span>
                )}
                <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent text-[10px] text-white px-2 py-1 truncate text-left">
                  {it.name || 'Untitled'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
