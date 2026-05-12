-- Add photos array column to events table
alter table public.events
  add column if not exists photos text[] default '{}';

-- Index for cover_url (for filtering events with images)
create index if not exists events_cover_url_idx on public.events(cover_url)
  where cover_url is not null;
