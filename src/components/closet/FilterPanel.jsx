import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { CATEGORIES, SEASONS, OCCASIONS, STATUSES, COMMON_COLORS } from '../../constants/categories.js';

function CheckboxList({ options, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              onChange(
                active ? selected.filter((v) => v !== opt.value) : [...selected, opt.value]
              )
            }
            className={
              'px-3 py-1.5 rounded-full text-xs font-medium border transition ' +
              (active
                ? 'bg-lavender-500 border-lavender-500 text-white'
                : 'bg-white border-lavender-200 text-lavender-600 hover:bg-lavender-50')
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function FilterPanel({ filters, setFilters }) {
  const [open, setOpen] = useState(false);
  const activeCount =
    filters.categories.length +
    filters.seasons.length +
    filters.occasions.length +
    filters.statuses.length +
    filters.colors.length;

  function reset() {
    setFilters({
      categories: [],
      seasons: [],
      occasions: [],
      statuses: [],
      colors: [],
    });
  }

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full p-3 sm:p-4 text-left"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-lavender-700">
          <Filter size={16} />
          Filters
          {activeCount > 0 && (
            <span className="chip bg-lavender-500 text-white">{activeCount}</span>
          )}
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="border-t border-lavender-100 p-4 space-y-4">
          <Section title="Category">
            <CheckboxList
              options={CATEGORIES}
              selected={filters.categories}
              onChange={(v) => setFilters({ ...filters, categories: v })}
            />
          </Section>
          <Section title="Season">
            <CheckboxList
              options={SEASONS}
              selected={filters.seasons}
              onChange={(v) => setFilters({ ...filters, seasons: v })}
            />
          </Section>
          <Section title="Occasion">
            <CheckboxList
              options={OCCASIONS}
              selected={filters.occasions}
              onChange={(v) => setFilters({ ...filters, occasions: v })}
            />
          </Section>
          <Section title="Status">
            <CheckboxList
              options={STATUSES}
              selected={filters.statuses}
              onChange={(v) => setFilters({ ...filters, statuses: v })}
            />
          </Section>
          <Section title="Color">
            <div className="flex flex-wrap gap-2">
              {COMMON_COLORS.map((c) => {
                const active = filters.colors.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        colors: active
                          ? filters.colors.filter((x) => x !== c)
                          : [...filters.colors, c],
                      })
                    }
                    className={
                      'w-7 h-7 rounded-full border-2 transition ' +
                      (active ? 'border-lavender-500 scale-110' : 'border-lavender-100')
                    }
                    style={{ background: c }}
                    aria-label={c}
                  />
                );
              })}
            </div>
          </Section>

          {activeCount > 0 && (
            <button onClick={reset} className="btn-ghost text-sm">
              <X size={14} /> Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-lavender-500 mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

export function ActiveFilterChips({ filters, setFilters }) {
  const chips = [];
  for (const v of filters.categories)
    chips.push({ key: 'cat-' + v, label: CATEGORIES.find((c) => c.value === v)?.label || v, remove: () => setFilters({ ...filters, categories: filters.categories.filter((x) => x !== v) }) });
  for (const v of filters.seasons)
    chips.push({ key: 'sea-' + v, label: v, remove: () => setFilters({ ...filters, seasons: filters.seasons.filter((x) => x !== v) }) });
  for (const v of filters.occasions)
    chips.push({ key: 'occ-' + v, label: v, remove: () => setFilters({ ...filters, occasions: filters.occasions.filter((x) => x !== v) }) });
  for (const v of filters.statuses)
    chips.push({ key: 'st-' + v, label: v, remove: () => setFilters({ ...filters, statuses: filters.statuses.filter((x) => x !== v) }) });
  for (const v of filters.colors)
    chips.push({ key: 'col-' + v, label: null, color: v, remove: () => setFilters({ ...filters, colors: filters.colors.filter((x) => x !== v) }) });

  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {chips.map((c) => (
        <span key={c.key} className="chip">
          {c.color && (
            <span className="w-3 h-3 rounded-full border border-lavender-200" style={{ background: c.color }} />
          )}
          {c.label && <span className="capitalize">{c.label}</span>}
          <button onClick={c.remove} className="text-lavender-500 hover:text-lavender-700">
            <X size={12} />
          </button>
        </span>
      ))}
    </div>
  );
}
