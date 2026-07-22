import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export interface SalesRow {
  id: string;
  order_id: string;
  order_date: string;
  month: string;
  quarter: string;
  customer_id: string;
  customer_name: string;
  gender: string;
  age: number;
  city: string;
  state: string;
  region: string;
  category: string;
  subcategory: string;
  brand: string;
  product_name: string;
  size: string | null;
  qty: number;
  unit_price: number;
  discount_pct: number;
  revenue: number;
  cost: number;
  profit: number;
  channel: string;
  payment_method: string;
  delivery_status: string;
  rating: number | null;
}

export interface AggResult {
  dimension: string;
  revenue: number;
  profit: number;
  orders: number;
  qty: number;
}
