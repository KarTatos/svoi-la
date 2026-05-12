-- Проблема: user_id в таблице likes имел тип UUID, но JS передаёт text.
-- PostgREST не может сравнивать uuid = text без явного каста.
-- Решение: изменить тип на text — тогда .eq("user_id", userId) работает напрямую.

-- 1. Меняем тип колонки
ALTER TABLE public.likes ALTER COLUMN user_id TYPE text USING user_id::text;

-- 2. Обновляем RLS политики под новый тип
DROP POLICY IF EXISTS "likes_insert_own" ON public.likes;
CREATE POLICY "likes_insert_own" ON public.likes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "likes_delete_own" ON public.likes;
CREATE POLICY "likes_delete_own" ON public.likes
  FOR DELETE USING (auth.uid()::text = user_id);
