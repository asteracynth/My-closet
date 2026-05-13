import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2, Plus, Layers, Repeat, Calendar, Loader2, Shirt } from 'lucide-react';
import { getItem } from '../../db/itemsDB.js';
import { useItems } from '../../hooks/useItems.js';
import { useWearLog } from '../../hooks/useWearLog.js';
import { useToast } from '../../hooks/useToast.jsx';
import PageHeader from '../shared/PageHeader.jsx';
import { ConfirmModal } from '../shared/Modal.jsx';
import { categoryLabel } from '../../constants/categories.js';
import { formatDate, formatVND, todayISO } from '../../utils/format.js';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { removeItem, refresh } = useItems();
  const { logs, addLog } = useWearLog();
  const { push } = useToast();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getItem(id);
      setItem(data);
      setLoading(false);
    })();
  }, [id]);

  async function handleDelete() {
    await removeItem(id);
    push('Item deleted', 'success');
    navigate('/closet');
  }

  async function logToday() {
    setLogging(true);
    try {
      await addLog({ date: todayISO(), itemIds: [id] });
      const data = await getItem(id);
      setItem(data);
      await refresh();
      push("Logged today's wear", 'success');
    } catch (err) {
      console.error(err);
      push('Could not log wear', 'error');
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

  if (!item) {
    return (
      <div className="card p-10 text-center">
        <h3 className="font-semibold text-lavender-700 mb-2">Item not found</h3>
        <Link to="/closet" className="btn-primary">Back to closet</Link>
      </div>
    );
  }

  const wearDates = logs
    .filter((l) => l.itemIds?.includes(id))
    .map((l) => l.date)
    .sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title={item.name || 'Item'} backTo="/closet" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card overflow-hidden">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full aspect-square object-cover" />
          ) : (
            <div className="aspect-square flex items-center justify-center text-lavender-300">
              <Shirt size={48} />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="card p-4">
            <div className="text-xs uppercase tracking-wide text-lavender-500 mb-1">Worn</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-lavender-700">{item.wearCount || 0}</span>
              <span className="text-sm text-lavender-500">times</span>
            </div>
            {item.lastWornDate && (
              <div className="text-xs text-lavender-500 mt-1">
                Last worn {formatDate(item.lastWornDate)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="btn-primary" onClick={logToday} disabled={logging}>
              {logging ? <Loader2 className="animate-spin" size={16} /> : <Repeat size={16} />}
              Log wear
            </button>
            <Link to={`/closet/${id}/edit`} className="btn-secondary justify-center">
              <Edit size={16} /> Edit
            </Link>
            <Link to={`/outfits/add?item=${id}`} className="btn-secondary justify-center">
              <Layers size={16} /> Add to outfit
            </Link>
            <button className="btn-danger" onClick={() => setConfirmOpen(true)}>
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="card p-4 sm:p-5 mt-4 space-y-3">
        <Section title="Category">{categoryLabel(item.category)}{item.subcategory ? ` • ${item.subcategory}` : ''}</Section>
        <Section title="Status"><span className="capitalize">{item.status}</span></Section>
        {item.brand && <Section title="Brand">{item.brand}</Section>}
        {item.material && <Section title="Material">{item.material}</Section>}
        {item.size && <Section title="Size">{item.size}</Section>}
        {item.color?.length > 0 && (
          <Section title="Colors">
            <div className="flex flex-wrap gap-2">
              {item.color.map((c) => (
                <span key={c} className="chip">
                  <span className="w-3 h-3 rounded-full border border-lavender-200" style={{ background: c }} />
                  <span className="uppercase text-[10px]">{c}</span>
                </span>
              ))}
            </div>
          </Section>
        )}
        {item.season?.length > 0 && (
          <Section title="Season">
            <div className="flex flex-wrap gap-1">
              {item.season.map((s) => <span key={s} className="chip capitalize">{s}</span>)}
            </div>
          </Section>
        )}
        {item.occasion?.length > 0 && (
          <Section title="Occasion">
            <div className="flex flex-wrap gap-1">
              {item.occasion.map((s) => <span key={s} className="chip capitalize">{s}</span>)}
            </div>
          </Section>
        )}
        {item.price > 0 && <Section title="Price">{formatVND(item.price)}</Section>}
        {item.purchaseDate && <Section title="Purchase date">{formatDate(item.purchaseDate)}</Section>}
        {item.tags?.length > 0 && (
          <Section title="Tags">
            <div className="flex flex-wrap gap-1">
              {item.tags.map((t) => <span key={t} className="chip">{t}</span>)}
            </div>
          </Section>
        )}
        {item.notes && <Section title="Notes"><p className="whitespace-pre-wrap">{item.notes}</p></Section>}
      </div>

      <div className="card p-4 sm:p-5 mt-4">
        <h3 className="font-semibold text-lavender-700 mb-3 flex items-center gap-2">
          <Calendar size={16} /> Wear history
        </h3>
        {wearDates.length === 0 ? (
          <p className="text-sm text-lavender-500">Not worn yet. Hit "Log wear" to record it.</p>
        ) : (
          <ul className="space-y-1 text-sm text-lavender-600">
            {wearDates.slice(0, 25).map((d, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                {formatDate(d)}
              </li>
            ))}
            {wearDates.length > 25 && (
              <li className="text-xs text-lavender-400 mt-2">+ {wearDates.length - 25} more</li>
            )}
          </ul>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete this item?"
        description="This will permanently remove the item from your closet."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
      <div className="w-32 shrink-0 text-xs uppercase tracking-wide text-lavender-500">
        {title}
      </div>
      <div className="text-lavender-800 flex-1">{children}</div>
    </div>
  );
}
