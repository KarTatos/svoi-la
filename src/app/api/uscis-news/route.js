import { createClient } from "@supabase/supabase-js";

// Lazy-init to avoid build-time crash when env vars aren't available
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

export async function GET() {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("uscis_news")
      .select("id, title_ru, summary_ru, url, published_at")
      .order("published_at", { ascending: false })
      .limit(5);

    if (error) throw error;
    return Response.json({ news: data || [] });
  } catch (err) {
    console.error("[uscis-news] GET error:", err);
    return Response.json({ news: [] }, { status: 500 });
  }
}
