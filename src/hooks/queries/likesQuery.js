import { getUserLikes } from "../../lib/supabase";

export async function fetchLikesQuery(userId) {
  if (!userId) return {};
  const liked = await getUserLikes(userId);
  return liked || {};
}
