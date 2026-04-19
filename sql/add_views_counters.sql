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

