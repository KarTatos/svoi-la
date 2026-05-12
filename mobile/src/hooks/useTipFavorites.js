import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

const KEY = "tip_favorites_v1";

export function useTipFavorites() {
  const [favorites, setFavorites] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        if (mounted) setFavorites(parsed && typeof parsed === "object" ? parsed : {});
      } catch {
        if (mounted) setFavorites({});
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleFavorite = useCallback((tipId) => {
    const key = `tip-${String(tipId)}`;
    setFavorites((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isFavorite = useCallback((tipId) => Boolean(favorites[`tip-${String(tipId)}`]), [favorites]);

  return useMemo(() => ({ favorites, ready, isFavorite, toggleFavorite }), [favorites, ready, isFavorite, toggleFavorite]);
}
