-- 009_views_v2.sql
-- Replaces card_views + /api/views with a simple views column on each entity
-- and a server-side RPC `record_view` that does atomic dedup + increment.
-- Idempotent: safe to run multiple times.

-- 1. Drop the old card_views table (no longer used).
drop table if exists public.card_views cascade;

-- 2. Add a `views` integer column to each entity table.
alter table public.places   add column if not exists views integer not null default 0;
alter table public.tips     add column if not exists views integer not null default 0;
alter table public.events   add column if not exists views integer not null default 0;
alter table public.housing  add column if not exists views integer not null default 0;

-- 3. Service table that records (item, viewer) pairs already counted.
--    Never read from the app — only used for ON CONFLICT dedup inside record_view.
create table if not exists public.view_dedup (
  item_type text not null,
  item_id   text not null,
  viewer_key text not null,
  created_at timestamptz not null default now(),
  primary key (item_type, item_id, viewer_key)
);

alter table public.view_dedup enable row level security;

-- Nobody reads it directly; only the SECURITY DEFINER function below writes to it.
drop policy if exists "view_dedup_no_direct_access" on public.view_dedup;
-- (no policy = no access for non-superusers, which is exactly what we want)

-- 4. Atomic record_view RPC.
--    Inserts a dedup row; if it's new, increments the entity's views column.
--    Returns the current views count.
create or replace function public.record_view(
  p_item_type text,
  p_item_id   text,
  p_viewer_key text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  was_new boolean;
  new_views integer;
begin
  -- Whitelist item_type to prevent SQL injection via dynamic table names.
  if p_item_type not in ('place', 'tip', 'event', 'housing') then
    raise exception 'invalid item_type: %', p_item_type;
  end if;

  -- Try to insert dedup row. If it conflicts, this viewer already counted.
  insert into public.view_dedup (item_type, item_id, viewer_key)
  values (p_item_type, p_item_id, p_viewer_key)
  on conflict do nothing;

  get diagnostics was_new = row_count;

  if was_new = 0 then
    -- Already counted — return current value without incrementing.
    if p_item_type = 'place' then
      select views into new_views from public.places where id::text = p_item_id;
    elsif p_item_type = 'tip' then
      select views into new_views from public.tips where id::text = p_item_id;
    elsif p_item_type = 'event' then
      select views into new_views from public.events where id::text = p_item_id;
    elsif p_item_type = 'housing' then
      select views into new_views from public.housing where id::text = p_item_id;
    end if;
    return coalesce(new_views, 0);
  end if;

  -- New view — increment the entity's counter and return the new value.
  if p_item_type = 'place' then
    update public.places   set views = views + 1 where id::text = p_item_id returning views into new_views;
  elsif p_item_type = 'tip' then
    update public.tips     set views = views + 1 where id::text = p_item_id returning views into new_views;
  elsif p_item_type = 'event' then
    update public.events   set views = views + 1 where id::text = p_item_id returning views into new_views;
  elsif p_item_type = 'housing' then
    update public.housing  set views = views + 1 where id::text = p_item_id returning views into new_views;
  end if;

  return coalesce(new_views, 0);
end;
$$;

revoke all on function public.record_view(text, text, text) from public;
grant execute on function public.record_view(text, text, text) to anon, authenticated;
