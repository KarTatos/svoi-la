import { getAllComments, getTips } from "../../lib/supabase";
import { decodeRichText, normalizePhotoList } from "../../components/svoi/config";

function groupComments(rows) {
  const grouped = {};
  (rows || []).forEach((c) => {
    if (!grouped[c.item_id]) grouped[c.item_id] = [];
    grouped[c.item_id].push({ id: c.id, author: c.author, text: c.text, userId: c.user_id });
  });
  return grouped;
}

function mapTip(t, commentsByItem) {
  const rich = decodeRichText(t.text);
  return {
    id: t.id,
    cat: t.category,
    title: t.title,
    text: rich.text,
    photos: normalizePhotoList(rich.photos),
    author: t.author,
    userId: t.user_id,
    likes: t.likes_count || 0,
    views: Number(t.views || 0),
    comments: commentsByItem[t.id] || [],
    fromDB: true,
  };
}

export async function fetchTipsQuery() {
  const [tipsRes, commentsRes] = await Promise.all([getTips(), getAllComments("tip")]);
  const { data: dbTips, error } = tipsRes;
  const { data: tipComments } = commentsRes;
  if (error) throw error;
  const tipsByItem = groupComments(tipComments);
  return (dbTips || []).map((t) => mapTip(t, tipsByItem));
}

