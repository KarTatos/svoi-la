import { getMarket } from "../../lib/supabase";

export function mapMarketItem(m) {
  return {
    id: m.id,
    title: m.title || "",
    price: m.price || "",
    description: m.description || "",
    photos: Array.isArray(m.photos) ? m.photos : [],
    telegram: m.telegram || "",
    phone: m.phone || "",
    author: m.author || "",
    user_id: m.user_id,
    likes: m.likes_count || 0,
    views: Number(m.views || 0),
    created_at: m.created_at,
  };
}

export async function fetchMarketQuery() {
  const { data, error } = await getMarket();
  if (error) throw error;
  return (data || []).map(mapMarketItem);
}
