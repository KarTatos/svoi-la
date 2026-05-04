import { getAllComments, getEvents } from "../../lib/supabase";
import { decodeRichText, normalizePhotoList } from "../../components/svoi/config";

function groupComments(rows) {
  const grouped = {};
  (rows || []).forEach((c) => {
    if (!grouped[c.item_id]) grouped[c.item_id] = [];
    grouped[c.item_id].push({ id: c.id, author: c.author, text: c.text, userId: c.user_id });
  });
  return grouped;
}

function mapEvent(e, commentsByItem) {
  const rich = decodeRichText(e.description);
  return {
    id: e.id,
    cat: e.category,
    title: e.title,
    date: e.date,
    location: e.location || "",
    desc: rich.text,
    website: rich.website,
    photos: normalizePhotoList(rich.photos),
    author: e.author,
    userId: e.user_id,
    likes: e.likes_count || 0,
    views: Number(e.views || 0),
    comments: commentsByItem[e.id] || [],
    fromDB: true,
  };
}

export async function fetchEventsQuery() {
  const [eventsRes, commentsRes] = await Promise.all([getEvents(), getAllComments("event")]);
  const { data: dbEvents, error } = eventsRes;
  const { data: eventComments } = commentsRes;
  if (error) throw error;
  const eventsByItem = groupComments(eventComments);
  return (dbEvents || []).map((e) => mapEvent(e, eventsByItem));
}

