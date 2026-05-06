import { useEffect, useState } from "react";

export function useUscisNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const base = (process.env.EXPO_PUBLIC_WEB_API_BASE_URL || "").trim();
    if (!base) return;

    let cancelled = false;
    setLoading(true);

    fetch(`${base.replace(/\/$/, "")}/api/uscis-news`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setNews(Array.isArray(data?.news) ? data.news : []);
      })
      .catch(() => {
        if (cancelled) return;
        setNews([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { news, loading, hasApiBase: Boolean((process.env.EXPO_PUBLIC_WEB_API_BASE_URL || "").trim()) };
}
