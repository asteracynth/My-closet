import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import PageHeader from '../shared/PageHeader.jsx';
import ImageUploader from './ImageUploader.jsx';
import ColorPicker from './ColorPicker.jsx';
import TagInput from './TagInput.jsx';
import { CATEGORIES, SEASONS, OCCASIONS, STATUSES } from '../../constants/categories.js';
import { getItem } from '../../db/itemsDB.js';
import { uploadImage, deleteImage } from '../../db/storage.js';
import { useItems } from '../../hooks/useItems.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.jsx';

const blankForm = {
  name: '',
  category: '',
  subcategory: '',
  color: [],
  brand: '',
  material: '',
  size: '',
  season: [],
  occasion: [],
  price: '',
  purchaseDate: '',
  tags: [],
  notes: '',
  imagePath: '',
  imageUrl: '',
  status: 'active',
};

export default function ItemForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { addItem, editItem } = useItems();
  const { user } = useAuth();
  const { push } = useToast();

  const [form, setForm] = useState(blankForm);
  const [imageBlob, setImageBlob] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const item = await getItem(id);
      if (item) {
        setForm({
          ...blankForm,
          ...item,
          price: item.price ? String(item.price) : '',
        });
      }
      setLoading(false);
    })();
  }, [id, isEdit]);

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.name.length > 100) e.name = 'Max 100 characters';
    if (!form.category) e.category = 'Category is required';
    const hasImage = !!imageBlob || !!form.imagePath;
    if (!hasImage) e.imageUrl = 'Photo is required';
    if (form.price !== '' && Number(form.price) < 0) e.price = 'Price must be ≥ 0';
    if (form.notes.length > 500) e.notes = 'Max 500 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      push('Please fix the errors below', 'error');
      return;
    }
    setSubmitting(true);
    try {
      // If a fresh image was picked, upload it first.
      let imagePath = form.imagePath;
      const oldPath = form.imagePath;
      if (imageBlob) {
        if (!user?.id) throw new Error('Not signed in');
        imagePath = await uploadImage(imageBlob, user.id);
      }

      const payload = {
        ...form,
        imagePath,
        name: form.name.trim(),
        price: form.price === '' ? 0 : Number(form.price),
      };

      let saved;
      if (isEdit) {
        saved = await editItem(id, payload);
        // Clean up the old image only after successful update with new path.
        if (imageBlob && oldPath && oldPath !== imagePath) {
          await deleteImage(oldPath);
        }
      } else {
        saved = await addItem(payload);
      }

      push(isEdit ? 'Item updated' : 'Item added', 'success');
      navigate(`/closet/${saved.id}`, { replace: true });
    } catch (err) {
      console.error(err);
      push(err.message || 'Could not save item', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-lavender-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title={isEdit ? 'Edit Item' : 'Add Item'} backTo={isEdit ? `/closet/${id}` : '/closet'} />

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="card p-4 sm:p-5">
          <ImageUploader
            previewUrl={form.imageUrl}
            onPick={(blob) => {
              setImageBlob(blob);
              setErrors((er) => ({ ...er, imageUrl: undefined }));
            }}
            onClear={() => {
              setImageBlob(null);
              update({ imagePath: '', imageUrl: '' });
            }}
            error={errors.imageUrl}
          />
        </div>

        <div className="card p-4 sm:p-5 space-y-4">
          <Field label="Name *" error={errors.name}>
            <input
              className="input-field"
              value={form.name}
              maxLength={100}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="e.g. White cotton tee"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category *" error={errors.category}>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => update({ category: e.target.value })}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} ({c.vi})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Subcategory">
              <input
                className="input-field"
                value={form.subcategory}
                onChange={(e) => update({ subcategory: e.target.value })}
                placeholder="e.g. T-shirt"
              />
            </Field>
          </div>

          <Field label="Color (up to 3)">
            <ColorPicker value={form.color} onChange={(v) => update({ color: v })} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Brand">
              <input
                className="input-field"
                value={form.brand}
                onChange={(e) => update({ brand: e.target.value })}
              />
            </Field>
            <Field label="Material">
              <input
                className="input-field"
                value={form.material}
                onChange={(e) => update({ material: e.target.value })}
                placeholder="e.g. Cotton"
              />
            </Field>
            <Field label="Size">
              <input
                className="input-field"
                value={form.size}
                onChange={(e) => update({ size: e.target.value })}
                placeholder="S/M/L or 38"
              />
            </Field>
            <Field label="Price (VND)" error={errors.price}>
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.price}
                onChange={(e) => update({ price: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Season">
            <MultiCheckbox
              options={SEASONS}
              value={form.season}
              onChange={(v) => update({ season: v })}
            />
          </Field>

          <Field label="Occasion">
            <MultiCheckbox
              options={OCCASIONS}
              value={form.occasion}
              onChange={(v) => update({ occasion: v })}
            />
          </Field>

          <Field label="Purchase date">
            <input
              type="date"
              className="input-field"
              value={form.purchaseDate}
              onChange={(e) => update({ purchaseDate: e.target.value })}
            />
          </Field>

          <Field label="Tags">
            <TagInput value={form.tags} onChange={(v) => update({ tags: v })} />
          </Field>

          <Field label="Notes" error={errors.notes}>
            <textarea
              className="input-field min-h-[80px]"
              maxLength={500}
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
            />
            <div className="text-xs text-lavender-400 text-right mt-1">{form.notes.length}/500</div>
          </Field>

          <Field label="Status">
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => {
                const active = form.status === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => update({ status: s.value })}
                    className={
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition ' +
                      (active
                        ? 'bg-lavender-500 border-lavender-500 text-white'
                        : 'bg-white border-lavender-200 text-lavender-600 hover:bg-lavender-50')
                    }
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="flex justify-end gap-2 sticky bottom-20 lg:bottom-4">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Saving…
              </>
            ) : (
              <>
                <Save size={16} /> {isEdit ? 'Save changes' : 'Add item'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-xs text-blush-600 mt-1">{error}</p>}
    </div>
  );
}

function MultiCheckbox({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() =>
              onChange(active ? value.filter((v) => v !== o.value) : [...value, o.value])
            }
            className={
              'px-3 py-1.5 rounded-full text-xs font-medium border transition capitalize ' +
              (active
                ? 'bg-lavender-500 border-lavender-500 text-white'
                : 'bg-white border-lavender-200 text-lavender-600 hover:bg-lavender-50')
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
