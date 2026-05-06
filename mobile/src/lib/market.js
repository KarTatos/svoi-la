import { supabase } from "./supabase";
import { uploadPlacePhoto } from "./places";

function normalizePhotos(input) {
  const list = Array.isArray(input) ? input : [];
  return list
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .filter((v) => /^(https?:\/\/|blob:|data:image\/)/i.test(v));
}

function mapMarketItem(row) {
  return {
    id: row.id,
    title: row.title || "",
    price: row.price || "",
    description: row.description || "",
    photos: normalizePhotos(row.photos),
    telegram: row.telegram || "",
    phone: row.phone || "",
    author: row.author || "",
    userId: row.user_id || null,
    likes: Number(row.likes_count || 0),
    views: Number(row.views || 0),
    createdAt: row.created_at || null,
  };
}

export async function fetchMarket() {
  const { data, error } = await supabase
    .from("marketplace")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message || "Не удалось загрузить объявления");
  return (data || []).map(mapMarketItem);
}

export async function uploadMarketPhotos(assets) {
  const list = Array.isArray(assets) ? assets.slice(0, 5) : [];
  const urls = [];
  for (const asset of list) {
    const url = await uploadPlacePhoto(asset);
    if (!url) throw new Error("Не удалось загрузить фото");
    urls.push(url);
  }
  return urls;
}

export async function createMarketItem(payload) {
  const { data, error } = await supabase.from("marketplace").insert([payload]).select().single();
  if (error) throw new Error(error.message || "Не удалось создать объявление");
  return mapMarketItem(data);
}

export async function updateMarketItem(itemId, payload) {
  const { data, error } = await supabase
    .from("marketplace")
    .update(payload)
    .eq("id", itemId)
    .select()
    .single();

  if (error) throw new Error(error.message || "Не удалось обновить объявление");
  return mapMarketItem(data);
}

export async function deleteMarketItem(itemId) {
  const { error } = await supabase.from("marketplace").delete().eq("id", itemId);
  if (error) throw new Error(error.message || "Не удалось удалить объявление");
  await supabase.from("likes").delete().eq("item_id", String(itemId)).eq("item_type", "market");
  return true;
}

export async function fetchUserMarketLikes(userId) {
  if (!userId) return {};
  const { data, error } = await supabase
    .from("likes")
    .select("item_id,item_type")
    .eq("user_id", userId)
    .eq("item_type", "market");

  if (error) throw new Error(error.message);

  const liked = {};
  (data || []).forEach((row) => {
    liked[`market-${row.item_id}`] = true;
  });
  return liked;
}

export async function toggleMarketLike(itemId, userId) {
  if (!userId) throw new Error("Нужно войти, чтобы поставить лайк");

  const { data: existing, error: findError } = await supabase
    .from("likes")
    .select("id")
    .eq("item_type", "market")
    .eq("item_id", String(itemId))
    .eq("user_id", userId)
    .maybeSingle();

  if (findError) throw new Error(findError.message);

  let liked;
  if (existing?.id) {
    const { error: delError } = await supabase.from("likes").delete().eq("id", existing.id);
    if (delError) throw new Error(delError.message);
    liked = false;
  } else {
    const { error: insError } = await supabase
      .from("likes")
      .insert([{ item_id: String(itemId), item_type: "market", user_id: userId }]);
    if (insError) throw new Error(insError.message);
    liked = true;
  }

  const { count, error: countError } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("item_type", "market")
    .eq("item_id", String(itemId));

  if (countError) throw new Error(countError.message);

  return { liked, likesCount: Number(count || 0) };
}

export async function recordMarketView(itemId, userId) {
  const viewerKey = userId ? `user:${userId}` : `guest:${Date.now()}`;
  const { data, error } = await supabase.rpc("record_view", {
    p_item_type: "market",
    p_item_id: String(itemId),
    p_viewer_key: viewerKey,
  });

  if (error) throw new Error(error.message);
  return Number(data || 0);
}
