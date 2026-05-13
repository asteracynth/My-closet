import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import PageHeader from '../shared/PageHeader.jsx';
import ItemPicker from '../outfits/ItemPicker.jsx';
import { useItems } from '../../hooks/useItems.js';
import { useOutfits } from '../../hooks/useOutfits.js';
import { useWearLog } from '../../hooks/useWearLog.js';
import { useToast } from '../../hooks/useToast.jsx';
import { todayISO } from '../../utils/format.js';

export default function LogForm() {
  const navigate = useNavigate();
  const { items, refresh: refreshItems } = useItems();
  const { outfits } = useOutfits();
  const { addLog } = useWearLog();
  const { push } = useToast();

  const [date, setDate] = useState(todayISO());
  const [outfitId, setOutfitId] = useState('');
  const [itemIds, setItemIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function toggle(id) {
    setItemIds((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));
  }

  function applyOutfit(id) {
    setOutfitId(id);
    if (!id) return;
    const o = outfits.find((x) => x.id === id);
    if (o) setItemIds(o.itemIds || []);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (itemIds.length === 0) {
      push('Pick at least one item', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await addLog({ date, itemIds, outfitId: outfitId || null, notes });
      await refreshItems();
      push('Wear logged', 'success');
      navigate('/log', { replace: true });
    } catch (err) {
      push('Could not save log', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Log Wear" backTo="/log" />

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="card p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Apply outfit (optional)</label>
              <select
                value={outfitId}
                onChange={(e) => applyOutfit(e.target.value)}
                className="input-field"
              >
                <option value="">— None —</option>
                {outfits.map((o) => (
                  <option key={o.id} value={o.id}>{o.name || 'Untitled'}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field min-h-[60px]"
              placeholder="Where did you go, how did it feel…"
            />
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="label !mb-0">Items worn</label>
            <span className="text-xs text-lavender-500">{itemIds.length} selected</span>
          </div>
          <ItemPicker items={items} selectedIds={itemIds} onToggle={toggle} />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save log
          </button>
        </div>
      </form>
    </div>
  );
}
