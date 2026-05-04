-- 016_posts_polymorphic_support.sql
-- Let community posts participate in the shared likes/comments infrastructure.
-- Idempotent: safe to run multiple times.

begin;

alter table public.likes
  drop constraint if exists likes_item_type_check;

alter table public.likes
  add constraint likes_item_type_check
  check (item_type in ('place', 'tip', 'event', 'housing', 'job', 'market', 'post'));

do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.comments'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%item_type%';

  if constraint_name is not null then
    execute format('alter table public.comments drop constraint if exists %I', constraint_name);
  end if;
end $$;

alter table public.comments
  add constraint comments_item_type_check
  check (item_type in ('place', 'tip', 'event', 'housing', 'job', 'market', 'post'));

drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own"
on public.likes
for insert
to authenticated
with check (
  auth.uid() = user_id
  and item_type in ('place', 'tip', 'event', 'housing', 'job', 'market', 'post')
);

create index if not exists idx_posts_user_created
  on public.posts (user_id, created_at desc);

create or replace function public.sync_likes_count()
returns trigger
language plpgsql
as $$
declare
  v_item_type text;
  v_item_id text;
  v_count int;
begin
  if TG_OP = 'DELETE' then
    v_item_type := OLD.item_type;
    v_item_id := OLD.item_id;
  else
    v_item_type := NEW.item_type;
    v_item_id := NEW.item_id;
  end if;

  select count(*)::int into v_count
  from public.likes
  where item_type = v_item_type and item_id = v_item_id;

  if v_item_type = 'place' then
    update public.places set likes_count = v_count where id::text = v_item_id;
  elsif v_item_type = 'tip' then
    update public.tips set likes_count = v_count where id::text = v_item_id;
  elsif v_item_type = 'event' then
    update public.events set likes_count = v_count where id::text = v_item_id;
  elsif v_item_type = 'housing' then
    update public.housing set likes_count = v_count where id::text = v_item_id;
  elsif v_item_type = 'job' then
    update public.jobs set likes_count = v_count where id::text = v_item_id;
  elsif v_item_type = 'market' then
    update public.marketplace set likes_count = v_count where id::text = v_item_id;
  elsif v_item_type = 'post' then
    update public.posts set likes_count = v_count where id::text = v_item_id;
  end if;

  return null;
end;
$$;

commit;
