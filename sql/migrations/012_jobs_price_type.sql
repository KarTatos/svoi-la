-- Migration 012: add price_type column to jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS price_type text DEFAULT NULL;
