-- 005_places_lat_lng.sql
-- Stores canonical coordinates for place cards.
-- Idempotent: safe to run multiple times.

ALTER TABLE IF EXISTS public.places
  ADD COLUMN IF NOT EXISTS lat double precision;

ALTER TABLE IF EXISTS public.places
  ADD COLUMN IF NOT EXISTS lng double precision;

CREATE INDEX IF NOT EXISTS idx_places_lat_lng
  ON public.places (lat, lng)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;
