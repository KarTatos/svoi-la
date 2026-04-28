-- 013_marketplace.sql
-- Community marketplace: "Продам" listings with photos.

create table if not exists public.marketplace (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  price       text,
  description text,
  photos      text[] default '{}',
  telegram    text,
  phone       text,
  author      text,
  user_id     uuid references auth.users on delete set null,
  likes_count integer not null default 0,
  views       integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.marketplace enable row level security;

drop policy if exists "market_read"   on public.marketplace;
drop policy if exists "market_insert" on public.marketplace;
drop policy if exists "market_update" on public.marketplace;
drop policy if exists "market_delete" on public.marketplace;

create policy "market_read"   on public.marketplace for select using (true);
create policy "market_insert" on public.marketplace for insert with check (auth.uid() = user_id);
create policy "market_update" on public.marketplace for update using (auth.uid() = user_id);
create policy "market_delete" on public.marketplace for delete using (auth.uid() = user_id);

-- Add 'market' to the record_view whitelist.
create or replace function public.record_view(
  p_item_type  text,
  p_item_id    text,
  p_viewer_key text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  was_new   integer;
  new_views integer;
begin
  if p_item_type not in ('place', 'tip', 'event', 'housing', 'job', 'market') then
    raise exception 'invalid item_type: %', p_item_type;
  end if;

  insert into public.view_dedup (item_type, item_id, viewer_key)
  values (p_item_type, p_item_id, p_viewer_key)
  on conflict do nothing;

  get diagnostics was_new = row_count;

  if was_new = 0 then
    case p_item_type
      when 'place'   then select views into new_views from public.places      where id::text = p_item_id;
      when 'tip'     then select views into new_views from public.tips        where id::text = p_item_id;
      when 'event'   then select views into new_views from public.events      where id::text = p_item_id;
      when 'housing' then select views into new_views from public.housing     where id::text = p_item_id;
      when 'job'     then select views into new_views from public.jobs        where id::text = p_item_id;
      when 'market'  then select views into new_views from public.marketplace where id::text = p_item_id;
    end case;
    return coalesce(new_views, 0);
  end if;

  case p_item_type
    when 'place'   then update public.places      set views = views + 1 where id::text = p_item_id returning views into new_views;
    when 'tip'     then update public.tips        set views = views + 1 where id::text = p_item_id returning views into new_views;
    when 'event'   then update public.events      set views = views + 1 where id::text = p_item_id returning views into new_views;
    when 'housing' then update public.housing     set views = views + 1 where id::text = p_item_id returning views into new_views;
    when 'job'     then update public.jobs        set views = views + 1 where id::text = p_item_id returning views into new_views;
    when 'market'  then update public.marketplace set views = views + 1 where id::text = p_item_id returning views into new_views;
  end case;

  return coalesce(new_views, 0);
end;
$$;

revoke all on function public.record_view(text, text, text) from public;
grant execute on function public.record_view(text, text, text) to anon, authenticated;
