import { supabase } from "./supabase";

// Пробуем удалить лайк. Если ничего не удалилось — ставим.
// Возвращает true = лайкнуто, false = снято.
export async function toggleLike(itemType, itemId, userId) {
  if (!userId) throw new Error("Нужно войти, чтобы поставить лайк");

  const { data: deleted, error: delErr } = await supabase
    .from("likes")
    .delete()
    .eq("item_type", itemType)
    .eq("item_id", String(itemId))
    .eq("user_id", String(userId))
    .select();

  if (delErr) throw new Error(delErr.message);

  if (deleted && deleted.length > 0) {
    return false; // был лайк — сняли
  }

  const { error: insErr } = await supabase.from("likes").insert({
    item_type: itemType,
    item_id:   String(itemId),
    user_id:   String(userId),
  });
  if (insErr) throw new Error(insErr.message);
  return true; // не было — поставили
}

// Возвращает Set<string> лайкнутых id для данного типа
export async function fetchUserLikedIds(itemType, userId) {
  if (!userId) return new Set();
  const { data, error } = await supabase
    .from("likes")
    .select("item_id")
    .eq("item_type", itemType)
    .eq("user_id", String(userId));
  if (error) return new Set();
  return new Set((data || []).map((r) => String(r.item_id)));
}
