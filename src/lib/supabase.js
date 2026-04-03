import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Auth helpers ───
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  return { data, error };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ─── Places CRUD ───
export async function getPlaces(district, category) {
  let query = supabase.from('places').select('*').order('created_at', { ascending: false });
  if (district) query = query.eq('district', district);
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  return { data, error };
}

export async function addPlace(place) {
  const { data, error } = await supabase.from('places').insert([place]).select();
  return { data, error };
}

export async function togglePlaceLike(placeId, userId) {
  // Check if already liked
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('place_id', placeId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id);
    return false; // unliked
  } else {
    await supabase.from('likes').insert([{ place_id: placeId, user_id: userId }]);
    return true; // liked
  }
}

// ─── Search places for AI chat context ───
export async function searchPlaces(query) {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .or(`name.ilike.%${query}%,tip.ilike.%${query}%,address.ilike.%${query}%,district.ilike.%${query}%`)
    .limit(10);
  return { data, error };
}
