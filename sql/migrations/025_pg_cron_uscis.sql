-- Migration 025: schedule daily USCIS news refresh via pg_cron + pg_net
--
-- BEFORE RUNNING:
-- 1. Enable pg_net in Supabase: Dashboard → Database → Extensions → pg_net
-- 2. Enable pg_cron in Supabase: Dashboard → Database → Extensions → pg_cron
-- 3. Replace <YOUR_PROJECT_REF> with your Supabase project reference
--    (найти в Settings → General → Reference ID)
-- 4. Replace <YOUR_ANON_KEY> with your Supabase anon key
--    (найти в Settings → API → Project API keys)

-- Schedule: every day at 15:00 UTC = 7:00 AM Los Angeles (PST) / 8:00 AM (PDT)
select cron.schedule(
  'refresh-uscis-news',
  '0 15 * * *',
  $$
  select net.http_post(
    url     := 'https://xlwbteerhugzqbjakanp.supabase.co/functions/v1/refresh-uscis-news',
    headers := jsonb_build_object(
      'Content-Type',      'application/json',
      'Authorization',     'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsd2J0ZWVyaHVnenFiamFrYW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxODA5NjksImV4cCI6MjA5MDc1Njk2OX0.-vodEaSonXJZFyRXJq34kDkFceeT0TMnHQfB0faU2jg'
    ),
    body    := '{}'::jsonb
  ) as request_id;
  $$
);

-- To check cron job status:
-- select * from cron.job;

-- To remove if needed:
-- select cron.unschedule('refresh-uscis-news');
