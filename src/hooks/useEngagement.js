import { useCallback, useEffect, useState } from "react";
import { getUserLikes, toggleLike as dbToggleLike } from "../lib/supabase";

export function useEngagement({
  user,
  onRequireAuth,
  setPlaces,
  setTips,
  setEvents,
  setHousing,
}) {
  const [liked, setLiked] = useState({});
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    try {
      const key = `favorites_${user?.id || "guest"}`;
      const raw = localStorage.getItem(key);
      setFavorites(raw ? JSON.parse(raw) : {});
    } catch {
      setFavorites({});
    }
  }, [user?.id]);

  useEffect(() => {
    try {
      const key = `favorites_${user?.id || "guest"}`;
      localStorage.setItem(key, JSON.stringify(favorites || {}));
    } catch {}
  }, [favorites, user?.id]);

  useEffect(() => {
    let canceled = false;
    async function loadLikes() {
      if (!user?.id) {
        setLiked({});
        return;
      }
      const userLikes = await getUserLikes(user.id);
      if (!canceled) setLiked(userLikes || {});
    }
    loadLikes();
    return () => {
      canceled = true;
    };
  }, [user?.id]);

  const handleToggleLike = useCallback(async (itemId, itemType) => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    const key = `${itemType}-${itemId}`;
    const wasLiked = liked[key];
    setLiked((prev) => ({ ...prev, [key]: !wasLiked }));
    const countUpdater = (items) =>
      items.map((item) =>
        item.id === itemId
          ? { ...item, likes: (item.likes || 0) + (wasLiked ? -1 : 1) }
          : item
      );
    if (itemType === "place") setPlaces(countUpdater);
    else if (itemType === "tip") setTips(countUpdater);
    else if (itemType === "event") setEvents(countUpdater);
    else if (itemType === "housing") setHousing(countUpdater);
    await dbToggleLike(itemId, itemType, user.id);
  }, [liked, onRequireAuth, setEvents, setHousing, setPlaces, setTips, user]);

  const toggleFavorite = useCallback((itemId, itemType) => {
    const key = `${itemType}-${itemId}`;
    setFavorites((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetEngagement = useCallback(() => {
    setLiked({});
    setFavorites({});
  }, []);

  return {
    liked,
    favorites,
    handleToggleLike,
    toggleFavorite,
    resetEngagement,
  };
}

