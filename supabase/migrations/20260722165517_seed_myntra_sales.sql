/*
# Seed Myntra Sales Dataset

1. Purpose
- Populate `myntra_sales` with ~3000 realistic order-line rows spanning
  Jan 2024 - Dec 2024, to power the analytics dashboard.

2. Approach
- Deterministic PL/pgSQL generator using `random()` seeded once.
- Picks from curated arrays of Indian cities/states/regions, categories,
  subcategories, brands, channels, payment methods, delivery statuses.
- Derives revenue/profit from unit_price, qty, discount_pct, and a cost margin.
- Computes month/quarter from order_date.

3. Safety
- Idempotent: deletes existing rows first (seed data only, safe to regenerate).
- Re-runnable.
*/

DO $$
DECLARE
  i int;
  v_order_id text;
  v_order_date date;
  v_month text;
  v_quarter text;
  v_customer_id text;
  v_customer_name text;
  v_gender text;
  v_age int;
  v_city text;
  v_state text;
  v_region text;
  v_category text;
  v_subcategory text;
  v_brand text;
  v_product_name text;
  v_size text;
  v_qty int;
  v_unit_price numeric;
  v_discount_pct numeric;
  v_revenue numeric;
  v_cost numeric;
  v_profit numeric;
  v_channel text;
  v_payment_method text;
  v_delivery_status text;
  v_rating int;
  v_line_items int;
  v_j int;
  v_sub_idx int;
  v_sub_arr text[];
  v_idx int;

  cities text[]      := ARRAY['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow','Surat','Kochi','Indore','Chandigarh','Bhopal','Patna','Nagpur','Coimbatore','Visakhapatnam','Guwahati'];
  states text[]      := ARRAY['Maharashtra','Delhi','Karnataka','Telangana','Tamil Nadu','West Bengal','Maharashtra','Gujarat','Rajasthan','Uttar Pradesh','Gujarat','Kerala','Madhya Pradesh','Punjab','Madhya Pradesh','Bihar','Maharashtra','Tamil Nadu','Andhra Pradesh','Assam'];
  regions text[]     := ARRAY['West','North','South','South','South','East','West','West','North','North','West','South','Central','North','Central','East','West','South','South','East'];
  categories text[]  := ARRAY['Apparel','Footwear','Accessories','Beauty','Home & Living','Electronics','Sports'];
  brands text[]      := ARRAY['Roadster','Highlander','HRX','Puma','Nike','Levis','Wrogn','Mast & Harbour','Anouk','Libas','Manyavar','H&M','Zara','Tommy Hilfiger','Calvin Klein','Lakme','Maybelline','Nykaa','Forest Essentials','Bose','boAt','Fitbit','Apple','Samsung','GoPro','Home Centre','Bombay Dyeing','Godrej','Yonex','Adidas'];
  subs_apparel text[]     := ARRAY['T-Shirts','Shirts','Jeans','Dresses','Kurtas','Sarees','Jackets','Tops'];
  subs_footwear text[]    := ARRAY['Sneakers','Sandals','Heels','Boots','Flats','Sports Shoes','Loafers','Flip Flops'];
  subs_accessories text[] := ARRAY['Watches','Wallets','Belts','Bags','Sunglasses','Jewelry','Hats','Scarves'];
  subs_beauty text[]      := ARRAY['Skincare','Makeup','Fragrance','Hair Care','Bath & Body','Nails','Tools','Sets'];
  subs_home text[]        := ARRAY['Bedding','Decor','Kitchen','Furniture','Lighting','Storage','Curtains','Rugs'];
  subs_electronics text[] := ARRAY['Audio','Wearables','Mobiles','Chargers','Cameras','Tablets','Cables','Cases'];
  subs_sports text[]      := ARRAY['Activewear','Equipment','Bottles','Supplements','Yoga','Cycling','Running','Bags'];
  channels text[]    := ARRAY['Mobile App','Mobile App','Mobile App','Web','Web','Myntra Studio','Offline Store'];
  payments text[]   := ARRAY['UPI','UPI','UPI','Credit Card','Debit Card','Net Banking','COD'];
  deliveries text[] := ARRAY['Delivered','Delivered','Delivered','Delivered','Returned','Cancelled','In Transit'];
  first_names text[] := ARRAY['Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Reyansh','Ayaan','Krishna','Ishaan','Saanvi','Aanya','Aadhya','Aaradhya','Ananya','Pari','Diya','Myra','Sara','Anika','Riya','Neha','Kavya','Tanvi','Meera'];
  last_names text[]  := ARRAY['Sharma','Verma','Patel','Gupta','Reddy','Nair','Singh','Khan','Iyer','Das','Mehta','Joshi','Bose','Kapoor','Malhotra','Chopra','Rao','Pillai','Menon','Banerjee'];
