-- 006_admin_email_access.sql
-- Grants admin edit/delete access via allowlist table and tightens housing owner rules.
-- Idempotent: safe to run multiple times.

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

DO $$
BEGIN
  -- places
  DROP POLICY IF EXISTS "places_admin_update_by_email" ON public.places;
  DROP POLICY IF EXISTS "places_admin_delete_by_email" ON public.places;

  CREATE POLICY "places_admin_update_by_email"
  ON public.places
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (true);

  CREATE POLICY "places_admin_delete_by_email"
  ON public.places
  FOR DELETE
  TO authenticated
  USING (public.is_admin_user());

  -- tips
  DROP POLICY IF EXISTS "tips_admin_update_by_email" ON public.tips;
  DROP POLICY IF EXISTS "tips_admin_delete_by_email" ON public.tips;

  CREATE POLICY "tips_admin_update_by_email"
  ON public.tips
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (true);

  CREATE POLICY "tips_admin_delete_by_email"
  ON public.tips
  FOR DELETE
  TO authenticated
  USING (public.is_admin_user());

  -- events
  DROP POLICY IF EXISTS "events_admin_update_by_email" ON public.events;
  DROP POLICY IF EXISTS "events_admin_delete_by_email" ON public.events;

  CREATE POLICY "events_admin_update_by_email"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (true);

  CREATE POLICY "events_admin_delete_by_email"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (public.is_admin_user());

  -- housing: tighten base policies (owner only) + admin override
  DROP POLICY IF EXISTS "Logged in users can update housing" ON public.housing;
  DROP POLICY IF EXISTS "Logged in users can delete housing" ON public.housing;
  DROP POLICY IF EXISTS "housing_owner_update" ON public.housing;
  DROP POLICY IF EXISTS "housing_owner_delete" ON public.housing;
  DROP POLICY IF EXISTS "housing_admin_update_by_email" ON public.housing;
  DROP POLICY IF EXISTS "housing_admin_delete_by_email" ON public.housing;

  CREATE POLICY "housing_owner_update"
  ON public.housing
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "housing_owner_delete"
  ON public.housing
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

  CREATE POLICY "housing_admin_update_by_email"
  ON public.housing
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (true);

  CREATE POLICY "housing_admin_delete_by_email"
  ON public.housing
  FOR DELETE
  TO authenticated
  USING (public.is_admin_user());
END $$;
