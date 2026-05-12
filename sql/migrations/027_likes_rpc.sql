-- ─── RPC: toggle like (принимает text, кастует в uuid внутри) ────────────────
CREATE OR REPLACE FUNCTION toggle_like_item(
  p_item_type text,
  p_item_id   text,
  p_user_id   text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id uuid;
  v_user_uuid   uuid;
BEGIN
  v_user_uuid := p_user_id::uuid;

  SELECT id INTO v_existing_id
  FROM public.likes
  WHERE item_type = p_item_type
    AND item_id   = p_item_id
    AND user_id   = v_user_uuid
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    DELETE FROM public.likes WHERE id = v_existing_id;
    RETURN false;   -- теперь не лайкнуто
  ELSE
    INSERT INTO public.likes (item_type, item_id, user_id)
    VALUES (p_item_type, p_item_id, v_user_uuid);
    RETURN true;    -- теперь лайкнуто
  END IF;
END;
$$;

-- ─── RPC: получить все лайкнутые item_id пользователя ────────────────────────
CREATE OR REPLACE FUNCTION fetch_user_liked_ids(
  p_item_type text,
  p_user_id   text
) RETURNS SETOF text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT item_id
  FROM public.likes
  WHERE item_type = p_item_type
    AND user_id   = p_user_id::uuid;
END;
$$;

-- Права на вызов для авторизованных пользователей
GRANT EXECUTE ON FUNCTION toggle_like_item(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION fetch_user_liked_ids(text, text)   TO authenticated;
