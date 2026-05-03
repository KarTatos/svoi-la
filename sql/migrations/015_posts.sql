-- 015_posts.sql
-- Community feed posts (Threads-like)

create table if not exists public.posts (
  id          uuid default gen_random_uuid() primary key,
  text        text not null,
  author      text,
  user_id     uuid references auth.users on delete set null,
  likes_count integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.posts enable row level security;

drop policy if exists "posts_read"   on public.posts;
drop policy if exists "posts_insert" on public.posts;
drop policy if exists "posts_update" on public.posts;
drop policy if exists "posts_delete" on public.posts;

create policy "posts_read"   on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = user_id);
create policy "posts_update" on public.posts for update using (auth.uid() = user_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = user_id);

create index if not exists idx_posts_created_at on public.posts (created_at desc);
