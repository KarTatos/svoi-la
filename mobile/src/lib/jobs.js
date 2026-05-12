import { supabase, isSupabaseConfigured } from "./supabase";
import { uploadPlacePhoto } from "./places";

export async function uploadJobPhotos(assets) {
  const list = Array.isArray(assets) ? assets.slice(0, 3) : [];
  const urls = [];
  for (const asset of list) {
    const url = await uploadPlacePhoto(asset);
    if (!url) throw new Error("Не удалось загрузить фото");
    urls.push(url);
  }
  return urls;
}

export async function fetchJobs(type = null) {
  if (!isSupabaseConfigured) return [];
  let query = supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchJobById(id) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createJob(fields) {
  const { data, error } = await supabase
    .from("jobs")
    .insert([fields])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateJob(id, fields) {
  const { data, error } = await supabase
    .from("jobs")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteJob(id) {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw error;
}
