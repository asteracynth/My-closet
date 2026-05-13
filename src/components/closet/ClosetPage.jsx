import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Grid3x3, List, Shirt } from 'lucide-react';
import { useItems } from '../../hooks/useItems.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import PageHeader from '../shared/PageHeader.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import SkeletonCard, { SkeletonRow } from '../shared/SkeletonCard.jsx';
import ItemCard, { ItemListRow } from './ItemCard.jsx';
import FilterPanel, { ActiveFilterChips } from './FilterPanel.jsx';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'price-desc', label: 'Price (high)' },
  { value: 'price-asc', label: 'Price (low)' },
  { value: 'wear-desc', label: 'Most worn' },
  { value: 'wear-asc', label: 'Least worn' },
];

const EMPTY_FILTERS = {
  categories: [],
  seasons: [],
  occasions: [],
  statuses: [],
  colors: [],
};

export default function ClosetPage() {
  const { items, loading } = useItems();
  const [query, setQuery] = useState('');
  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('newest');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const debounced = useDebounce(query, 300);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    let list = items.filter((i) => {
      if (q) {
        const hay = [
          i.name,
          i.brand,
          ...(i.tags || []),
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.categories.length && !filters.categories.includes(i.category)) return false;
      if (filters.statuses.length && !filters.statuses.includes(i.status)) return false;
      if (filters.seasons.length && !i.season?.some((s) => filters.seasons.includes(s))) return false;
      if (filters.occasions.length && !i.occasion?.some((o) => filters.occasions.includes(o))) return false;
      if (filters.colors.length && !i.color?.some((c) => filters.colors.includes(c))) return false;
      return true;
    });
    list = sortItems(list, sort);
    return list;
  }, [items, debounced, filters, sort]);

  return (
    <div>
      <PageHeader
        title="Closet"
        subtitle={`${items.length} items in your wardrobe`}
        actions={
          <Link to="/closet/add" className="btn-primary hidden sm:inline-flex">
            <Plus size={18} /> Add Item
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-400" size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, brand, tag…"
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field flex-1 sm:flex-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="btn-secondary !px-3"
            aria-label="Toggle view"
            title="Toggle view"
          >
            {view === 'grid' ? <List size={18} /> : <Grid3x3 size={18} />}
          </button>
        </div>
      </div>

      <FilterPanel filters={filters} setFilters={setFilters} />
      <ActiveFilterChips filters={filters} setFilters={setFilters} />

      <div className="mt-4">
        {loading ? (
          view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <SkeletonCard count={8} />
            </div>
          ) : (
            <div className="space-y-2">
              <SkeletonRow count={5} />
            </div>
          )
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Shirt}
            title={items.length === 0 ? 'Your closet is empty' : 'No items match'}
            description={
              items.length === 0
                ? 'Start cataloging your wardrobe by adding your first piece.'
                : 'Try clearing your filters or search term.'
            }
            action={
              items.length === 0 ? (
                <Link to="/closet/add" className="btn-primary">
                  <Plus size={16} /> Add your first item
                </Link>
              ) : null
            }
          />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <ItemListRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <Link
        to="/closet/add"
        className="sm:hidden fixed bottom-20 right-4 w-14 h-14 rounded-full bg-lavender-500 text-white shadow-lg flex items-center justify-center z-20 active:scale-95 transition"
        aria-label="Add item"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}

function sortItems(list, sort) {
  const arr = [...list];
  switch (sort) {
    case 'newest':
      return arr.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    case 'oldest':
      return arr.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    case 'name-asc':
      return arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'price-desc':
      return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'price-asc':
      return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'wear-desc':
      return arr.sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0));
    case 'wear-asc':
      return arr.sort((a, b) => (a.wearCount || 0) - (b.wearCount || 0));
    default:
      return arr;
  }
}
