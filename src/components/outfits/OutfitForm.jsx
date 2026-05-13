import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import PageHeader from '../shared/PageHeader.jsx';
import ItemPicker from './ItemPicker.jsx';
import { useItems } from '../../hooks/useItems.js';
import { useOutfits } from '../../hooks/useOutfits.js';
import { getOutfit } from '../../db/outfitsDB.js';
import { useToast } from '../../hooks/useToast.jsx';
import { OCCASIONS, SEASONS } from '../../constants/categories.js';

const blank = {
  name: '',
  itemIds: [],
  occasion: '',
  season: '',
  notes: '',
};

export default function OutfitForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preItem = searchParams.get('item');

  const { items, loading: itemsLoading } = useItems();
  const { addOutfit, editOutfit } = useOutfits();
  const { push } = useToast();

  const [form, setForm] = useState(() => ({
    ...blank,
    itemIds: preItem ? [preItem] : [],
  }));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const data = await getOutfit(id);
      if (data) setForm({ ...blank, ...data });
      setLoading(false);
    })();
  }, [id, isEdit]);

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function toggle(itemId) {
    update({
      itemIds: form.itemIds.includes(itemId)
        ? form.itemIds.filter((x) => x !== itemId)
        : [...form.itemIds, itemId],
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required';
    if (form.itemIds.length === 0) err.itemIds = 'Pick at least one item';
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setSubmitting(true);
    try {
      const payload = { ...form, name: form.name.trim() };
      let saved;
      if (isEdit) saved = await editOutfit(id, payload);
      else saved = await addOutfit(payload);
      push(isEdit ? 'Outfit updated' : 'Outfit saved', 'success');
      navigate(`/outfits/${saved.id}`, { replace: true });
    } catch (err) {
      push('Could not save outfit', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || itemsLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-lavender-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const selectedItems = items.filter((i) => form.itemIds.includes(i.id));

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title={isEdit ? 'Edit Outfit' : 'Create Outfit'} backTo="/outfits" />

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="card p-4 sm:p-5 space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="e.g. Weekend brunch"
            />
            {errors.name && <p className="text-xs text-blush-600 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Occasion</label>
              <select
                className="input-field"
                value={form.occasion}
                onChange={(e) => update({ occasion: e.target.value })}
              >
                <option value="">—</option>
                {OCCASIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Season</label>
              <select
                className="input-field"
                value={form.season}
                onChange={(e) => update({ season: e.target.value })}
              >
                <option value="">—</option>
                {SEASONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input-field min-h-[60px]"
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
            />
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="label !mb-0">Pick items</label>
            <span className="text-xs text-lavender-500">{form.itemIds.length} selected</span>
          </div>
          <ItemPicker items={items} selectedIds={form.itemIds} onToggle={toggle} />
          {errors.itemIds && <p className="text-xs text-blush-600 mt-2">{errors.itemIds}</p>}
        </div>

        {selectedItems.length > 0 && (
          <div className="card p-4 sm:p-5">
            <div className="text-xs uppercase tracking-wide text-lavender-500 mb-2">
              Selected ({selectedItems.length})
            </div>
            <div className="flex gap-2 overflow-x-auto scroll-hide">
              {selectedItems.map((i) => (
                <div key={i.id} className="w-16 shrink-0 text-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-lavender-50">
                    {i.imageUrl ? (
                      <img src={i.imageUrl} alt={i.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="text-[10px] text-lavender-500 truncate mt-1">{i.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={() => navigate(-1)} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {isEdit ? 'Save changes' : 'Save outfit'}
          </button>
        </div>
      </form>
    </div>
  );
}
