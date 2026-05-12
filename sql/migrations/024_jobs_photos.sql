-- Migration 024: add photos array to jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS photos text[] DEFAULT NULL;
