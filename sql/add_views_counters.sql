-- Add global views counters for cards
-- Run once in Supabase SQL Editor

ALTER TABLE IF EXISTS public.places
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS public.tips
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS public.housing
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.card_views (
  id BIGSERIAL PRIMARY KEY,
  item_type text NOT NULL CHECK (item_type IN ('place', 'tip', 'event', 'housing')),
  item_id uuid NOT NULL,
  viewer_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_type, item_id, viewer_key)
);

CREATE INDEX IF NOT EXISTS idx_card_views_item
  ON public.card_views (item_type, item_id);
