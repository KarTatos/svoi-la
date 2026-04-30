"use client";
import { useState, useEffect } from "react";

export function useUscisNews() {
  const CACHE_KEY = "uscis_news_cache_v1";
  const [news, setNews]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (Array.isArray(cached) && cached.length) {
          setNews(cached);
          setLoading(false);
        }
      }
    } catch {}

    fetch("/api/uscis-news")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const nextNews = Array.isArray(d.news) ? d.news : [];
        setNews(nextNews);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(nextNews)); } catch {}
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { news, loading };
}
