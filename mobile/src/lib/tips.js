import { decodeRichText, encodeRichText, limitCardText } from "../config/tips";
import { uploadPlacePhotos } from "./places";
import { supabase } from "./supabase";

function groupComments(rows) {
  const grouped = {};
  (rows || []).forEach((c) => {
    const key = String(c.item_id || "");
    if (!key) return;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      id: c.id,
      author: c.author || "Пользователь",
      text: c.text || "",
      userId: c.user_id || null,
    });
  });
  return grouped;
}

export async function fetchTips() {
  const [tipsRes, commentsRes] = await Promise.all([
    supabase.from("tips").select("*").order("created_at", { ascending: false }),
    supabase.from("comments").select("id,item_id,item_type,author,text,user_id,created_at").eq("item_type", "tip").order("created_at", { ascending: true }),
  ]);

  if (tipsRes.error) throw new Error(tipsRes.error.message || "Не удалось загрузить советы");
  if (commentsRes.error) throw new Error(commentsRes.error.message || "Не удалось загрузить комментарии");

  const byItem = groupComments(commentsRes.data || []);

  return (tipsRes.data || []).map((t) => {
    const rich = decodeRichText(t.text || "");
    return {
      id: t.id,
      cat: t.category,
      title: t.title || "",
      text: rich.text,
      photos: rich.photos,
      author: t.author || "Пользователь",
      userId: t.user_id || null,
      likes: Number(t.likes_count || 0),
      views: Number(t.views || 0),
      comments: byItem[String(t.id)] || [],
      fromDB: true,
    };
  });
}

export async function createTip({ cat, title, text, photos, user }) {
  const uploaded = await uploadPlacePhotos(photos || []);
  const payload = {
    category: cat,
    title: String(title || "").trim(),
    text: encodeRichText(limitCardText(text || "").trim(), uploaded),
    author: user?.name || user?.email || "Пользователь",
    user_id: user?.id || null,
  };

  const { data, error } = await supabase.from("tips").insert([payload]).select().single();
  if (error) throw new Error(error.message || "Не удалось добавить совет");
  const rich = decodeRichText(data.text || "");

  return {
    id: data.id,
    cat: data.category,
    title: data.title,
    text: rich.text,
    photos: rich.photos,
    author: data.author,
    userId: data.user_id,
    likes: Number(data.likes_count || 0),
    views: Number(data.views || 0),
    comments: [],
    fromDB: true,
  };
}

export async function updateTip({ id, cat, title, text, photos, user, existingPhotos = [] }) {
  const newUploaded = await uploadPlacePhotos(photos || []);
  const mergedPhotos = [...(existingPhotos || []), ...newUploaded].slice(0, 3);
  const payload = {
    category: cat,
    title: String(title || "").trim(),
    text: encodeRichText(limitCardText(text || "").trim(), mergedPhotos),
    author: user?.name || user?.email || "Пользователь",
  };

  const { data, error } = await supabase.from("tips").update(payload).eq("id", id).select().single();
  if (error) throw new Error(error.message || "Не удалось обновить совет");
  const rich = decodeRichText(data.text || "");

  return {
    id: data.id,
    cat: data.category,
    title: data.title,
    text: rich.text,
    photos: rich.photos,
    author: data.author,
    userId: data.user_id,
    likes: Number(data.likes_count || 0),
    views: Number(data.views || 0),
    comments: [],
    fromDB: true,
  };
}

export async function deleteTip(id) {
  const { error } = await supabase.from("tips").delete().eq("id", id);
  if (error) throw new Error(error.message || "Не удалось удалить совет");
  await supabase.from("comments").delete().eq("item_id", String(id)).eq("item_type", "tip");
  await supabase.from("likes").delete().eq("item_id", String(id)).eq("item_type", "tip");
  return true;
}
