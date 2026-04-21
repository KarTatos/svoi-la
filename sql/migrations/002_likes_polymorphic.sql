-- 002_likes_polymorphic.sql
-- Migrates likes to (item_id, item_type, user_id) and keeps likes_count in sync.
-- Idempotent: safe to run multiple times.

BEGIN;

ALTER TABLE IF EXISTS public.places  ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS public.tips    ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS public.events  ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS public.housing ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  item_id text,
  item_type text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS item_id text;
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS item_type text;
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'likes' AND column_name = 'place_id'
  ) THEN
    EXECUTE '
      UPDATE public.likes
      SET item_id = COALESCE(item_id, place_id::text),
          item_type = COALESCE(item_type, ''place'')
      WHERE place_id IS NOT NULL
    ';
  END IF;
END $$;

UPDATE public.likes
SET item_type = COALESCE(item_type, 'place')
WHERE item_type IS NULL;

DELETE FROM public.likes
WHERE item_id IS NULL OR item_type IS NULL OR user_id IS NULL;

ALTER TABLE public.likes ALTER COLUMN item_id SET NOT NULL;
ALTER TABLE public.likes ALTER COLUMN item_type SET NOT NULL;
ALTER TABLE public.likes ALTER COLUMN user_id SET NOT NULL;

UPDATE public.likes
SET item_type = lower(trim(item_type));

DELETE FROM public.likes
WHERE item_type NOT IN ('place', 'tip', 'event', 'housing');

DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.likes'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ILIKE '%place_id%'
  LOOP
    EXECUTE format('ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS %I', c.conname);
  END LOOP;
END $$;

DROP INDEX IF EXISTS public.likes_place_id_user_id_key;
DROP INDEX IF EXISTS public.idx_likes_place_id;

ALTER TABLE public.likes
  DROP CONSTRAINT IF EXISTS likes_item_type_check;
ALTER TABLE public.likes
  ADD CONSTRAINT likes_item_type_check
  CHECK (item_type IN ('place', 'tip', 'event', 'housing'));

CREATE UNIQUE INDEX IF NOT EXISTS likes_item_unique_idx
  ON public.likes (item_type, item_id, user_id);

CREATE INDEX IF NOT EXISTS likes_item_idx
  ON public.likes (item_type, item_id);

CREATE INDEX IF NOT EXISTS likes_user_idx
  ON public.likes (user_id);

UPDATE public.places p
SET likes_count = COALESCE(src.cnt, 0)
FROM (
  SELECT item_id, COUNT(*)::int AS cnt
  FROM public.likes
  WHERE item_type = 'place'
  GROUP BY item_id
) src
WHERE p.id::text = src.item_id;

UPDATE public.places
SET likes_count = 0
WHERE id::text NOT IN (
  SELECT item_id FROM public.likes WHERE item_type = 'place'
);

UPDATE public.tips t
SET likes_count = COALESCE(src.cnt, 0)
FROM (
  SELECT item_id, COUNT(*)::int AS cnt
  FROM public.likes
  WHERE item_type = 'tip'
  GROUP BY item_id
) src
WHERE t.id::text = src.item_id;

UPDATE public.tips
SET likes_count = 0
WHERE id::text NOT IN (
  SELECT item_id FROM public.likes WHERE item_type = 'tip'
);

UPDATE public.events e
SET likes_count = COALESCE(src.cnt, 0)
FROM (
  SELECT item_id, COUNT(*)::int AS cnt
  FROM public.likes
  WHERE item_type = 'event'
  GROUP BY item_id
) src
WHERE e.id::text = src.item_id;

UPDATE public.events
SET likes_count = 0
WHERE id::text NOT IN (
  SELECT item_id FROM public.likes WHERE item_type = 'event'
);

UPDATE public.housing h
SET likes_count = COALESCE(src.cnt, 0)
FROM (
  SELECT item_id, COUNT(*)::int AS cnt
  FROM public.likes
  WHERE item_type = 'housing'
  GROUP BY item_id
) src
WHERE h.id::text = src.item_id;

UPDATE public.housing
SET likes_count = 0
WHERE id::text NOT IN (
  SELECT item_id FROM public.likes WHERE item_type = 'housing'
);

CREATE OR REPLACE FUNCTION public.sync_likes_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_item_type text;
  v_item_id text;
  v_count int;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_item_type := OLD.item_type;
    v_item_id := OLD.item_id;
  ELSE
    v_item_type := NEW.item_type;
    v_item_id := NEW.item_id;
  END IF;

  SELECT COUNT(*)::int INTO v_count
  FROM public.likes
  WHERE item_type = v_item_type AND item_id = v_item_id;

  IF v_item_type = 'place' THEN
    UPDATE public.places SET likes_count = v_count WHERE id::text = v_item_id;
  ELSIF v_item_type = 'tip' THEN
    UPDATE public.tips SET likes_count = v_count WHERE id::text = v_item_id;
  ELSIF v_item_type = 'event' THEN
    UPDATE public.events SET likes_count = v_count WHERE id::text = v_item_id;
  ELSIF v_item_type = 'housing' THEN
    UPDATE public.housing SET likes_count = v_count WHERE id::text = v_item_id;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_like_change ON public.likes;
DROP TRIGGER IF EXISTS likes_sync_count_trg ON public.likes;

CREATE TRIGGER likes_sync_count_trg
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.sync_likes_count();

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read likes" ON public.likes;
DROP POLICY IF EXISTS "Users can like" ON public.likes;
DROP POLICY IF EXISTS "Users can unlike" ON public.likes;
DROP POLICY IF EXISTS "likes_select_all" ON public.likes;
DROP POLICY IF EXISTS "likes_insert_own" ON public.likes;
DROP POLICY IF EXISTS "likes_delete_own" ON public.likes;

CREATE POLICY "likes_select_all"
ON public.likes
FOR SELECT
USING (true);

CREATE POLICY "likes_insert_own"
ON public.likes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND item_type IN ('place', 'tip', 'event', 'housing')
);

CREATE POLICY "likes_delete_own"
ON public.likes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

COMMIT;
