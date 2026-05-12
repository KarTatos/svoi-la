-- ═══════════════════════════════════════════════════════════
-- Чистая система лайков с нуля
-- ═══════════════════════════════════════════════════════════

-- 1. Сносим старое
DROP TABLE IF EXISTS public.likes CASCADE;

-- 2. Новая таблица
CREATE TABLE public.likes (
  item_type  text NOT NULL,
  item_id    text NOT NULL,
  user_id    text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (item_type, item_id, user_id)
);

-- 3. RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_all"  ON public.likes FOR SELECT USING (true);
CREATE POLICY "insert_own"  ON public.likes FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "delete_own"  ON public.likes FOR DELETE USING (auth.uid()::text = user_id);

-- 4. Триггер — синхронизирует likes_count на родительской записи
CREATE OR REPLACE FUNCTION sync_likes_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.item_type = 'place'   THEN UPDATE public.places   SET likes_count = likes_count + 1 WHERE id::text = NEW.item_id; END IF;
    IF NEW.item_type = 'tip'     THEN UPDATE public.tips     SET likes_count = likes_count + 1 WHERE id::text = NEW.item_id; END IF;
    IF NEW.item_type = 'post'    THEN UPDATE public.posts    SET likes_count = likes_count + 1 WHERE id::text = NEW.item_id; END IF;
    IF NEW.item_type = 'event'   THEN UPDATE public.events   SET likes_count = likes_count + 1 WHERE id::text = NEW.item_id; END IF;
    IF NEW.item_type = 'housing' THEN UPDATE public.housing  SET likes_count = likes_count + 1 WHERE id::text = NEW.item_id; END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.item_type = 'place'   THEN UPDATE public.places   SET likes_count = GREATEST(0, likes_count - 1) WHERE id::text = OLD.item_id; END IF;
    IF OLD.item_type = 'tip'     THEN UPDATE public.tips     SET likes_count = GREATEST(0, likes_count - 1) WHERE id::text = OLD.item_id; END IF;
    IF OLD.item_type = 'post'    THEN UPDATE public.posts    SET likes_count = GREATEST(0, likes_count - 1) WHERE id::text = OLD.item_id; END IF;
    IF OLD.item_type = 'event'   THEN UPDATE public.events   SET likes_count = GREATEST(0, likes_count - 1) WHERE id::text = OLD.item_id; END IF;
    IF OLD.item_type = 'housing' THEN UPDATE public.housing  SET likes_count = GREATEST(0, likes_count - 1) WHERE id::text = OLD.item_id; END IF;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER sync_likes_count
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION sync_likes_count();
