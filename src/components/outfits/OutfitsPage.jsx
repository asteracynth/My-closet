import { Link } from 'react-router-dom';
import { Plus, Layers } from 'lucide-react';
import { useItems } from '../../hooks/useItems.js';
import { useOutfits } from '../../hooks/useOutfits.js';
import PageHeader from '../shared/PageHeader.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import OutfitCard from './OutfitCard.jsx';

export default function OutfitsPage() {
  const { outfits, loading } = useOutfits();
  const { items } = useItems();

  return (
    <div>
      <PageHeader
        title="Outfits"
        subtitle={`${outfits.length} saved`}
        actions={
          <Link to="/outfits/add" className="btn-primary">
            <Plus size={18} /> Create
          </Link>
        }
      />

      {loading ? (
        <div className="text-sm text-lavender-500">Loading…</div>
      ) : outfits.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No outfits yet"
          description="Combine items from your closet into outfits to plan your looks."
          action={
            <Link to="/outfits/add" className="btn-primary">
              <Plus size={16} /> Create first outfit
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {outfits
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
            .map((o) => (
              <OutfitCard key={o.id} outfit={o} items={items} />
            ))}
        </div>
      )}
    </div>
  );
}
