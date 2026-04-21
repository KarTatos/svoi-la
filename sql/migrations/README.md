# SQL migrations

Run in Supabase SQL Editor in this exact order:

1. `sql/migrations/001_housing_schema.sql`
2. `sql/migrations/002_likes_polymorphic.sql`
3. `sql/migrations/003_views_counters.sql`
4. `sql/migrations/004_indexes.sql`
5. `sql/migrations/005_places_lat_lng.sql`

Notes:
- All files are idempotent (`IF NOT EXISTS`, safe `DROP POLICY IF EXISTS`, etc.).
- You can re-run safely when syncing environments.
- If your database is already partially migrated, still run all files in order.
