/*
# Remove Unrestricted Write Policies from myntra_sales

1. Purpose
- The sales analytics dashboard is read-only — the frontend never inserts,
  updates, or deletes rows. The existing INSERT, UPDATE, and DELETE policies
  all use `USING (true)` / `WITH CHECK (true)`, which bypasses RLS entirely
  for anon and authenticated roles. This is a security vulnerability.

2. Changes
- DROP the three write policies:
  - `anon_insert_myntra` (INSERT, WITH CHECK true)
  - `anon_update_myntra` (UPDATE, USING true, WITH CHECK true)
  - `anon_delete_myntra` (DELETE, USING true)
- KEEP `anon_select_myntra` (SELECT, USING true) — read access is intentionally
  public for this no-auth dashboard.

3. Effect
- After this migration, only SELECT is permitted via the anon/authenticated roles.
- INSERT, UPDATE, and DELETE are denied by default (RLS blocks when no matching
  policy exists), which is the correct posture for a read-only analytics dashboard.
- The dashboard continues to function identically — it only reads data.
*/

DROP POLICY IF EXISTS "anon_insert_myntra" ON myntra_sales;
DROP POLICY IF EXISTS "anon_update_myntra" ON myntra_sales;
DROP POLICY IF EXISTS "anon_delete_myntra" ON myntra_sales;
