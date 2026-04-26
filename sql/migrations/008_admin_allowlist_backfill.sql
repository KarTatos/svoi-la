-- 008_admin_allowlist_backfill.sql
-- Backfills existing DBs: replaces hardcoded admin email checks with allowlist function.
-- Safe to run multiple times.

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where lower(au.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

do $$
begin
  -- places
  drop policy if exists "places_admin_update_by_email" on public.places;
  drop policy if exists "places_admin_delete_by_email" on public.places;

  create policy "places_admin_update_by_email"
  on public.places
  for update
  to authenticated
  using (public.is_admin_user())
  with check (true);

  create policy "places_admin_delete_by_email"
  on public.places
  for delete
  to authenticated
  using (public.is_admin_user());

  -- tips
  drop policy if exists "tips_admin_update_by_email" on public.tips;
  drop policy if exists "tips_admin_delete_by_email" on public.tips;

  create policy "tips_admin_update_by_email"
  on public.tips
  for update
  to authenticated
  using (public.is_admin_user())
  with check (true);

  create policy "tips_admin_delete_by_email"
  on public.tips
  for delete
  to authenticated
  using (public.is_admin_user());

  -- events
  drop policy if exists "events_admin_update_by_email" on public.events;
  drop policy if exists "events_admin_delete_by_email" on public.events;

  create policy "events_admin_update_by_email"
  on public.events
  for update
  to authenticated
  using (public.is_admin_user())
  with check (true);

  create policy "events_admin_delete_by_email"
  on public.events
  for delete
  to authenticated
  using (public.is_admin_user());

  -- housing
  drop policy if exists "housing_admin_update_by_email" on public.housing;
  drop policy if exists "housing_admin_delete_by_email" on public.housing;

  create policy "housing_admin_update_by_email"
  on public.housing
  for update
  to authenticated
  using (public.is_admin_user())
  with check (true);

  create policy "housing_admin_delete_by_email"
  on public.housing
  for delete
  to authenticated
  using (public.is_admin_user());

  -- support requests
  drop policy if exists "support_requests_admin_select" on public.support_requests;
  drop policy if exists "support_requests_admin_update" on public.support_requests;

  create policy "support_requests_admin_select"
  on public.support_requests
  for select
  to authenticated
  using (public.is_admin_user());

  create policy "support_requests_admin_update"
  on public.support_requests
  for update
  to authenticated
  using (public.is_admin_user())
  with check (true);
end $$;

