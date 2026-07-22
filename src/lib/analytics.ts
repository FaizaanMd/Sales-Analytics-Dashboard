import { supabase, type SalesRow } from './supabase';

export interface Kpis {
  revenue: number;
  profit: number;
  orders: number;
  units: number;
  avgOrderValue: number;
  profitMargin: number;
  avgDiscount: number;
  returnRate: number;
}

export interface MonthlyPoint {
  month: string;
  monthLabel: string;
  revenue: number;
  profit: number;
  orders: number;
}

export interface DimBreakdown {
  label: string;
  revenue: number;
  profit: number;
  orders: number;
  qty: number;
}

export interface AgeBucket {
  bucket: string;
  revenue: number;
  customers: number;
}

export interface DashboardData {
  rows: SalesRow[];
  kpis: Kpis;
  monthly: MonthlyPoint[];
  byCategory: DimBreakdown[];
  byBrand: DimBreakdown[];
  byChannel: DimBreakdown[];
  byPayment: DimBreakdown[];
  byRegion: DimBreakdown[];
  byCity: DimBreakdown[];
  byDelivery: DimBreakdown[];
  byGender: DimBreakdown[];
  byAgeBucket: AgeBucket[];
  topProducts: DimBreakdown[];
  topCustomers: DimBreakdown[];
  returnRateByCategory: DimBreakdown[];
}

const MONTH_LABELS: Record<string, string> = {
  '2024-01': 'Jan', '2024-02': 'Feb', '2024-03': 'Mar', '2024-04': 'Apr',
  '2024-05': 'May', '2024-06': 'Jun', '2024-07': 'Jul', '2024-08': 'Aug',
  '2024-09': 'Sep', '2024-10': 'Oct', '2024-11': 'Nov', '2024-12': 'Dec',
};

