import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "job_bookmarks";

export function useJobBookmarks() {
  const [bookmarked, setBookmarked] = useState(new Set());

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      try {
        const ids = raw ? JSON.parse(raw) : [];
        setBookmarked(new Set(ids.map(String)));
      } catch {
        setBookmarked(new Set());
      }
    });
  }, []);

  const toggle = useCallback((id) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      const sid = String(id);
      if (next.has(sid)) next.delete(sid);
      else next.add(sid);
      AsyncStorage.setItem(KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isBookmarked = useCallback((id) => bookmarked.has(String(id)), [bookmarked]);

  return { isBookmarked, toggle, bookmarked };
}
