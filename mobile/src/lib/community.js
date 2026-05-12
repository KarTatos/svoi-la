import { supabase } from "./supabase";
import { toggleLike, fetchUserLikedIds } from "./likes";

function mapPost(row) {
  return {
    id: row.id,
    userId: row.user_id || null,
    author: row.author || "Аноним",
    avatarUrl: row.avatar_url || null,
    text: row.text || "",
    parentId: row.parent_id || null,
    likesCount: Number(row.likes_count || 0),
    repliesCount: Number(row.replies_count || 0),
    createdAt: row.created_at || null,
  };
}

// ─── Feed ───────────────────────────────────────────────────────────────────

export async function fetchPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw new Error(error.message);
  return (data || []).map(mapPost);
}

export async function fetchPostById(postId) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", String(postId))
    .single();
  if (error) throw new Error(error.message);
  return mapPost(data);
}

export async function fetchReplies(parentId) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("parent_id", String(parentId))
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map(mapPost);
}

// ─── Create / delete ────────────────────────────────────────────────────────

export async function createPost(payload) {
  const { data, error } = await supabase
    .from("posts")
    .insert([payload])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapPost(data);
}

export async function deletePost(postId) {
  const { error } = await supabase.from("posts").delete().eq("id", String(postId));
  if (error) throw new Error(error.message);
  return true;
}

// ─── Likes ──────────────────────────────────────────────────────────────────

export async function togglePostLike(postId, userId) {
  const nowLiked = await toggleLike("post", postId, userId);
  const { data } = await supabase
    .from("posts")
    .select("likes_count")
    .eq("id", String(postId))
    .single();
  return { liked: nowLiked, likesCount: Number(data?.likes_count || 0) };
}

export async function fetchUserPostLikes(userId) {
  const ids = await fetchUserLikedIds("post", userId);
  // Return map { postId: true } for backward compat with existing hook callers
  const map = {};
  ids.forEach((id) => { map[id] = true; });
  return map;
}
