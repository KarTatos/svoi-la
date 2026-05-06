import { supabase } from "./supabase";
import { PLACE_CAT_IDS } from "../config/places";
import { prepareImageForUpload } from "./images";

const PHOTOS_BUCKET = "LAHELPBOT";

function normalizePhotos(input) {
  const list = Array.isArray(input) ? input : [];
  return list
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .filter((v) => /^(https?:\/\/|blob:|data:image\/)/i.test(v));
}

function mapPlace(p) {
  return {
    id: p.id,
    cat: p.category,
    district: p.district,
    name: p.name,
    address: p.address || "",
    tip: p.tip || "",
    addedBy: p.added_by || "",
    userId: p.user_id || null,
    img: p.img || "📍",
    photos: normalizePhotos(p.photos),
    likes: Number(p.likes_count || 0),
    views: Number(p.views || 0),
    comments: [],
    lat: Number.isFinite(Number(p.lat)) ? Number(p.lat) : null,
    lng: Number.isFinite(Number(p.lng)) ? Number(p.lng) : null,
  };
}

export async function fetchPlaces() {
  const { data, error } = await supabase
    .from("places")
    .select("id, category, district, name, address, tip, added_by, user_id, img, photos, likes_count, views, lat, lng")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map(mapPlace).filter((p) => PLACE_CAT_IDS.has(p.cat));
}

function getExtFromAsset(asset) {
  const name = String(asset?.fileName || asset?.name || "").toLowerCase();
  const fromName = name.includes(".") ? name.split(".").pop() : "";
  if (fromName) return fromName;
  const mime = String(asset?.mimeType || "").toLowerCase();
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "jpg";
}

export async function uploadPlacePhoto(asset) {
  const prepared = await prepareImageForUpload(asset, { maxSide: 1600, compress: 0.82 });
  const uri = String(prepared?.uri || "");
  if (!uri) throw new Error("Фото без uri");

  const ext = getExtFromAsset(prepared);
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const filePath = `photos/${fileName}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(filePath, arrayBuffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: prepared?.mimeType || `image/${ext}`,
    });

  if (error) throw new Error(error.message || "Не удалось загрузить фото");

  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(filePath);
  return data?.publicUrl || "";
}

export async function uploadPlacePhotos(assets) {
  const list = Array.isArray(assets) ? assets.slice(0, 5) : [];
  const urls = [];
  for (const asset of list) {
    const url = await uploadPlacePhoto(asset);
    if (!url) throw new Error("Не удалось получить URL фото");
    urls.push(url);
  }
  return urls;
}

export async function deletePlace(placeId) {
  const { error } = await supabase.from("places").delete().eq("id", String(placeId));
  if (error) throw new Error(error.message || "Не удалось удалить место");
  return true;
}

export async function updatePlace(placeId, payload) {
  const { data, error } = await supabase
    .from("places")
    .update(payload)
    .eq("id", String(placeId))
    .select("id, category, district, name, address, tip, added_by, user_id, img, photos, likes_count, views, lat, lng")
    .single();

  if (error) throw new Error(error.message || "Не удалось обновить место");
  return mapPlace(data);
}

export async function createPlace(payload) {
  const { data, error } = await supabase
    .from("places")
    .insert([payload])
    .select("id, category, district, name, address, tip, added_by, user_id, img, photos, likes_count, views, lat, lng")
    .single();

  if (error) throw new Error(error.message || "Не удалось создать место");
  return mapPlace(data);
}
