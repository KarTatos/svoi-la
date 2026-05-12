import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export function useUscisNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;
    setLoading(true);

    supabase
      .from("uscis_news")
      .select("id, title_ru, summary_ru, url, published_at, tag")
      .order("published_at", { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && Array.isArray(data)) setNews(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { news, loading };
}
