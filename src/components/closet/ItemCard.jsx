import { Link } from 'react-router-dom';
import { Shirt, Repeat } from 'lucide-react';
import { categoryLabel } from '../../constants/categories.js';

export default function ItemCard({ item }) {
  return (
    <Link
      to={`/closet/${item.id}`}
      className="card overflow-hidden group hover:shadow-md transition-all duration-200"
    >
      <div className="aspect-square bg-lavender-50 relative overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lavender-300">
            <Shirt size={36} />
          </div>
        )}
        {item.status !== 'active' && (
          <div className="absolute top-2 left-2 chip bg-white/90 text-lavender-700 capitalize">
            {item.status}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="font-medium text-sm text-lavender-800 truncate">{item.name || 'Untitled'}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-lavender-500 truncate">{categoryLabel(item.category)}</span>
          <div className="flex items-center gap-1">
            {(item.color || []).slice(0, 3).map((c, idx) => (
              <span
                key={idx}
                className="inline-block w-3 h-3 rounded-full border border-lavender-100"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-lavender-500">
          <Repeat size={12} />
          <span>{item.wearCount || 0} wears</span>
        </div>
      </div>
    </Link>
  );
}

export function ItemListRow({ item }) {
  return (
    <Link
      to={`/closet/${item.id}`}
      className="card p-3 flex gap-3 items-center hover:shadow-md transition-all duration-200"
    >
      <div className="w-16 h-16 rounded-xl bg-lavender-50 overflow-hidden shrink-0">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lavender-300">
            <Shirt size={20} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-lavender-800 truncate">{item.name || 'Untitled'}</div>
        <div className="text-xs text-lavender-500 truncate">
          {categoryLabel(item.category)} {item.brand && `• ${item.brand}`}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {(item.color || []).slice(0, 3).map((c, idx) => (
            <span
              key={idx}
              className="inline-block w-3 h-3 rounded-full border border-lavender-100"
              style={{ background: c }}
            />
          ))}
          <span className="text-xs text-lavender-500">{item.wearCount || 0} wears</span>
        </div>
      </div>
    </Link>
  );
}
