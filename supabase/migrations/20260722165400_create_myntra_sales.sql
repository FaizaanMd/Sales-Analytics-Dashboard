/*
# Myntra Sales Analytics — Fact Table

1. Purpose
- Stores one row per order line item from a Myntra-style e-commerce dataset.
- Powers an enterprise sales analytics dashboard with KPIs, trends,
  category/brand breakdowns, regional analysis, and customer segmentation.

2. New Table: `myntra_sales`
- `id`            uuid primary key
- `order_id`      text  — grouped order identifier (multiple line items share an order_id)
- `order_date`    date  — date the order was placed
- `month`         text  — 'YYYY-MM' derived from order_date for fast monthly grouping
- `quarter`       text  — 'YYYY-Qn' derived from order_date
- `customer_id`   text  — anonymized customer identifier
- `customer_name` text  — customer display name
- `gender`        text  — 'Male' | 'Female'
- `age`           int   — customer age at order time
- `city`          text  — shipping city
- `state`         text  — shipping state
- `region`        text  — 'North' | 'South' | 'East' | 'West' | 'Central'
- `category`      text  — product category (e.g. Apparel, Footwear, Accessories)
- `subcategory`   text  — product subcategory
- `brand`         text  — brand name
- `product_name`  text  — product title
- `size`          text  — apparel/footwear size
- `qty`           int   — quantity ordered
- `unit_price`    numeric(12,2) — list price per unit (INR)
- `discount_pct`  numeric(5,2)  — discount percentage applied
- `revenue`       numeric(14,2) — gross revenue after discount (INR)
- `cost`          numeric(14,2) — cost of goods sold (INR)
- `profit`        numeric(14,2) — revenue - cost (INR)
- `channel`       text  — sales channel: 'Mobile App' | 'Web' | 'Myntra Studio' | 'Offline Store'
- `payment_method` text — 'Credit Card' | 'Debit Card' | 'UPI' | 'Net Banking' | 'COD'
- `delivery_status` text — 'Delivered' | 'Returned' | 'Cancelled' | 'In Transit'
- `rating`        int   — customer rating 1-5 (nullable)
- `created_at`    timestamptz default now()

3. Indexes
- `idx_myntra_order_date` on order_date for time-range queries
- `idx_myntra_month` on month for monthly trend grouping
- `idx_myntra_category` on category
- `idx_myntra_brand` on brand
- `idx_myntra_region` on region
- `idx_myntra_customer` on customer_id

4. Security
- Single-tenant dashboard (no sign-in). RLS enabled with anon+authenticated
  full CRUD so the anon-key frontend can read its own data. Data is intentionally
  shared/public for the dashboard.
*/

CREATE TABLE IF NOT EXISTS myntra_sales (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        text NOT NULL,
  order_date      date NOT NULL,
  month           text NOT NULL,
  quarter         text NOT NULL,
  customer_id     text NOT NULL,
  customer_name   text NOT NULL,
  gender          text NOT NULL,
  age             int  NOT NULL,
  city            text NOT NULL,
  state           text NOT NULL,
  region          text NOT NULL,
  category        text NOT NULL,
  subcategory     text NOT NULL,
  brand           text NOT NULL,
  product_name    text NOT NULL,
  size            text,
  qty             int  NOT NULL,
  unit_price      numeric(12,2) NOT NULL,
  discount_pct    numeric(5,2)  NOT NULL DEFAULT 0,
  revenue         numeric(14,2) NOT NULL,
  cost            numeric(14,2) NOT NULL,
  profit          numeric(14,2) NOT NULL,
  channel         text NOT NULL,
  payment_method  text NOT NULL,
  delivery_status text NOT NULL,
  rating          int,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_myntra_order_date ON myntra_sales(order_date);
CREATE INDEX IF NOT EXISTS idx_myntra_month      ON myntra_sales(month);
CREATE INDEX IF NOT EXISTS idx_myntra_category    ON myntra_sales(category);
CREATE INDEX IF NOT EXISTS idx_myntra_brand       ON myntra_sales(brand);
CREATE INDEX IF NOT EXISTS idx_myntra_region      ON myntra_sales(region);
CREATE INDEX IF NOT EXISTS idx_myntra_customer    ON myntra_sales(customer_id);

ALTER TABLE myntra_sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_myntra" ON myntra_sales;
CREATE POLICY "anon_select_myntra" ON myntra_sales
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_myntra" ON myntra_sales;
CREATE POLICY "anon_insert_myntra" ON myntra_sales
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_myntra" ON myntra_sales;
CREATE POLICY "anon_update_myntra" ON myntra_sales
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_myntra" ON myntra_sales;
CREATE POLICY "anon_delete_myntra" ON myntra_sales
  FOR DELETE TO anon, authenticated USING (true);
