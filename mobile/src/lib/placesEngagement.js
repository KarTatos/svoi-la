import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

const ITEM_TYPE = "place";
const VIEWER_KEY_STORAGE = "la_viewer_key";

async function getViewerKey(userId) {
  if (userId) return `user:${userId}`;

  let guestKey = await AsyncStorage.getItem(VIEWER_KEY_STORAGE);
  if (!guestKey) {
    guestKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem(VIEWER_KEY_STORAGE, guestKey);
  }
  return `guest:${guestKey}`;
}

export async function fetchPlaceComments(placeId) {
  if (!placeId) return [];
  const { data, error } = await supabase
    .from("comments")
    .select("id,item_id,item_type,author,text,user_id,created_at")
    .eq("item_type", ITEM_TYPE)
    .eq("item_id", String(placeId))
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map((c) => ({
    id: c.id,
    itemId: c.item_id,
    itemType: c.item_type,
    author: c.author || "Пользователь",
    text: c.text || "",
    userId: c.user_id || null,
    createdAt: c.created_at || null,
  }));
}

export async function fetchPlaceCommentCounts(placeIds) {
  const ids = Array.isArray(placeIds) ? placeIds.map(String).filter(Boolean) : [];
  if (!ids.length) return {};

  const { data, error } = await supabase
    .from("comments")
    .select("item_id")
    .eq("item_type", ITEM_TYPE)
    .in("item_id", ids);

  if (error) throw new Error(error.message);
  const counts = {};
  for (const row of data || []) {
    const id = String(row.item_id || "");
    if (!id) continue;
    counts[id] = (counts[id] || 0) + 1;
  }
  return counts;
}

export async function addPlaceComment(placeId, user, text) {
  const clean = String(text || "").trim();
  if (!clean) throw new Error("Введите текст мнения");
  if (!user?.id) throw new Error("Нужно войти, чтобы оставить мнение");

  const payload = {
    item_id: String(placeId),
    item_type: ITEM_TYPE,
    author: user.name || user.email || "Пользователь",
    text: clean,
    user_id: user.id,
  };

  const { data, error } = await supabase.from("comments").insert([payload]).select().single();
  if (error) throw new Error(error.message);

  return {
    id: data.id,
    itemId: data.item_id,
    itemType: data.item_type,
    author: data.author,
    text: data.text,
    userId: data.user_id,
    createdAt: data.created_at,
  };
}

export async function updatePlaceComment(commentId, text) {
  const clean = String(text || "").trim();
  if (!clean) throw new Error("Введите текст мнения");

  const { error } = await supabase
    .from("comments")
    .update({ text: clean })
    .eq("id", commentId);

  if (error) throw new Error(error.message);
  return true;
}

export async function deletePlaceComment(commentId) {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw new Error(error.message);
  return true;
}

export async function fetchUserLikes(userId) {
  if (!userId) return {};
  const { data, error } = await supabase
    .from("likes")
    .select("item_id,item_type")
    .eq("user_id", userId)
    .eq("item_type", ITEM_TYPE);

  if (error) throw new Error(error.message);

  const liked = {};
  (data || []).forEach((row) => {
    liked[`${row.item_type}-${row.item_id}`] = true;
  });
  return liked;
}

export async function togglePlaceLike(placeId, userId) {
  if (!userId) throw new Error("Нужно войти, чтобы поставить лайк");

  const { data: existing, error: findError } = await supabase
    .from("likes")
    .select("id")
    .eq("item_type", ITEM_TYPE)
    .eq("item_id", String(placeId))
    .eq("user_id", userId)
    .maybeSingle();

  if (findError) throw new Error(findError.message);

  let liked;
  if (existing?.id) {
    const { error: delError } = await supabase.from("likes").delete().eq("id", existing.id);
    if (delError) throw new Error(delError.message);
    liked = false;
  } else {
    const { error: insError } = await supabase.from("likes").insert([
      { item_id: String(placeId), item_type: ITEM_TYPE, user_id: userId },
    ]);
    if (insError) throw new Error(insError.message);
    liked = true;
  }

  const { count, error: countError } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("item_type", ITEM_TYPE)
    .eq("item_id", String(placeId));

  if (countError) throw new Error(countError.message);

  const likesCount = Number(count || 0);

  // Синхронизируем денормализованный счётчик в таблице places
  await supabase
    .from("places")
    .update({ likes_count: likesCount })
    .eq("id", String(placeId));

  return { liked, likesCount };
}

export async function recordPlaceView(placeId, userId) {
  if (!placeId) return 0;
  const viewerKey = await getViewerKey(userId);

  const { data, error } = await supabase.rpc("record_view", {
    p_item_type: ITEM_TYPE,
    p_item_id: String(placeId),
    p_viewer_key: viewerKey,
  });

  if (error) throw new Error(error.message);
  return Number(data || 0);
}
