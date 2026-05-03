import { getAllComments, getPlaces } from "../../lib/supabase";
import { normalizePhotoList, PLACE_CAT_IDS } from "../../components/svoi/config";

function groupComments(rows) {
  const grouped = {};
  (rows || []).forEach((c) => {
    if (!grouped[c.item_id]) grouped[c.item_id] = [];
    grouped[c.item_id].push({ id: c.id, author: c.author, text: c.text, userId: c.user_id });
  });
  return grouped;
}

function mapPlace(p, commentsByItem) {
  return {
    id: p.id,
    cat: p.category,
    district: p.district,
    name: p.name,
    address: p.address || "",
    tip: p.tip,
    addedBy: p.added_by,
    userId: p.user_id,
    img: p.img || "📍",
    photos: normalizePhotoList(p.photos),
    likes: p.likes_count || 0,
    views: Number(p.views || 0),
    comments: commentsByItem[p.id] || [],
    lat: Number.isFinite(Number(p.lat)) ? Number(p.lat) : null,
    lng: Number.isFinite(Number(p.lng)) ? Number(p.lng) : null,
    fromDB: true,
  };
}

export async function fetchPlacesQuery() {
  const [placesRes, commentsRes] = await Promise.all([getPlaces(), getAllComments("place")]);
  const { data: dbPlaces, error } = placesRes;
  const { data: placeComments } = commentsRes;
  if (error) throw error;
  const placesByItem = groupComments(placeComments);
  return (dbPlaces || [])
    .map((p) => mapPlace(p, placesByItem))
    .filter((p) => PLACE_CAT_IDS.has(p.cat));
}

