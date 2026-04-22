-- 007_support_requests.sql
-- Support requests submitted directly from app forms.
-- Idempotent and safe to re-run.

create extension if not exists pgcrypto;

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_name text,
  user_email text,
  message text not null check (char_length(message) between 5 and 1500),
  status text not null default 'new' check (status in ('new', 'in_progress', 'done')),
  created_at timestamptz not null default now()
);

create index if not exists support_requests_user_idx on public.support_requests(user_id);
create index if not exists support_requests_status_idx on public.support_requests(status);
create index if not exists support_requests_created_idx on public.support_requests(created_at desc);

alter table public.support_requests enable row level security;

drop policy if exists "support_requests_insert_own" on public.support_requests;
create policy "support_requests_insert_own"
on public.support_requests
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "support_requests_select_own" on public.support_requests;
create policy "support_requests_select_own"
on public.support_requests
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "support_requests_admin_select" on public.support_requests;
create policy "support_requests_admin_select"
on public.support_requests
for select
to authenticated
using (lower(auth.jwt() ->> 'email') = 'kushnir4work@gmail.com');

drop policy if exists "support_requests_admin_update" on public.support_requests;
create policy "support_requests_admin_update"
on public.support_requests
for update
to authenticated
using (lower(auth.jwt() ->> 'email') = 'kushnir4work@gmail.com')
with check (true);

