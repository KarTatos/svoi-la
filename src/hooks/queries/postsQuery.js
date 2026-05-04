import { getPosts, getAllComments } from "../../lib/supabase";

export function mapPost(row, commentsByItem) {
  return {
    id: row.id,
    text: row.text || "",
    author: row.author || "Пользователь",
    userId: row.user_id || null,
    likes: Number(row.likes_count || 0),
    created_at: row.created_at,
    comments: commentsByItem[row.id] || [],
  };
}

function groupComments(rows) {
  const grouped = {};
  (rows || []).forEach((c) => {
    const rawId = String(c.item_id || "");
    const itemId = rawId.startsWith("post:") ? rawId.slice(5) : rawId;
    if (!itemId) return;
    if (!grouped[itemId]) grouped[itemId] = [];
    grouped[itemId].push({ id: c.id, author: c.author, text: c.text, userId: c.user_id });
  });
  return grouped;
}

export async function fetchPostsQuery() {
  const [postsRes, postCommentsRes, legacyCommentsRes] = await Promise.all([
    getPosts(),
    getAllComments("post"),
    getAllComments("tip"),
  ]);
  const { data: posts, error } = postsRes;
  const { data: postComments } = postCommentsRes;
  const { data: legacyComments } = legacyCommentsRes;
  if (error) throw error;
  const legacyOnly = (legacyComments || []).filter((c) => String(c.item_id || "").startsWith("post:"));
  const byItem = groupComments([...(postComments || []), ...legacyOnly]);
  return (posts || []).map((p) => mapPost(p, byItem));
}
