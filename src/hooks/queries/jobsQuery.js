import { getJobs } from "../../lib/supabase";

export function mapJob(j) {
  return {
    id: j.id,
    type: j.type,
    title: j.title,
    district: j.district,
    price: j.price,
    price_type: j.price_type || "",
    schedule: j.schedule,
    english_lvl: j.english_lvl,
    work_auth: j.work_auth,
    description: j.description,
    telegram: j.telegram,
    phone: j.phone,
    author: j.author,
    user_id: j.user_id,
    likes: j.likes_count || 0,
    views: Number(j.views || 0),
    created_at: j.created_at,
  };
}

export async function fetchJobsQuery() {
  const { data, error } = await getJobs();
  if (error) throw error;
  return (data || []).map(mapJob);
}
