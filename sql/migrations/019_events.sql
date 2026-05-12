-- Events table for SVOI LA
create table if not exists public.events (
  id             bigserial primary key,
  title          text        not null,
  description    text,
  location       text,
  address        text,
  lat            double precision,
  lng            double precision,
  starts_at      timestamptz not null,
  ends_at        timestamptz,
  cover_url      text,
  price          text        default 'Бесплатно',
  url            text,
  organizer      text,
  user_id        uuid        references auth.users(id) on delete set null,
  added_by       text,
  is_published   boolean     default true,
  views          integer     default 0,
  created_at     timestamptz default now()
);

-- Indexes
create index if not exists events_starts_at_idx on public.events(starts_at);
create index if not exists events_user_id_idx  on public.events(user_id);

-- RLS
alter table public.events enable row level security;

-- Anyone can read published events
create policy "events_select_public"
  on public.events for select
  using (is_published = true);

-- Authenticated users can insert
create policy "events_insert_auth"
  on public.events for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Owners can update/delete
create policy "events_update_owner"
  on public.events for update
  to authenticated
  using (auth.uid() = user_id);

create policy "events_delete_owner"
  on public.events for delete
  to authenticated
  using (auth.uid() = user_id);

-- Event attendees (RSVP)
create table if not exists public.event_attendees (
  id         bigserial primary key,
  event_id   bigint      not null references public.events(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text,
  avatar_url text,
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

alter table public.event_attendees enable row level security;

create policy "attendees_select_public"
  on public.event_attendees for select using (true);

create policy "attendees_insert_auth"
  on public.event_attendees for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "attendees_delete_own"
  on public.event_attendees for delete
  to authenticated
  using (auth.uid() = user_id);
