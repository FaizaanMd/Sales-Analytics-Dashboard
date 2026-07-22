import { Filter } from 'lucide-react';

export interface FilterState {
  category: string;
  region: string;
  channel: string;
  month: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  categories: string[];
  regions: string[];
  channels: string[];
  months: { value: string; label: string }[];
}

const selectCls =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

export function FilterBar({ filters, onChange, categories, regions, channels, months }: FilterBarProps) {
  const update = (key: keyof FilterState, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Filter size={16} className="text-blue-500" />
        Filters
      </div>
      <div className="h-6 w-px bg-slate-200" />

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500">Category</label>
        <select className={selectCls} value={filters.category} onChange={(e) => update('category', e.target.value)}>
          <option value="All">All</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500">Region</label>
        <select className={selectCls} value={filters.region} onChange={(e) => update('region', e.target.value)}>
          <option value="All">All</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500">Channel</label>
        <select className={selectCls} value={filters.channel} onChange={(e) => update('channel', e.target.value)}>
          <option value="All">All</option>
          {channels.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500">Month</label>
        <select className={selectCls} value={filters.month} onChange={(e) => update('month', e.target.value)}>
          <option value="All">All</option>
          {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      {(filters.category !== 'All' || filters.region !== 'All' || filters.channel !== 'All' || filters.month !== 'All') && (
        <button
          onClick={() => onChange({ category: 'All', region: 'All', channel: 'All', month: 'All' })}
          className="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          Reset
        </button>
      )}
    </div>
  );
}
