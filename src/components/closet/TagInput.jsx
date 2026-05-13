import { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ value, onChange }) {
  const [text, setText] = useState('');

  function add() {
    const t = text.trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
    setText('');
  }

  function onKey(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !text && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="rounded-2xl border border-lavender-200 bg-white p-2 flex flex-wrap gap-1.5">
      {value.map((t) => (
        <span key={t} className="chip">
          {t}
          <button
            type="button"
            onClick={() => onChange(value.filter((x) => x !== t))}
            className="text-lavender-500 hover:text-blush-500"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={value.length === 0 ? 'Type and press Enter' : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm px-2 py-1"
      />
    </div>
  );
}
