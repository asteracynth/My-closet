import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2, Loader2, Shirt, Repeat } from 'lucide-react';
import { getOutfit } from '../../db/outfitsDB.js';
import { useOutfits } from '../../hooks/useOutfits.js';
import { useItems } from '../../hooks/useItems.js';
import { useWearLog } from '../../hooks/useWearLog.js';
import { useToast } from '../../hooks/useToast.jsx';
import PageHeader from '../shared/PageHeader.jsx';
import { ConfirmModal } from '../shared/Modal.jsx';
import { todayISO, formatDate } from '../../utils/format.js';

export default function OutfitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { removeOutfit } = useOutfits();
  const { items, refresh } = useItems();
  const { addLog } = useWearLog();
  const { push } = useToast();

  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getOutfit(id);
      setOutfit(data);
      setLoading(false);
    })();
  }, [id]);

  async function handleDelete() {
    await removeOutfit(id);
    push('Outfit deleted', 'success');
    navigate('/outfits');
  }

  async function logToday() {
    setLogging(true);
    try {
      await addLog({ date: todayISO(), itemIds: outfit.itemIds, outfitId: outfit.id });
      await refresh();
      push('Logged outfit today', 'success');
    } catch (err) {
      push('Could not log outfit', 'error');
    } finally {
      setLogging(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-lavender-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!outfit) {
    return (
      <div className="card p-10 text-center">
        <h3 className="font-semibold text-lavender-700 mb-2">Outfit not found</h3>
        <Link to="/outfits" className="btn-primary">Back to outfits</Link>
      </div>
    );
  }

  const outfitItems = outfit.itemIds
    .map((iid) => items.find((i) => i.id === iid))
    .filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={outfit.name || 'Outfit'}
        subtitle={`${outfit.occasion || '—'} ${outfit.season ? `• ${outfit.season}` : ''}`}
        backTo="/outfits"
        actions={
          <>
            <Link to={`/outfits/${id}/edit`} className="btn-secondary !px-3"><Edit size={16} /></Link>
            <button className="btn-danger !px-3" onClick={() => setConfirmOpen(true)}><Trash2 size={16} /></button>
          </>
        }
      />

      <div className="card p-4 sm:p-5 mb-4">
        <button className="btn-primary w-full" onClick={logToday} disabled={logging}>
          {logging ? <Loader2 className="animate-spin" size={16} /> : <Repeat size={16} />}
          Log this outfit today
        </button>
        <p className="text-xs text-lavender-400 mt-2 text-center">
          Created {formatDate(outfit.createdAt)}
        </p>
      </div>

      <div className="card p-4 sm:p-5">
        <h3 className="font-semibold text-lavender-700 mb-3">Items ({outfitItems.length})</h3>
        {outfitItems.length === 0 ? (
          <p className="text-sm text-lavender-500">No items in this outfit</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {outfitItems.map((i) => (
              <Link key={i.id} to={`/closet/${i.id}`} className="card overflow-hidden">
                <div className="aspect-square bg-lavender-50">
                  {i.imageUrl ? (
                    <img src={i.imageUrl} alt={i.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lavender-300">
                      <Shirt size={28} />
                    </div>
                  )}
                </div>
                <div className="p-2 text-xs font-medium text-lavender-800 truncate">{i.name}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {outfit.notes && (
        <div className="card p-4 sm:p-5 mt-4">
          <h3 className="font-semibold text-lavender-700 mb-2">Notes</h3>
          <p className="text-sm text-lavender-700 whitespace-pre-wrap">{outfit.notes}</p>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete this outfit?"
        description="This won't delete the underlying items."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
