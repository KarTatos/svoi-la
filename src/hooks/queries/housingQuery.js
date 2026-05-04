import { getHousing } from "../../lib/supabase";
import { decodeHousingPhotos } from "../../components/svoi/config";
import { normalizeAddressText } from "../../lib/text";

function mapHousing(h) {
  const photos = decodeHousingPhotos(h.photo);
  const tagList = Array.isArray(h.tags) ? h.tags : [];
  const tgTag = tagList.find((t) => String(t).startsWith("contact_tg:"));
  const msgTag = tagList.find((t) => String(t).startsWith("contact_msg:"));
  const commentTag = tagList.find((t) => String(t).startsWith("comment:"));
  let commentText = "";
  if (commentTag) {
    const raw = String(commentTag).replace("comment:", "");
    try {
      commentText = decodeURIComponent(raw);
    } catch {
      commentText = raw;
    }
  }

  return {
    id: h.id,
    title: h.title || "",
    address: normalizeAddressText(h.address || ""),
    district: h.district || "",
    type: h.type || "studio",
    minPrice: Number(h.min_price ?? h.minPrice ?? 0),
    options: Array.isArray(h.price_options)
      ? h.price_options
      : Array.isArray(h.options)
        ? h.options
        : [],
    beds: Number(h.beds ?? 0),
    baths: Number(h.baths ?? 0),
    updatedLabel: h.updated_label || h.updatedLabel || "",
    tags: tagList.filter(
      (t) =>
        !String(t).startsWith("contact_tg:") &&
        !String(t).startsWith("contact_msg:") &&
        !String(t).startsWith("comment:"),
    ),
    comment: commentText,
    telegram: tgTag ? String(tgTag).replace("contact_tg:", "").trim() : "",
    messageContact: msgTag ? String(msgTag).replace("contact_msg:", "").trim() : "",
    photos,
    photo: photos[0] || "",
    userId: h.user_id,
    likes: h.likes_count || 0,
    views: Number(h.views || 0),
    fromDB: true,
  };
}

export async function fetchHousingQuery() {
  const { data: dbHousing, error } = await getHousing();
  if (error) throw error;
  return (dbHousing || []).map((h) => mapHousing(h));
}

