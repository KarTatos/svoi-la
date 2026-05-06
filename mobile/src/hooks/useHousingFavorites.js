import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

const KEY = "housing_favorites_v1";

export function useHousingFavorites() {
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        setFavorites(raw ? JSON.parse(raw) : {});
      } catch {
        setFavorites({});
      }
    })();
  }, []);

  const toggleFavorite = useCallback((id) => {
    const key = `housing-${String(id)}`;
    setFavorites((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isFavorite = useCallback((id) => Boolean(favorites[`housing-${String(id)}`]), [favorites]);

  return useMemo(() => ({ favorites, isFavorite, toggleFavorite }), [favorites, isFavorite, toggleFavorite]);
}
