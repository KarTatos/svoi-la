import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ═══ AUTH ═══
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ═══ PLACES ═══
export async function getPlaces() {
  const { data, error } = await supabase.from('places').select('*').order('created_at', { ascending: false });
  return { data: data || [], error };
}

export async function addPlace(place) {
  const { data, error } = await supabase.from('places').insert([place]).select();
  return { data, error };
}

export async function updatePlace(id, updates) {
  const { data, error } = await supabase.from('places').update(updates).eq('id', id).select();
  return { data, error };
}

export async function deletePlace(id) {
  const { error } = await supabase.from('places').delete().eq('id', id);
  if (error) return { error };
  await supabase.from('comments').delete().eq('item_id', id).eq('item_type', 'place');
  await supabase.from('likes').delete().eq('item_id', id).eq('item_type', 'place');
  return { error: null };
}

// ═══ TIPS ═══
export async function getTips() {
  const { data, error } = await supabase.from('tips').select('*').order('created_at', { ascending: false });
  return { data: data || [], error };
}

export async function addTip(tip) {
  const { data, error } = await supabase.from('tips').insert([tip]).select();
  return { data, error };
}

export async function updateTip(id, updates) {
  const { data, error } = await supabase.from('tips').update(updates).eq('id', id).select();
  return { data, error };
}

export async function deleteTip(id) {
  const { error } = await supabase.from('tips').delete().eq('id', id);
  if (error) return { error };
  await supabase.from('comments').delete().eq('item_id', id).eq('item_type', 'tip');
  await supabase.from('likes').delete().eq('item_id', id).eq('item_type', 'tip');
  return { error: null };
}

// ═══ EVENTS ═══
export async function getEvents() {
  const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
  return { data: data || [], error };
}

export async function addEvent(event) {
  const { data, error } = await supabase.from('events').insert([event]).select();
  return { data, error };
}

export async function updateEvent(id, updates) {
  const { data, error } = await supabase.from('events').update(updates).eq('id', id).select();
  return { data, error };
}

export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) return { error };
  await supabase.from('comments').delete().eq('item_id', id).eq('item_type', 'event');
  await supabase.from('likes').delete().eq('item_id', id).eq('item_type', 'event');
  return { error: null };
}

// HOUSING
export async function getHousing() {
  const { data, error } = await supabase.from('housing').select('*').order('created_at', { ascending: false });
  return { data: data || [], error };
}

export async function addHousing(housing) {
  const { data, error } = await supabase.from('housing').insert([housing]).select();
  return { data, error };
}

export async function updateHousing(id, updates, userId = null) {
  let query = supabase.from('housing').update(updates).eq('id', id);
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query.select();
  return { data, error };
}

export async function deleteHousing(id, userId = null) {
  let query = supabase.from('housing').delete().eq('id', id);
  if (userId) query = query.eq('user_id', userId);
  const { error } = await query;
  if (error) return { error };
  await supabase.from('likes').delete().eq('item_id', id).eq('item_type', 'housing');
  return { error: null };
}

// ═══ COMMENTS ═══
export async function getComments(itemId, itemType) {
  const { data, error } = await supabase.from('comments').select('*')
    .eq('item_id', itemId).eq('item_type', itemType)
    .order('created_at', { ascending: true });
  return { data: data || [], error };
}

export async function getAllComments(itemType) {
  const { data, error } = await supabase.from('comments').select('*')
    .eq('item_type', itemType)
    .order('created_at', { ascending: true });
  return { data: data || [], error };
}

export async function addComment(comment) {
  const { data, error } = await supabase.from('comments').insert([comment]).select();
  return { data, error };
}

export async function updateComment(id, text) {
  const { data, error } = await supabase.from('comments').update({ text }).eq('id', id).select();
  return { data, error };
}

export async function deleteComment(id) {
  return supabase.from('comments').delete().eq('id', id);
}

// ═══ LIKES ═══
export async function toggleLike(itemId, itemType, userId) {
  const { data: existing } = await supabase.from('likes')
    .select('id').eq('item_id', itemId).eq('item_type', itemType).eq('user_id', userId).single();

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('likes').insert([{ item_id: itemId, item_type: itemType, user_id: userId }]);
    return true;
  }
}

export async function getUserLikes(userId) {
  const { data } = await supabase.from('likes').select('item_id, item_type').eq('user_id', userId);
  const liked = {};
  (data || []).forEach(l => { liked[`${l.item_type}-${l.item_id}`] = true; });
  return liked;
}

// ═══ SEARCH (for AI chat) ═══
export async function searchPlaces(query) {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2).slice(0, 3);
  if (words.length === 0) return [];
  const conditions = words.map(w =>
    `name.ilike.%${w}%,tip.ilike.%${w}%,address.ilike.%${w}%,district.ilike.%${w}%`
  ).join(',');
  const { data } = await supabase.from('places').select('*').or(conditions).limit(10);
  return data || [];
}

// ═══ PHOTO UPLOAD ═══
export async function uploadPhoto(file) {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
  const filePath = `photos/${fileName}`;

  const { error } = await supabase.storage
    .from('LAHELPBOT')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('LAHELPBOT')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
