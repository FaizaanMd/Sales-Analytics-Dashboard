import { useEffect, useMemo, useState } from 'react';
import {
  IndianRupee, ShoppingCart, Package, TrendingUp, Percent,
  RotateCcw, Users, LayoutDashboard, BarChart3, MapPin, Sparkles,
  Download, Loader2, AlertCircle,
} from 'lucide-react';
import {
  fetchDashboardData, applyFilters, formatINR, formatNum,
  type DashboardData,
} from '@/lib/analytics';
import { KpiCard } from '@/components/KpiCard';
import { FilterBar, type FilterState } from '@/components/FilterBar';
import { Panel, DataTable } from '@/components/Panel';
import { LineChart, BarChart, DonutChart, Heatmap } from '@/components/Charts';

type Tab = 'overview' | 'products' | 'customers' | 'regional';

export default function App() {
  const [raw, setRaw] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [filters, setFilters] = useState<FilterState>({ category: 'All', region: 'All', channel: 'All', month: 'All' });

  useEffect(() => {
    fetchDashboardData()
      .then((d) => { setRaw(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, []);

  const data = useMemo(() => raw ? applyFilters(raw, filters) : null, [raw, filters]);

  const filterProps = useMemo(() => {
    if (!raw) return null;
    const categories = [...new Set(raw.rows.map((r) => r.category))].sort();
    const regions = [...new Set(raw.rows.map((r) => r.region))].sort();
    const channels = [...new Set(raw.rows.map((r) => r.channel))].sort();
    const months = [...new Set(raw.rows.map((r) => r.month))].sort()
      .map((m) => ({ value: m, label: new Date(m + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) }));
    return { categories, regions, channels, months };
  }, [raw]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <p className="text-sm font-medium">Loading sales analytics…</p>
        </div>
      </div>
    );
  }

  if (error || !data || !filterProps) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-rose-600">
          <AlertCircle size={32} />
          <p className="text-sm font-medium">{error ?? 'Failed to load data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-[1400px] px-6 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md">
                <Sparkles size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Myntra Sales Analytics</h1>
                <p className="text-xs text-slate-400">Enterprise Retail Intelligence Dashboard · FY 2024</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Live Data
              </div>
              <button
                onClick={() => exportCsv(data)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
              >
                <Download size={15} />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-6">
        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {([
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Products & Brands', icon: BarChart3 },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'regional', label: 'Regional', icon: MapPin },
          ] as const).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mb-5">
          <FilterBar filters={filters} onChange={setFilters} {...filterProps} />
        </div>

        {/* KPI Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
          <KpiCard label="Total Revenue" value={formatINR(data.kpis.revenue)} sub={`${formatNum(data.kpis.orders)} orders`} icon={IndianRupee} accent="blue" trend={trend(data, 'revenue')} />
          <KpiCard label="Net Profit" value={formatINR(data.kpis.profit)} sub={`${data.kpis.profitMargin.toFixed(1)}% margin`} icon={TrendingUp} accent="green" trend={trend(data, 'profit')} />
          <KpiCard label="Avg Order Value" value={formatINR(data.kpis.avgOrderValue)} sub={`${formatNum(data.kpis.units)} units`} icon={ShoppingCart} accent="violet" />
          <KpiCard label="Units Sold" value={formatNum(data.kpis.units)} icon={Package} accent="cyan" />
          <KpiCard label="Avg Discount" value={`${data.kpis.avgDiscount.toFixed(1)}%`} icon={Percent} accent="amber" />
          <KpiCard label="Return Rate" value={`${data.kpis.returnRate.toFixed(1)}%`} icon={RotateCcw} accent="rose" />
        </div>

        {tab === 'overview' && <OverviewTab data={data} />}
        {tab === 'products' && <ProductsTab data={data} />}
        {tab === 'customers' && <CustomersTab data={data} />}
        {tab === 'regional' && <RegionalTab data={data} />}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <p className="text-center text-xs text-slate-400">
          Myntra Sales Analytics · Powered by Supabase · {formatNum(data.rows.length)} transaction records
        </p>
      </footer>
    </div>
  );
}

function trend(data: DashboardData, key: 'revenue' | 'profit'): number | undefined {
  if (data.monthly.length < 2) return undefined;
  const recent = data.monthly.slice(-3);
  const prev = data.monthly.slice(-6, -3);
  if (prev.length === 0) return undefined;
  const rSum = recent.reduce((s, m) => s + m[key], 0);
  const pSum = prev.reduce((s, m) => s + m[key], 0);
  if (pSum === 0) return undefined;
  return ((rSum - pSum) / pSum) * 100;
}

/* ---------- Overview Tab ---------- */
function OverviewTab({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Revenue & Profit Trend" subtitle="Monthly performance, FY 2024" className="lg:col-span-2">
          <LineChart
            data={data.monthly.map((m) => ({ label: m.monthLabel, value: m.revenue, value2: m.profit }))}
            showSecondary
            formatValue={formatINR}
            height={260}
          />
          <div className="mt-2 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-blue-600" /> Revenue</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-emerald-600" style={{ borderTop: '2px dashed' }} /> Profit</span>
          </div>
        </Panel>
        <Panel title="Revenue by Category" subtitle="Share of total sales">
          <DonutChart
            data={data.byCategory.map((c) => ({ label: c.label, value: c.revenue }))}
            formatValue={formatINR}
          />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Sales Channel" subtitle="Revenue distribution by channel">
          <BarChart data={data.byChannel.map((c) => ({ label: c.label, value: c.revenue }))} formatValue={formatINR} color="#2563eb" />
        </Panel>
        <Panel title="Payment Methods" subtitle="Transaction value by payment type">
          <DonutChart data={data.byPayment.map((p) => ({ label: p.label, value: p.revenue }))} formatValue={formatINR} />
        </Panel>
        <Panel title="Order Status" subtitle="Delivery status breakdown">
          <DonutChart data={data.byDelivery.map((d) => ({ label: d.label, value: d.orders }))} formatValue={formatNum} />
        </Panel>
      </div>

      <Panel title="Monthly Category Heatmap" subtitle="Revenue intensity by category × month">
        <Heatmap
          data={buildHeatmap(data)}
          formatValue={formatINR}
        />
      </Panel>
    </div>
  );
}

function buildHeatmap(data: DashboardData) {
  const cats = data.byCategory.map((c) => c.label);
  const months = data.monthly.map((m) => m.monthLabel);
  const cells: { row: string; col: string; value: number }[] = [];
  for (const cat of cats) {
    for (const m of months) {
      const monthKey = data.monthly.find((x) => x.monthLabel === m)?.month;
      if (!monthKey) continue;
      const val = data.rows
        .filter((r) => r.category === cat && r.month === monthKey)
        .reduce((s, r) => s + r.revenue, 0);
      cells.push({ row: cat, col: m, value: val });
    }
  }
  return cells;
}

/* ---------- Products Tab ---------- */
function ProductsTab({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Top 10 Products by Revenue" subtitle="Best-selling individual products">
          <BarChart
            data={data.topProducts.map((p) => ({ label: p.label, value: p.revenue }))}
            horizontal
            formatValue={formatINR}
            color="#16a34a"
            height={320}
          />
        </Panel>
        <Panel title="Top 12 Brands by Revenue" subtitle="Brand performance ranking">
          <BarChart
            data={data.byBrand.map((b) => ({ label: b.label, value: b.revenue }))}
            horizontal
            formatValue={formatINR}
            color="#2563eb"
            height={320}
          />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Category Performance" subtitle="Revenue, profit & units by category" className="lg:col-span-2">
          <DataTable
            headers={['Category', 'Revenue', 'Profit', 'Margin', 'Units', 'Orders']}
            align={['left', 'right', 'right', 'right', 'right', 'right']}
            rows={data.byCategory.map((c) => [
              c.label,
              formatINR(c.revenue),
              formatINR(c.profit),
              `${((c.profit / c.revenue) * 100).toFixed(1)}%`,
              formatNum(c.qty),
              formatNum(c.orders),
            ])}
          />
        </Panel>
        <Panel title="Return Rate by Category" subtitle="% of orders returned">
          <BarChart
            data={data.returnRateByCategory.map((c) => ({ label: c.label, value: c.revenue }))}
            formatValue={(n) => `${n.toFixed(1)}%`}
            color="#ef4444"
            height={240}
          />
        </Panel>
      </div>

      <Panel title="Brand Performance Detail" subtitle="Full breakdown of top brands">
        <DataTable
          headers={['Brand', 'Revenue', 'Profit', 'Margin', 'Units', 'Orders']}
          align={['left', 'right', 'right', 'right', 'right', 'right']}
          rows={data.byBrand.map((b) => [
            b.label,
            formatINR(b.revenue),
            formatINR(b.profit),
            `${((b.profit / b.revenue) * 100).toFixed(1)}%`,
            formatNum(b.qty),
            formatNum(b.orders),
          ])}
        />
      </Panel>
    </div>
  );
}

/* ---------- Customers Tab ---------- */
function CustomersTab({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Revenue by Gender" subtitle="Sales split by customer gender">
          <DonutChart data={data.byGender.map((g) => ({ label: g.label, value: g.revenue }))} formatValue={formatINR} />
        </Panel>
        <Panel title="Revenue by Age Group" subtitle="Customer age segment performance" className="lg:col-span-2">
          <BarChart
            data={data.byAgeBucket.map((a) => ({ label: a.bucket, value: a.revenue }))}
            formatValue={formatINR}
            color="#8b5cf6"
            height={240}
          />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Top 10 Customers by Revenue" subtitle="Highest-value customers (LTV)">
          <DataTable
            headers={['Customer', 'Revenue', 'Profit', 'Orders', 'Units']}
            align={['left', 'right', 'right', 'right', 'right']}
            rows={data.topCustomers.map((c) => [
              c.label,
              formatINR(c.revenue),
              formatINR(c.profit),
              formatNum(c.orders),
              formatNum(c.qty),
            ])}
          />
        </Panel>
        <Panel title="Gender Performance Detail" subtitle="Revenue, profit & orders by gender">
          <DataTable
            headers={['Gender', 'Revenue', 'Profit', 'Margin', 'Orders', 'Units']}
            align={['left', 'right', 'right', 'right', 'right', 'right']}
            rows={data.byGender.map((g) => [
              g.label,
              formatINR(g.revenue),
              formatINR(g.profit),
              `${((g.profit / g.revenue) * 100).toFixed(1)}%`,
              formatNum(g.orders),
              formatNum(g.qty),
            ])}
          />
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-bold text-slate-800">Age Group Detail</h4>
            <DataTable
              headers={['Age Group', 'Revenue', 'Customers']}
              align={['left', 'right', 'right']}
              rows={data.byAgeBucket.map((a) => [a.bucket, formatINR(a.revenue), formatNum(a.customers)])}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ---------- Regional Tab ---------- */
function RegionalTab({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Revenue by Region" subtitle="Geographic zone performance">
          <BarChart
            data={data.byRegion.map((r) => ({ label: r.label, value: r.revenue }))}
            formatValue={formatINR}
            color="#06b6d4"
            height={240}
          />
        </Panel>
        <Panel title="Top 10 Cities by Revenue" subtitle="City-level sales ranking">
          <BarChart
            data={data.byCity.map((c) => ({ label: c.label, value: c.revenue }))}
            horizontal
            formatValue={formatINR}
            color="#f59e0b"
            height={280}
          />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Regional Performance Detail" subtitle="Full breakdown by region">
          <DataTable
            headers={['Region', 'Revenue', 'Profit', 'Margin', 'Orders', 'Units']}
            align={['left', 'right', 'right', 'right', 'right', 'right']}
            rows={data.byRegion.map((r) => [
              r.label,
              formatINR(r.revenue),
              formatINR(r.profit),
              `${((r.profit / r.revenue) * 100).toFixed(1)}%`,
              formatNum(r.orders),
              formatNum(r.qty),
            ])}
          />
        </Panel>
        <Panel title="City Performance Detail" subtitle="Top cities ranked by revenue">
          <DataTable
            headers={['City', 'Revenue', 'Profit', 'Orders', 'Units']}
            align={['left', 'right', 'right', 'right', 'right']}
            rows={data.byCity.map((c) => [
              c.label,
              formatINR(c.revenue),
              formatINR(c.profit),
              formatNum(c.orders),
              formatNum(c.qty),
            ])}
          />
        </Panel>
      </div>

      <Panel title="Region × Category Revenue Heatmap" subtitle="Cross-tabulation of regional demand by product category">
        <Heatmap
          data={buildRegionCategoryHeatmap(data)}
          formatValue={formatINR}
        />
      </Panel>
    </div>
  );
}

function buildRegionCategoryHeatmap(data: DashboardData) {
  const regions = data.byRegion.map((r) => r.label);
  const cats = data.byCategory.map((c) => c.label);
  const cells: { row: string; col: string; value: number }[] = [];
  for (const region of regions) {
    for (const cat of cats) {
      const val = data.rows
        .filter((r) => r.region === region && r.category === cat)
        .reduce((s, r) => s + r.revenue, 0);
      cells.push({ row: region, col: cat, value: val });
    }
  }
  return cells;
}

/* ---------- CSV Export ---------- */
function exportCsv(data: DashboardData) {
  const headers = [
    'Order ID', 'Date', 'Month', 'Customer', 'Gender', 'Age', 'City', 'State',
    'Region', 'Category', 'Subcategory', 'Brand', 'Product', 'Qty', 'Unit Price',
    'Discount %', 'Revenue', 'Cost', 'Profit', 'Channel', 'Payment', 'Status', 'Rating',
  ];
  const lines = [headers.join(',')];
  for (const r of data.rows) {
    lines.push([
      r.order_id, r.order_date, r.month, `"${r.customer_name}"`, r.gender, r.age,
      `"${r.city}"`, `"${r.state}"`, r.region, r.category, r.subcategory, r.brand,
      `"${r.product_name}"`, r.qty, r.unit_price, r.discount_pct, r.revenue, r.cost,
      r.profit, r.channel, r.payment_method, r.delivery_status, r.rating ?? '',
    ].join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'myntra_sales_analytics.csv';
  a.click();
  URL.revokeObjectURL(url);
}
