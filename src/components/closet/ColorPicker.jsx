import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { COMMON_COLORS } from '../../constants/categories.js';

const MAX = 3;

export default function ColorPicker({ value, onChange }) {
  const [custom, setCustom] = useState('#7c3aed');

  function toggle(c) {
    if (value.includes(c)) {
      onChange(value.filter((x) => x !== c));
    } else if (value.length < MAX) {
      onChange([...value, c]);
    }
  }

  function addCustom() {
    if (!/^#[0-9a-fA-F]{6}$/.test(custom)) return;
    if (value.includes(custom) || value.length >= MAX) return;
    onChange([...value, custom]);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1 chip"
            style={{ background: '#fff' }}
          >
            <span
              className="inline-block w-4 h-4 rounded-full border border-lavender-200"
              style={{ background: c }}
            />
            <span className="text-[10px] uppercase">{c}</span>
            <button onClick={() => toggle(c)} className="text-lavender-500 hover:text-blush-500">
              <X size={12} />
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <span className="text-xs text-lavender-400">Pick up to {MAX} colors</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {COMMON_COLORS.map((c) => {
          const active = value.includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              disabled={!active && value.length >= MAX}
              className={
                'w-7 h-7 rounded-full border-2 transition disabled:opacity-40 ' +
                (active ? 'border-lavender-500 scale-110' : 'border-lavender-100 hover:border-lavender-300')
              }
              style={{ background: c }}
              aria-label={c}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="w-10 h-10 rounded-xl border border-lavender-200 bg-white cursor-pointer"
        />
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="#7c3aed"
          className="input-field flex-1"
        />
        <button
          type="button"
          onClick={addCustom}
          className="btn-secondary text-sm !px-3"
          disabled={value.length >= MAX}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
