-- Patch existing events table to add missing columns
-- Existing: id, created_at, category, title, date, location, description, author, user_id, likes_count, views

alter table public.events
  add column if not exists ends_at      timestamptz,
  add column if not exists address      text,
  add column if not exists lat          double precision,
  add column if not exists lng          double precision,
  add column if not exists cover_url    text,
  add column if not exists price        text default 'Бесплатно',
  add column if not exists url          text,
  add column if not exists organizer    text,
  add column if not exists is_published boolean default true;

-- RLS (in case not enabled)
alter table public.events enable row level security;

drop policy if exists "events_select_public" on public.events;
create policy "events_select_public"
  on public.events for select
  using (is_published = true or is_published is null);

drop policy if exists "events_insert_auth" on public.events;
create policy "events_insert_auth"
  on public.events for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "events_update_owner" on public.events;
create policy "events_update_owner"
  on public.events for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "events_delete_owner" on public.events;
create policy "events_delete_owner"
  on public.events for delete
  to authenticated
  using (auth.uid() = user_id);

-- Index on date
create index if not exists events_date_idx on public.events(date);

-- Event attendees table
create table if not exists public.event_attendees (
  id         bigserial primary key,
  event_id   uuid        not null references public.events(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text,
  avatar_url text,
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

alter table public.event_attendees enable row level security;

drop policy if exists "attendees_select_public" on public.event_attendees;
create policy "attendees_select_public"
  on public.event_attendees for select using (true);

drop policy if exists "attendees_insert_auth" on public.event_attendees;
create policy "attendees_insert_auth"
  on public.event_attendees for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "attendees_delete_own" on public.event_attendees;
create policy "attendees_delete_own"
  on public.event_attendees for delete
  to authenticated
  using (auth.uid() = user_id);
