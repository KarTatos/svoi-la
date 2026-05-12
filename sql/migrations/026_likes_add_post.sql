-- Migration 026: add 'post' to likes item_type + update trigger + RLS
-- Fixes community likes (posts were blocked by CHECK constraint)
-- Run in Supabase SQL editor

BEGIN;

-- 1. Expand CHECK constraint to allow 'post'
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_item_type_check;
ALTER TABLE public.likes
  ADD CONSTRAINT likes_item_type_check
  CHECK (item_type IN ('place', 'tip', 'event', 'housing', 'post'));

-- 2. Update RLS insert policy to allow 'post'
DROP POLICY IF EXISTS "likes_insert_own" ON public.likes;
CREATE POLICY "likes_insert_own"
ON public.likes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND item_type IN ('place', 'tip', 'event', 'housing', 'post')
);

-- 3. Update sync_likes_count trigger to handle 'post' type
CREATE OR REPLACE FUNCTION public.sync_likes_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_item_type text;
  v_item_id   text;
  v_count     int;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_item_type := OLD.item_type;
    v_item_id   := OLD.item_id;
  ELSE
    v_item_type := NEW.item_type;
    v_item_id   := NEW.item_id;
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
  ELSIF v_item_type = 'post' THEN
    UPDATE public.posts SET likes_count = v_count WHERE id::text = v_item_id;
  END IF;

  RETURN NULL;
END;
$$;

COMMIT;
