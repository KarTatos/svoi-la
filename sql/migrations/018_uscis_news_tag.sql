-- 018_uscis_news_tag.sql
-- Add tag column for news categorization

alter table public.uscis_news
  add column if not exists tag text default 'Общее';
