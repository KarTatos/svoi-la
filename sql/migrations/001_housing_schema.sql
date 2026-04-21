-- 001_housing_schema.sql
-- Creates/updates housing table and base RLS policies.
-- Idempotent: safe to run multiple times.

create table if not exists public.housing (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  user_id uuid null default auth.uid(),
  title text not null,
  address text not null,
  district text not null default '',
  type text not null default 'Apartments for rent',
  min_price integer not null default 0,
  price_options text[] not null default '{}',
  beds integer not null default 0,
  baths integer not null default 0,
  updated_label text not null default '',
  tags text[] not null default '{}',
  photo text not null default '',
  likes_count integer not null default 0,
  views integer not null default 0
);

alter table public.housing enable row level security;

-- Safe idempotent policy recreation
DROP POLICY IF EXISTS "Anyone can read housing" ON public.housing;
DROP POLICY IF EXISTS "Logged in users can add housing" ON public.housing;
DROP POLICY IF EXISTS "Logged in users can update housing" ON public.housing;
DROP POLICY IF EXISTS "Logged in users can delete housing" ON public.housing;

create policy "Anyone can read housing"
on public.housing for select
using (true);

create policy "Logged in users can add housing"
on public.housing for insert
to authenticated
with check (true);

create policy "Logged in users can update housing"
on public.housing for update
to authenticated
using (true)
with check (true);

create policy "Logged in users can delete housing"
on public.housing for delete
to authenticated
using (true);
