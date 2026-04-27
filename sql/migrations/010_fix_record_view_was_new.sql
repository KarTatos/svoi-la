-- 010_fix_record_view_was_new.sql
-- Fix: was_new was declared as boolean but GET DIAGNOSTICS ROW_COUNT returns
-- bigint. PostgreSQL has no implicit bigint→boolean cast, so every call to
-- record_view raised a runtime error and views were never incremented.
-- Fix: re-declare was_new as integer.

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
  was_new  integer;   -- was boolean — that caused a bigint→boolean cast error
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
