import { supabase, isSupabaseConfigured } from "./supabase";
import { uploadPlacePhoto } from "./places";

export async function fetchEvents() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, description, category, location, address, lat, lng, " +
      "date, ends_at, cover_url, photos, price, url, organizer, author, user_id, views, created_at"
    )
    .order("date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function uploadEventPhotos(assets) {
  const list = Array.isArray(assets) ? assets.slice(0, 3) : [];
  const urls = [];
  for (const asset of list) {
    const url = await uploadPlacePhoto(asset);
    if (!url) throw new Error("Не удалось загрузить фото");
    urls.push(url);
  }
  return urls;
}

export async function fetchEventById(id) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchEventAttendees(eventId) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("event_attendees")
    .select("id, user_id, name, avatar_url, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function createEvent(fields) {
  const { data, error } = await supabase
    .from("events")
    .insert([fields])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id, fields) {
  const { data, error } = await supabase
    .from("events")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleAttendee(eventId, user) {
  if (!user?.id) throw new Error("Нужно войти");
  const { data: existing } = await supabase
    .from("event_attendees")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("event_attendees")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return { attending: false };
  } else {
    const { error } = await supabase.from("event_attendees").insert([{
      event_id: eventId,
      user_id: user.id,
      name: user.name || user.email?.split("@")[0] || "Участник",
      avatar_url: user.avatarUrl || null,
    }]);
    if (error) throw error;
    return { attending: true };
  }
}
