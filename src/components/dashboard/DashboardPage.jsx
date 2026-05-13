import { Link } from 'react-router-dom';
import { Plus, CalendarDays, Shirt, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { useItems } from '../../hooks/useItems.js';
import { useOutfits } from '../../hooks/useOutfits.js';
import { useWearLog } from '../../hooks/useWearLog.js';
import { activeItems, itemsWornThisMonth, itemsNeverWorn } from '../../utils/statsUtils.js';
import { todayISO } from '../../utils/format.js';
import EmptyState from '../shared/EmptyState.jsx';

export default function DashboardPage() {
  const { items, loading } = useItems();
  const { outfits } = useOutfits();
  const { logs } = useWearLog();

  if (loading) {
    return <div className="text-sm text-lavender-500">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div>
        <Greeting />
        <EmptyState
          icon={Sparkles}
          title="Welcome to your closet"
          description="Start by adding a few wardrobe pieces, then track wears and build outfits."
          action={
            <Link to="/closet/add" className="btn-primary">
              <Plus size={16} /> Add first item
            </Link>
          }
        />
      </div>
    );
  }

  const totalActive = activeItems(items).length;
  const thisMonth = itemsWornThisMonth(logs);
  const neverWorn = itemsNeverWorn(items);

  const recent = [...items]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 5);

  const todayLogs = logs.filter((l) => l.date === todayISO());
  const todayItemIds = new Set();
  for (const log of todayLogs) for (const id of log.itemIds || []) todayItemIds.add(id);
  const todayItems = Array.from(todayItemIds)
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean);

  return (
    <div>
      <Greeting />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard icon={Shirt} label="Active items" value={totalActive} to="/closet" />
        <StatCard icon={Layers} label="Outfits" value={outfits.length} to="/outfits" />
        <StatCard icon={CalendarDays} label="Worn this month" value={thisMonth} to="/log" />
        <StatCard icon={AlertCircle} label="Never worn" value={neverWorn} to="/closet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Link to="/closet/add" className="card p-4 flex items-center gap-3 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-2xl bg-lavender-100 text-lavender-600 flex items-center justify-center">
            <Plus size={20} />
          </div>
          <div>
            <div className="font-semibold text-lavender-700">Add item</div>
            <div className="text-xs text-lavender-500">Catalog something new</div>
          </div>
        </Link>
        <Link to="/log/add" className="card p-4 flex items-center gap-3 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-2xl bg-blush-100 text-blush-600 flex items-center justify-center">
            <CalendarDays size={20} />
          </div>
          <div>
            <div className="font-semibold text-lavender-700">Log today's outfit</div>
            <div className="text-xs text-lavender-500">What did you wear?</div>
          </div>
        </Link>
        <Link to="/outfits/add" className="card p-4 flex items-center gap-3 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center">
            <Layers size={20} />
          </div>
          <div>
            <div className="font-semibold text-lavender-700">Create outfit</div>
            <div className="text-xs text-lavender-500">Plan a look</div>
          </div>
        </Link>
      </div>

      {todayItems.length > 0 && (
        <Section title="Worn today" link="/log">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {todayItems.map((i) => (
              <ItemTile key={i.id} item={i} />
            ))}
          </div>
        </Section>
      )}

      <Section title="Recently added" link="/closet">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {recent.map((i) => (
            <ItemTile key={i.id} item={i} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Greeting() {
  const hour = new Date().getHours();
  const g = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <div className="mb-4 sm:mb-6">
      <h1 className="text-2xl sm:text-3xl font-semibold text-lavender-700">{g} ✨</h1>
      <p className="text-sm text-lavender-500">Here's what's happening in your closet.</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, to }) {
  return (
    <Link to={to} className="card p-4 hover:shadow-md transition">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-lavender-500 mb-1">
        <Icon size={14} /> {label}
      </div>
      <div className="text-2xl font-semibold text-lavender-700">{value}</div>
    </Link>
  );
}

function ItemTile({ item }) {
  return (
    <Link to={`/closet/${item.id}`} className="card overflow-hidden block">
      <div className="aspect-square bg-lavender-50">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lavender-300">
            <Shirt size={20} />
          </div>
        )}
      </div>
      <div className="px-2 py-1.5 text-[11px] font-medium text-lavender-700 truncate">
        {item.name || 'Untitled'}
      </div>
    </Link>
  );
}

function Section({ title, link, children }) {
  return (
    <section className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-lavender-700">{title}</h2>
        {link && (
          <Link to={link} className="text-xs text-lavender-500 hover:text-lavender-700">
            View all →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
