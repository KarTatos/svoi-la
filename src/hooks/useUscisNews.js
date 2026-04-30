"use client";
import { useState, useEffect } from "react";

export function useUscisNews() {
  const [news, setNews]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/uscis-news")
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setNews(d.news || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { news, loading };
}
