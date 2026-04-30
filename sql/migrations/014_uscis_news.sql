-- 014_uscis_news.sql
-- USCIS news cache: fetched from RSS, translated to Russian, stored daily.

create table if not exists public.uscis_news (
  id           bigserial primary key,
  guid         text not null unique,          -- RSS item guid (dedup)
  title_en     text not null default '',
  title_ru     text not null default '',
  summary_en   text not null default '',
  summary_ru   text not null default '',
  url          text not null default '',
  published_at timestamptz,
  fetched_at   timestamptz not null default now()
);

-- Public can read; nobody can write from client (server-only via service role)
alter table public.uscis_news enable row level security;

drop policy if exists "uscis_news_read" on public.uscis_news;
create policy "uscis_news_read" on public.uscis_news for select using (true);

-- Keep only the 10 most recent rows (called after each insert batch)
create or replace function public.trim_uscis_news()
returns void language plpgsql security definer as $$
begin
  delete from public.uscis_news
  where id not in (
    select id from public.uscis_news
    order by published_at desc nulls last
    limit 10
  );
end;
$$;
