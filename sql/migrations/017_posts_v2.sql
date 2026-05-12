-- 017_posts_v2.sql
-- Add replies support, avatar_url, replies_count to posts table.

alter table public.posts
  add column if not exists parent_id uuid references public.posts(id) on delete cascade,
  add column if not exists replies_count integer not null default 0,
  add column if not exists avatar_url text;

create index if not exists idx_posts_parent_id on public.posts (parent_id);

-- Trigger to keep replies_count in sync
create or replace function public.sync_replies_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' and NEW.parent_id is not null then
    update public.posts set replies_count = replies_count + 1 where id = NEW.parent_id;
  elsif TG_OP = 'DELETE' and OLD.parent_id is not null then
    update public.posts set replies_count = greatest(replies_count - 1, 0) where id = OLD.parent_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_replies_count on public.posts;
create trigger trg_sync_replies_count
after insert or delete on public.posts
for each row execute function public.sync_replies_count();
