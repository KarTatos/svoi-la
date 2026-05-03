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
    if (!grouped[c.item_id]) grouped[c.item_id] = [];
    grouped[c.item_id].push({ id: c.id, author: c.author, text: c.text, userId: c.user_id });
  });
  return grouped;
}

export async function fetchPostsQuery() {
  const [postsRes, commentsRes] = await Promise.all([getPosts(), getAllComments("post")]);
  const { data: posts, error } = postsRes;
  const { data: postComments } = commentsRes;
  if (error) throw error;
  const byItem = groupComments(postComments);
  return (posts || []).map((p) => mapPost(p, byItem));
}
