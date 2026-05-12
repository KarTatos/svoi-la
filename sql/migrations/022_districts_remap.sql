-- 022_districts_remap.sql
-- Remap old district IDs → new district IDs in places table.
-- Idempotent: safe to run multiple times.

-- 1. dtla → downtown
UPDATE public.places SET district = 'downtown'
  WHERE district = 'dtla';

-- 2. silverlake → echo-park
UPDATE public.places SET district = 'echo-park'
  WHERE district = 'silverlake';

-- 3. midcity → koreatown
UPDATE public.places SET district = 'koreatown'
  WHERE district = 'midcity';

-- 4. hollywood + weho → hollywood-weho
UPDATE public.places SET district = 'hollywood-weho'
  WHERE district IN ('hollywood', 'weho');

-- 5. southbay → south-bay
UPDATE public.places SET district = 'south-bay'
  WHERE district = 'southbay';

-- 6. glendale + pasadena → glendale-pasadena
UPDATE public.places SET district = 'glendale-pasadena'
  WHERE district IN ('glendale', 'pasadena');

-- 7. valley → разбивка на studio-noho (Lankershim / NoHo / Studio City)
--    и sfv (Ventura Blvd / Sherman Oaks / Encino)
UPDATE public.places SET district = 'studio-noho'
  WHERE district = 'valley'
    AND (
      address ILIKE '%Lankershim%'
      OR address ILIKE '%Craner%'
      OR address ILIKE '%Coldwater Canyon%'
      OR name ILIKE '%AMP Rehearsal%'
      OR name ILIKE '%Brews Brothers%'
      OR name ILIKE '%Civil Coffee%'
      OR name ILIKE '%Lawless Brewing%'
    );

UPDATE public.places SET district = 'sfv'
  WHERE district = 'valley'; -- всё остальное из valley → sfv

-- 8. westside остаётся без изменений (ID тот же)

-- Проверка результата
SELECT district, COUNT(*) as count
FROM public.places
GROUP BY district
ORDER BY district;
