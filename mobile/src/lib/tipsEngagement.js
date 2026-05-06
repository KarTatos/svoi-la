import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

const ITEM_TYPE = "tip";
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

export async function fetchUserTipLikes(userId) {
  if (!userId) return {};
  const { data, error } = await supabase
    .from("likes")
    .select("item_id,item_type")
    .eq("user_id", userId)
    .eq("item_type", ITEM_TYPE);

  if (error) throw new Error(error.message);
  const liked = {};
  (data || []).forEach((row) => {
    liked[`tip-${row.item_id}`] = true;
  });
  return liked;
}

export async function toggleTipLike(tipId, userId) {
  if (!userId) throw new Error("Нужно войти, чтобы поставить лайк");

  const { data: existing, error: findError } = await supabase
    .from("likes")
    .select("id")
    .eq("item_type", ITEM_TYPE)
    .eq("item_id", String(tipId))
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
      { item_id: String(tipId), item_type: ITEM_TYPE, user_id: userId },
    ]);
    if (insError) throw new Error(insError.message);
    liked = true;
  }

  const { count, error: countError } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("item_type", ITEM_TYPE)
    .eq("item_id", String(tipId));

  if (countError) throw new Error(countError.message);

  return { liked, likesCount: Number(count || 0) };
}

export async function recordTipView(tipId, userId) {
  const viewerKey = await getViewerKey(userId);
  const { data, error } = await supabase.rpc("record_view", {
    p_item_type: ITEM_TYPE,
    p_item_id: String(tipId),
    p_viewer_key: viewerKey,
  });
  if (error) throw new Error(error.message);
  return Number(data || 0);
}

export async function addTipComment(tipId, user, text) {
  const clean = String(text || "").trim();
  if (!clean) throw new Error("Введите комментарий");
  if (!user?.id) throw new Error("Нужно войти, чтобы оставить комментарий");

  const payload = {
    item_id: String(tipId),
    item_type: ITEM_TYPE,
    author: user.name || user.email || "Пользователь",
    text: clean,
    user_id: user.id,
  };

  const { data, error } = await supabase.from("comments").insert([payload]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateTipComment(commentId, text) {
  const clean = String(text || "").trim();
  if (!clean) throw new Error("Введите комментарий");
  const { data, error } = await supabase
    .from("comments")
    .update({ text: clean })
    .eq("id", commentId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTipComment(commentId) {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw new Error(error.message);
  return true;
}
