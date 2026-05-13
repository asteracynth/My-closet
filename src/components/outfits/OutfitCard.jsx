import { Link } from 'react-router-dom';
import { Shirt } from 'lucide-react';

export default function OutfitCard({ outfit, items }) {
  const itemList = (outfit.itemIds || [])
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean);
  const slots = [...itemList.slice(0, 4)];
  while (slots.length < 4) slots.push(null);

  return (
    <Link
      to={`/outfits/${outfit.id}`}
      className="card overflow-hidden hover:shadow-md transition group"
    >
      <div className="grid grid-cols-2 aspect-square bg-lavender-50">
        {slots.map((it, idx) => (
          <div key={idx} className="border border-white/30 bg-lavender-50/50 overflow-hidden">
            {it?.imageUrl ? (
              <img
                src={it.imageUrl}
                alt={it.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lavender-300">
                <Shirt size={20} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-3">
        <div className="font-medium text-sm text-lavender-800 truncate">{outfit.name || 'Untitled'}</div>
        <div className="text-xs text-lavender-500 capitalize">
          {outfit.occasion || '—'} {outfit.season && `• ${outfit.season}`}
        </div>
      </div>
    </Link>
  );
}