function aggBy(rows: SalesRow[], key: (r: SalesRow) => string): DimBreakdown[] {
  const map = new Map<string, DimBreakdown>();
  for (const r of rows) {
    const k = key(r);
    const e = map.get(k) ?? { label: k, revenue: 0, profit: 0, orders: 0, qty: 0 };
    e.revenue += r.revenue;
    e.profit += r.profit;
    e.qty += r.qty;
    e.orders += 1;
    map.set(k, e);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

function ageBucket(age: number): string {
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  return '55+';
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const { data, error } = await supabase
    .from('myntra_sales')
    .select('*')
    .order('order_date', { ascending: true });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as SalesRow[];

  // KPIs
  const revenue = rows.reduce((s, r) => s + r.revenue, 0);
  const profit = rows.reduce((s, r) => s + r.profit, 0);
  const units = rows.reduce((s, r) => s + r.qty, 0);
  const orderIds = new Set(rows.map((r) => r.order_id));
  const orders = orderIds.size;
  const returned = rows.filter((r) => r.delivery_status === 'Returned').length;
  const avgDisc = rows.length ? rows.reduce((s, r) => s + r.discount_pct, 0) / rows.length : 0;

  const kpis: Kpis = {
    revenue,
    profit,
    orders,
    units,
    avgOrderValue: orders ? revenue / orders : 0,
    profitMargin: revenue ? (profit / revenue) * 100 : 0,
    avgDiscount: avgDisc,
    returnRate: rows.length ? (returned / rows.length) * 100 : 0,
  };

  // Monthly
  const monthMap = new Map<string, MonthlyPoint>();
  for (const r of rows) {
    const m = r.month;
    const e = monthMap.get(m) ?? { month: m, monthLabel: MONTH_LABELS[m] ?? m, revenue: 0, profit: 0, orders: 0 };
    e.revenue += r.revenue;
    e.profit += r.profit;
    e.orders += 1;
    monthMap.set(m, e);
  }
  const monthly = [...monthMap.values()].sort((a, b) => a.month.localeCompare(b.month));

  // Breakdowns
  const byCategory = aggBy(rows, (r) => r.category);
  const byBrand = aggBy(rows, (r) => r.brand).slice(0, 12);
  const byChannel = aggBy(rows, (r) => r.channel);
  const byPayment = aggBy(rows, (r) => r.payment_method);
  const byRegion = aggBy(rows, (r) => r.region);
  const byCity = aggBy(rows, (r) => r.city).slice(0, 10);
  const byDelivery = aggBy(rows, (r) => r.delivery_status);
  const byGender = aggBy(rows, (r) => r.gender);

  // Age buckets
  const ageMap = new Map<string, { revenue: number; customers: Set<string> }>();
  for (const r of rows) {
    const b = ageBucket(r.age);
    const e = ageMap.get(b) ?? { revenue: 0, customers: new Set<string>() };
    e.revenue += r.revenue;
    e.customers.add(r.customer_id);
    ageMap.set(b, e);
  }
  const bucketOrder = ['18-24', '25-34', '35-44', '45-54', '55+'];
  const byAgeBucket: AgeBucket[] = bucketOrder
    .map((b) => {
      const e = ageMap.get(b);
      return e ? { bucket: b, revenue: e.revenue, customers: e.customers.size } : { bucket: b, revenue: 0, customers: 0 };
    })
    .filter((x) => x.customers > 0);

  // Top products
  const topProducts = aggBy(rows, (r) => r.product_name).slice(0, 10);

  // Top customers
  const custMap = new Map<string, DimBreakdown>();
  for (const r of rows) {
    const e = custMap.get(r.customer_id) ?? { label: r.customer_name, revenue: 0, profit: 0, orders: 0, qty: 0 };
    e.revenue += r.revenue;
    e.profit += r.profit;
    e.qty += r.qty;
    e.orders += 1;
    custMap.set(r.customer_id, e);
  }
  const topCustomers = [...custMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Return rate by category
  const catStats = new Map<string, { total: number; returned: number }>();
  for (const r of rows) {
    const e = catStats.get(r.category) ?? { total: 0, returned: 0 };
    e.total += 1;
    if (r.delivery_status === 'Returned') e.returned += 1;
    catStats.set(r.category, e);
  }
  const returnRateByCategory: DimBreakdown[] = [...catStats.entries()]
    .map(([k, v]) => ({ label: k, revenue: v.total ? (v.returned / v.total) * 100 : 0, profit: v.returned, orders: v.total, qty: 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    rows, kpis, monthly, byCategory, byBrand, byChannel, byPayment,
    byRegion, byCity, byDelivery, byGender, byAgeBucket, topProducts,
    topCustomers, returnRateByCategory,
  };
}

export function applyFilters(
  data: DashboardData,
  filters: { category: string; region: string; channel: string; month: string },
): DashboardData {
  let rows = data.rows;
  if (filters.category !== 'All') rows = rows.filter((r) => r.category === filters.category);
  if (filters.region !== 'All') rows = rows.filter((r) => r.region === filters.region);
  if (filters.channel !== 'All') rows = rows.filter((r) => r.channel === filters.channel);
  if (filters.month !== 'All') rows = rows.filter((r) => r.month === filters.month);

  // Recompute everything from filtered rows
  const revenue = rows.reduce((s, r) => s + r.revenue, 0);
  const profit = rows.reduce((s, r) => s + r.profit, 0);
  const units = rows.reduce((s, r) => s + r.qty, 0);
  const orderIds = new Set(rows.map((r) => r.order_id));
  const orders = orderIds.size;
  const returned = rows.filter((r) => r.delivery_status === 'Returned').length;
  const avgDisc = rows.length ? rows.reduce((s, r) => s + r.discount_pct, 0) / rows.length : 0;

  const kpis: Kpis = {
    revenue, profit, orders, units,
    avgOrderValue: orders ? revenue / orders : 0,
    profitMargin: revenue ? (profit / revenue) * 100 : 0,
    avgDiscount: avgDisc,
    returnRate: rows.length ? (returned / rows.length) * 100 : 0,
  };

  const monthMap = new Map<string, MonthlyPoint>();
  for (const r of rows) {
    const m = r.month;
    const e = monthMap.get(m) ?? { month: m, monthLabel: MONTH_LABELS[m] ?? m, revenue: 0, profit: 0, orders: 0 };
    e.revenue += r.revenue;
    e.profit += r.profit;
    e.orders += 1;
    monthMap.set(m, e);
  }
  const monthly = [...monthMap.values()].sort((a, b) => a.month.localeCompare(b.month));

  return {
    rows, kpis, monthly,
    byCategory: aggBy(rows, (r) => r.category),
    byBrand: aggBy(rows, (r) => r.brand).slice(0, 12),
    byChannel: aggBy(rows, (r) => r.channel),
    byPayment: aggBy(rows, (r) => r.payment_method),
    byRegion: aggBy(rows, (r) => r.region),
    byCity: aggBy(rows, (r) => r.city).slice(0, 10),
    byDelivery: aggBy(rows, (r) => r.delivery_status),
    byGender: aggBy(rows, (r) => r.gender),
    byAgeBucket: data.byAgeBucket,
    topProducts: aggBy(rows, (r) => r.product_name).slice(0, 10),
    topCustomers: [...rows.reduce((map, r) => {
      const e = map.get(r.customer_id) ?? { label: r.customer_name, revenue: 0, profit: 0, orders: 0, qty: 0 };
      e.revenue += r.revenue; e.profit += r.profit; e.qty += r.qty; e.orders += 1;
      map.set(r.customer_id, e); return map;
    }, new Map<string, DimBreakdown>()).values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10),
    returnRateByCategory: data.returnRateByCategory,
  };
}

export function formatINR(n: number): string {
  if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

export function formatNum(n: number): string {
  return n.toLocaleString('en-IN');
}
