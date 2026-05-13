import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Shirt } from 'lucide-react';
import { useWearLog } from '../../hooks/useWearLog.js';
import { useItems } from '../../hooks/useItems.js';
import PageHeader from '../shared/PageHeader.jsx';
import Modal from '../shared/Modal.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import { formatDate, todayISO } from '../../utils/format.js';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function WearLogPage() {
  const { logs } = useWearLog();
  const { items } = useItems();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(null);

  const logsByDate = useMemo(() => {
    const map = new Map();
    for (const log of logs) {
      const arr = map.get(log.date) || [];
      arr.push(log);
      map.set(log.date, arr);
    }
    return map;
  }, [logs]);

  const days = useMemo(() => buildCalendar(cursor.year, cursor.month), [cursor]);

  const selectedLogs = selectedDate ? logsByDate.get(selectedDate) || [] : [];

  function navMonth(delta) {
    setCursor((c) => {
      const m = c.month + delta;
      const y = c.year + Math.floor(m / 12);
      return { year: y, month: ((m % 12) + 12) % 12 };
    });
  }

  return (
    <div>
      <PageHeader
        title="Wear Log"
        subtitle={`${logs.length} log${logs.length === 1 ? '' : 's'}`}
        actions={
          <Link to="/log/add" className="btn-primary">
            <Plus size={18} /> Log Today
          </Link>
        }
      />

      <div className="card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navMonth(-1)} className="p-2 rounded-xl hover:bg-lavender-50 text-lavender-600">
            <ChevronLeft size={20} />
          </button>
          <div className="font-semibold text-lavender-700">
            {MONTH_LABELS[cursor.month]} {cursor.year}
          </div>
          <button onClick={() => navMonth(1)} className="p-2 rounded-xl hover:bg-lavender-50 text-lavender-600">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-lavender-500 mb-2">
          {DAY_LABELS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((d, idx) => {
            const dateStr = d ? toISODate(cursor.year, cursor.month, d) : null;
            const has = dateStr && logsByDate.has(dateStr);
            const isToday = dateStr === todayISO();
            return (
              <button
                key={idx}
                disabled={!d}
                onClick={() => d && setSelectedDate(dateStr)}
                className={
                  'aspect-square rounded-2xl text-sm flex flex-col items-center justify-center transition ' +
                  (!d
                    ? 'opacity-0 pointer-events-none'
                    : has
                    ? 'bg-lavender-100 text-lavender-700 hover:bg-lavender-200'
                    : 'hover:bg-lavender-50 text-lavender-600') +
                  (isToday ? ' ring-2 ring-blush-300' : '')
                }
              >
                <span className="font-medium">{d}</span>
                {has && <span className="w-1.5 h-1.5 rounded-full bg-blush-400 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {logs.length === 0 && (
        <div className="mt-4">
          <EmptyState
            icon={CalendarDays}
            title="No wears logged yet"
            description="Track what you wear daily to see real usage stats."
            action={
              <Link to="/log/add" className="btn-primary">
                <Plus size={16} /> Log first wear
              </Link>
            }
          />
        </div>
      )}

      <Modal
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? formatDate(selectedDate) : ''}
      >
        {selectedLogs.length === 0 ? (
          <div className="text-sm text-lavender-500 text-center py-4">
            Nothing logged for this day.
          </div>
        ) : (
          <div className="space-y-4">
            {selectedLogs.map((log) => {
              const wornItems = (log.itemIds || [])
                .map((id) => items.find((i) => i.id === id))
                .filter(Boolean);
              return (
                <div key={log.id}>
                  <div className="grid grid-cols-3 gap-2">
                    {wornItems.map((i) => (
                      <Link
                        key={i.id}
                        to={`/closet/${i.id}`}
                        onClick={() => setSelectedDate(null)}
                        className="card overflow-hidden"
                      >
                        <div className="aspect-square bg-lavender-50">
                          {i.imageUrl ? (
                            <img src={i.imageUrl} alt={i.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lavender-300">
                              <Shirt size={20} />
                            </div>
                          )}
                        </div>
                        <div className="p-2 text-xs font-medium text-lavender-800 truncate">
                          {i.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                  {log.notes && (
                    <p className="text-xs text-lavender-500 mt-2">{log.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}

function buildCalendar(year, month) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = first.getDay();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toISODate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
