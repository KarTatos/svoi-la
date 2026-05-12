import { supabase } from "./supabase";
import { uploadPlacePhoto } from "./places";

function decodeHousingPhotos(raw) {
  if (Array.isArray(raw)) return raw.filter((v) => /^(https?:\/\/|blob:|data:image\/)/i.test(String(v || "").trim()));
  if (typeof raw !== "string" || !raw.trim()) return [];
  const value = raw.trim();
  if (value.startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((v) => /^(https?:\/\/|blob:|data:image\/)/i.test(String(v || "").trim()));
      }
    } catch {}
  }
  return /^(https?:\/\/|blob:|data:image\/)/i.test(value) ? [value] : [];
}

function encodeHousingPhotos(primary, photos = []) {
  const list = Array.from(new Set([primary, ...(photos || [])].filter(Boolean)));
  if (!list.length) return "";
  if (list.length === 1) return list[0];
  return JSON.stringify(list);
}

function mapHousing(h) {
  const photos = decodeHousingPhotos(h.photo);
  const tags = Array.isArray(h.tags) ? h.tags : [];
  const tg = tags.find((t) => String(t).startsWith("contact_tg:"));
  const msg = tags.find((t) => String(t).startsWith("contact_msg:"));
  const commentTag = tags.find((t) => String(t).startsWith("comment:"));
  let comment = "";
  if (commentTag) {
    const raw = String(commentTag).replace("comment:", "");
    try {
      comment = decodeURIComponent(raw);
    } catch {
      comment = raw;
    }
  }

  return {
    id: h.id,
    title: h.title || "",
    address: h.address || "",
    district: h.district || "",
    type: h.type || "studio",
    minPrice: Number(h.min_price || 0),
    beds: Number(h.beds || 0),
    baths: Number(h.baths || 0),
    tags: tags.filter((t) => !String(t).startsWith("contact_tg:") && !String(t).startsWith("contact_msg:") && !String(t).startsWith("comment:")),
    comment,
    telegram: tg ? String(tg).replace("contact_tg:", "") : "",
    messageContact: msg ? String(msg).replace("contact_msg:", "") : "",
    photos,
    photo: photos[0] || "",
    userId: h.user_id || null,
    likes: Number(h.likes_count || 0),
    views: Number(h.views || 0),
    updatedLabel: h.updated_label || "",
  };
}

export async function fetchHousing() {
  const { data, error } = await supabase.from("housing").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message || "Не удалось загрузить жильё");
  return (data || []).map(mapHousing);
}

export async function uploadHousingPhotos(assets) {
  const list = Array.isArray(assets) ? assets.slice(0, 10) : [];
  const urls = [];
  for (const asset of list) {
    const url = await uploadPlacePhoto(asset);
    if (!url) throw new Error("Не удалось загрузить фото");
    urls.push(url);
  }
  return urls;
}

export async function createHousing(payload) {
  const { data, error } = await supabase.from("housing").insert([payload]).select().single();
  if (error) throw new Error(error.message || "Не удалось создать объявление");
  return mapHousing(data);
}

export async function updateHousing(housingId, payload) {
  const { data, error } = await supabase.from("housing").update(payload).eq("id", housingId).select().single();
  if (error) throw new Error(error.message || "Не удалось обновить объявление");
  return mapHousing(data);
}

export async function deleteHousing(housingId) {
  const { error } = await supabase.from("housing").delete().eq("id", housingId);
  if (error) throw new Error(error.message || "Не удалось удалить объявление");
  await supabase.from("likes").delete().eq("item_id", String(housingId)).eq("item_type", "housing");
  return true;
}

export async function fetchUserHousingLikes(userId) {
  if (!userId) return {};
  const { data, error } = await supabase
    .from("likes")
    .select("item_id,item_type")
    .eq("user_id", userId)
    .eq("item_type", "housing");

  if (error) throw new Error(error.message);
  const liked = {};
  (data || []).forEach((row) => {
    liked[`housing-${row.item_id}`] = true;
  });
  return liked;
}

export async function toggleHousingLike(housingId, userId) {
  if (!userId) throw new Error("Нужно войти, чтобы поставить лайк");

  const { data: existing, error: findError } = await supabase
    .from("likes")
    .select("id")
    .eq("item_type", "housing")
    .eq("item_id", String(housingId))
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
      .insert([{ item_id: String(housingId), item_type: "housing", user_id: userId }]);
    if (insError) throw new Error(insError.message);
    liked = true;
  }

  const { count, error: countError } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("item_type", "housing")
    .eq("item_id", String(housingId));

  if (countError) throw new Error(countError.message);
  return { liked, likesCount: Number(count || 0) };
}

export async function recordHousingView(housingId, userId) {
  const viewerKey = userId ? `user:${userId}` : `guest:${Date.now()}`;
  const { data, error } = await supabase.rpc("record_view", {
    p_item_type: "housing",
    p_item_id: String(housingId),
    p_viewer_key: viewerKey,
  });

  if (error) throw new Error(error.message);
  return Number(data || 0);
}

export function buildHousingPayload(form, user, uploadedPhotos, existingPhotos = []) {
  const allPhotos = [...(existingPhotos || []), ...(uploadedPhotos || [])].slice(0, 10);
  const title = String(form.title || "").trim() || String(form.address || "").trim();
  const comment = String(form.comment || "").trim();
  const tags = [];
  if (String(form.telegram || "").trim()) tags.push(`contact_tg:${String(form.telegram).trim()}`);
  if (String(form.messageContact || "").trim()) tags.push(`contact_msg:${String(form.messageContact).trim()}`);
  if (comment) tags.push(`comment:${encodeURIComponent(comment)}`);

  return {
    title,
    address: String(form.address || "").trim(),
    district: String(form.district || "").trim(),
    type: String(form.type || "studio"),
    min_price: Number(form.minPrice || 0) || 0,
    beds: Number(form.beds || 0) || 0,
    baths: Number(form.baths || 0) || 0,
    tags,
    photo: encodeHousingPhotos(allPhotos[0] || "", allPhotos),
    user_id: user?.id || null,
  };
}
