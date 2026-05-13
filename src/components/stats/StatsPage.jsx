import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend,
} from 'recharts';
import { Wallet, Shirt, TrendingUp, AlertCircle } from 'lucide-react';
import PageHeader from '../shared/PageHeader.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import { useItems } from '../../hooks/useItems.js';
import { useWearLog } from '../../hooks/useWearLog.js';
import {
  totalValue,
  mostWornItem,
  leastWornActiveItem,
  categoryDistribution,
  colorDistribution,
  topWornItems,
  spendingOverTime,
  seasonDistribution,
  occasionDistribution,
  topValueItems,
  worstValueItems,
  itemsWornThisMonth,
  itemsNeverWorn,
  activeItems,
} from '../../utils/statsUtils.js';
import { PASTEL_PALETTE } from '../../constants/categories.js';
import { formatVND } from '../../utils/format.js';

export default function StatsPage() {
  const { items, loading } = useItems();
  const { logs } = useWearLog();

  const data = useMemo(() => {
    if (loading) return null;
    return {
      totalActive: activeItems(items).length,
      totalValue: totalValue(items),
      mostWorn: mostWornItem(items),
      leastWorn: leastWornActiveItem(items),
      thisMonth: itemsWornThisMonth(logs),
      neverWorn: itemsNeverWorn(items),
      catDist: categoryDistribution(items),
      colorDist: colorDistribution(items),
      topWorn: topWornItems(items, 10),
      spending: spendingOverTime(items),
      seasonDist: seasonDistribution(items),
      occasionDist: occasionDistribution(items),
      bestValue: topValueItems(items, 5),
      worstValue: worstValueItems(items, 5),
    };
  }, [items, logs, loading]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Statistics" />
        <div className="text-sm text-lavender-500">Loading…</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Statistics" />
        <EmptyState
          icon={TrendingUp}
          title="Nothing to analyze yet"
          description="Add a few items and log some wears to unlock insights."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Statistics" subtitle="Insights from your wardrobe" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard icon={Shirt} label="Active items" value={data.totalActive} />
        <StatCard icon={Wallet} label="Estimated value" value={formatVND(data.totalValue)} />
        <StatCard
          icon={TrendingUp}
          label="Most worn"
          value={data.mostWorn ? `${data.mostWorn.wearCount || 0}×` : '—'}
          sub={data.mostWorn?.name}
        />
        <StatCard
          icon={AlertCircle}
          label="Never worn"
          value={data.neverWorn}
          sub={data.leastWorn?.name}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Category distribution">
          {data.catDist.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.catDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  label={(d) => `${d.name} (${d.value})`}
                  labelLine={false}
                  fontSize={11}
                >
                  {data.catDist.map((_, idx) => (
                    <Cell key={idx} fill={PASTEL_PALETTE[idx % PASTEL_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Top colors">
          {data.colorDist.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-2">
              {data.colorDist.map((c) => {
                const max = data.colorDist[0].value;
                const pct = (c.value / max) * 100;
                return (
                  <div key={c.color} className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full border border-lavender-200 shrink-0"
                      style={{ background: c.color }}
                    />
                    <div className="flex-1 bg-lavender-50 rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-lavender-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-lavender-600 w-6 text-right">{c.value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Most worn items">
          {data.topWorn.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.topWorn} layout="vertical" margin={{ left: 0, right: 16 }}>
                <CartesianGrid stroke="#f3edff" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} fontSize={11} stroke="#7e57d8" />
                <Tooltip />
                <Bar dataKey="value" fill="#9b76f0" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {data.spending.length >= 3 ? (
          <Card title="Spending over time">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.spending}>
                <CartesianGrid stroke="#f3edff" />
                <XAxis dataKey="month" fontSize={11} stroke="#7e57d8" />
                <YAxis fontSize={11} stroke="#7e57d8" />
                <Tooltip formatter={(v) => formatVND(v)} />
                <Line type="monotone" dataKey="value" stroke="#f25478" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ) : (
          <Card title="Spending over time">
            <Empty text="Add purchase dates and prices to at least 3 items." />
          </Card>
        )}

        <Card title="Season distribution">
          {data.seasonDist.length === 0 ? <Empty /> : <DonutChart data={data.seasonDist} />}
        </Card>

        <Card title="Occasion distribution">
          {data.occasionDist.length === 0 ? <Empty /> : <DonutChart data={data.occasionDist} />}
        </Card>

        <Card title="Best value (lowest cost per wear)">
          <ValueList items={data.bestValue} />
        </Card>

        <Card title="Worst value (highest cost per wear)">
          <ValueList items={data.worstValue} />
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-lavender-500 mb-1">
        <Icon size={14} /> {label}
      </div>
      <div className="text-xl font-semibold text-lavender-700 truncate">{value}</div>
      {sub && <div className="text-xs text-lavender-500 truncate mt-0.5">{sub}</div>}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="card p-4 sm:p-5">
      <h3 className="font-semibold text-lavender-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function DonutChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={70}
          innerRadius={45}
          fontSize={11}
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={PASTEL_PALETTE[idx % PASTEL_PALETTE.length]} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ValueList({ items }) {
  if (!items.length) return <Empty text="Log some wears with priced items first." />;
  return (
    <ol className="space-y-2">
      {items.map((i, idx) => (
        <li key={i.id} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-lavender-400">{idx + 1}.</span>
            <span className="truncate text-lavender-700">{i.name}</span>
          </div>
          <span className="text-lavender-600 font-medium">{formatVND(i.cpw)}</span>
        </li>
      ))}
    </ol>
  );
}

function Empty({ text = 'No data yet' }) {
  return <div className="text-sm text-lavender-400 text-center py-6">{text}</div>;
}