BEGIN
  DELETE FROM myntra_sales;
  PERFORM setseed(0.4242);

  FOR i IN 1..450 LOOP
    v_order_id := 'MN' || lpad(i::text, 6, '0');
    v_order_date := DATE '2024-01-01' + (random() * 364)::int;
    v_month := to_char(v_order_date, 'YYYY-MM');
    v_quarter := to_char(v_order_date, 'YYYY') || '-Q' || ((extract(quarter from v_order_date))::text);

    v_customer_id := 'C' || lpad((1 + (random()*499)::int)::text, 5, '0');
    v_gender := CASE WHEN random() < 0.52 THEN 'Female' ELSE 'Male' END;
    v_age := 18 + (random()*47)::int;
    v_idx := 1 + (random()*(array_length(first_names,1)-1))::int;
    v_customer_name := first_names[v_idx] || ' ' || last_names[1 + (random()*(array_length(last_names,1)-1))::int];

    v_idx := 1 + (random()*(array_length(cities,1)-1))::int;
    v_city := cities[v_idx];
    v_state := states[v_idx];
    v_region := regions[v_idx];

    v_channel := channels[1 + (random()*(array_length(channels,1)-1))::int];
    v_payment_method := payments[1 + (random()*(array_length(payments,1)-1))::int];

    v_line_items := 1 + (random()*3)::int;

    FOR v_j IN 1..v_line_items LOOP
      v_idx := 1 + (random()*(array_length(categories,1)-1))::int;
      v_category := categories[v_idx];
      v_sub_idx := v_idx;

      v_sub_arr := CASE v_sub_idx
        WHEN 1 THEN subs_apparel
        WHEN 2 THEN subs_footwear
        WHEN 3 THEN subs_accessories
        WHEN 4 THEN subs_beauty
        WHEN 5 THEN subs_home
        WHEN 6 THEN subs_electronics
        WHEN 7 THEN subs_sports
      END;
      v_subcategory := v_sub_arr[1 + (random()*(array_length(v_sub_arr,1)-1))::int];

      v_brand := brands[1 + (random()*(array_length(brands,1)-1))::int];
      v_product_name := v_brand || ' ' || v_subcategory || ' ' || v_category;
      v_size := CASE v_category
        WHEN 'Footwear' THEN (6 + (random()*6)::int)::text
        WHEN 'Beauty' THEN NULL
        ELSE (ARRAY['XS','S','M','L','XL','XXL'])[1 + (random()*5)::int]
      END;

      v_qty := 1 + (random()*2)::int;
      v_unit_price := CASE v_category
        WHEN 'Electronics' THEN 1500 + (random()*45000)::numeric
        WHEN 'Home & Living' THEN 400 + (random()*18000)::numeric
        WHEN 'Apparel' THEN 399 + (random()*3999)::numeric
        WHEN 'Footwear' THEN 699 + (random()*6999)::numeric
        WHEN 'Accessories' THEN 249 + (random()*14999)::numeric
        WHEN 'Beauty' THEN 149 + (random()*3499)::numeric
        ELSE 299 + (random()*5999)::numeric
      END;
      v_unit_price := round(v_unit_price / 10) * 10;

      v_discount_pct := CASE WHEN random() < 0.7 THEN (5 + (random()*55))::numeric ELSE 0 END;
      v_discount_pct := round(v_discount_pct);

      v_revenue := round((v_unit_price * v_qty * (1 - v_discount_pct/100))::numeric, 2);
      v_cost := round((v_revenue * (0.55 + random()*0.25))::numeric, 2);
      v_profit := round((v_revenue - v_cost)::numeric, 2);

      v_delivery_status := deliveries[1 + (random()*(array_length(deliveries,1)-1))::int];
      v_rating := CASE WHEN v_delivery_status = 'Delivered' THEN (3 + (random()*2)::int) ELSE NULL END;

      INSERT INTO myntra_sales (
        order_id, order_date, month, quarter, customer_id, customer_name,
        gender, age, city, state, region, category, subcategory, brand,
        product_name, size, qty, unit_price, discount_pct, revenue, cost,
        profit, channel, payment_method, delivery_status, rating
      ) VALUES (
        v_order_id, v_order_date, v_month, v_quarter, v_customer_id, v_customer_name,
        v_gender, v_age, v_city, v_state, v_region, v_category, v_subcategory, v_brand,
        v_product_name, v_size, v_qty, v_unit_price, v_discount_pct, v_revenue, v_cost,
        v_profit, v_channel, v_payment_method, v_delivery_status, v_rating
      );
    END LOOP;
  END LOOP;
END $$;
