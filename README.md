# Myntra Sales Analytics Dashboard

Enterprise-style retail sales analytics dashboard built with **React, TypeScript, Tailwind CSS, and Supabase**. It visualizes e-commerce order data with live KPIs, trend charts, category/brand breakdowns, customer segmentation, and regional heatmaps — with CSV export.

[![Open in Bolt](https://github.com/stackblitz/bolt.new/blob/main/public/open-in-bolt.svg?raw=true)](https://bolt.new/~/sb1-pftxdmss)

## Overview

The dashboard reads order line-item data from a Supabase Postgres table (`myntra_sales`) and turns it into an interactive, filterable analytics workspace across four views: **Overview**, **Products & Brands**, **Customers**, and **Regional**.

## Features

- **6 live KPI cards** — Total Revenue, Net Profit, Avg Order Value, Units Sold, Avg Discount, Return Rate — each with month-over-month trend indicators
- **Global filters** — Category, Region, Channel, Month
- **Overview tab** — revenue & profit trend line, revenue-by-category donut, sales channel bar chart, payment method donut, order status donut, and a category × month revenue heatmap
- **Products & Brands tab** — top 10 products, top 12 brands, category performance table, return rate by category, full brand performance breakdown
- **Customers tab** — revenue by gender, revenue by age group, top 10 customers by lifetime value, gender & age group detail tables
- **Regional tab** — revenue by region, top 10 cities, regional & city performance tables, region × category revenue heatmap
- **CSV export** — download the currently filtered dataset as `myntra_sales_analytics.csv`
- **Live data badge** — data is fetched from Supabase in real time, not hardcoded

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| Backend / DB | Supabase (Postgres) |
| Charts | Custom SVG-based chart components |
| Linting | ESLint (flat config) |
| Scaffolded with | [Bolt.new](https://bolt.new) |

## Project Structure

src/
├── App.tsx # App shell: header, tabs, KPI cards, tab routing
├── main.tsx # React entry point
├── index.css # Tailwind base styles
├── components/
│ ├── Charts.tsx # LineChart, BarChart, DonutChart, Heatmap
│ ├── FilterBar.tsx # Category / Region / Channel / Month filters
│ ├── KpiCard.tsx # Reusable KPI stat card
│ └── Panel.tsx # Card container + generic DataTable
└── lib/
├── analytics.ts # Data fetching, aggregation, filtering logic
└── supabase.ts # Supabase client + SalesRow type

supabase/
└── migrations/ # SQL migrations: schema, seed data, RLS policies

## Data Model

The `myntra_sales` table stores one row per order line item:

- **Order** — `order_id`, `order_date`, `month`, `quarter`
- **Customer** — `customer_id`, `customer_name`, `gender`, `age`
- **Location** — `city`, `state`, `region`
- **Product** — `category`, `subcategory`, `brand`, `product_name`, `size`
- **Pricing** — `qty`, `unit_price`, `discount_pct`, `revenue`, `cost`, `profit`
- **Transaction** — `channel`, `payment_method`, `delivery_status`, `rating`

Indexed on `order_date`, `month`, `category`, `brand`, `region`, and `customer_id` for fast dashboard queries. Row Level Security is enabled with public read access (no auth) since this is a single-tenant demo dashboard.

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/FaizaanMd/Sales-Analytics-Dashboard.git
cd Sales-Analytics-Dashboard
npm install
```

### 2. Set up Supabase

Run the SQL migrations in `supabase/migrations/` (in order) against your Supabase project via the SQL Editor or the Supabase CLI. This creates the `myntra_sales` table, seeds it with sample data, and applies RLS policies.

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Other scripts

```bash
npm run build       # production build
npm run preview     # preview the production build locally
npm run lint         # run ESLint
npm run typecheck    # run TypeScript checks
```

## License

No license specified yet — add one (e.g. MIT) if you intend for others to reuse this code.
