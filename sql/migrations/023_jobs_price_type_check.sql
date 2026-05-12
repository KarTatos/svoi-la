-- Migration 023: ensure price_type column exists on jobs
-- (column was added in 012, this is a safety idempotent check)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS price_type text DEFAULT NULL;

-- Optional: add a check constraint for known values
-- ALTER TABLE public.jobs
--   ADD CONSTRAINT jobs_price_type_check
--   CHECK (price_type IS NULL OR price_type IN ('hourly', 'monthly', 'fixed', 'negotiable'));
