import { useCallback, useEffect, useRef } from "react";

export function useViewTracker({
  user,
  authReady,
  scr,
  activePlace,
  activeHousing,
  setPlaces,
  setTips,
  setEvents,
  setHousing,
  setSelPlace,
  setSelHousing,
}) {
  const viewedRef = useRef({ place: null, housing: null });

  const setCardViewsLocally = useCallback((itemType, itemId, views) => {
    const nextViews = Number(views || 0);
    const updater = (row) => (row.id === itemId ? { ...row, views: nextViews } : row);
    if (itemType === "place") {
      setPlaces((prev) => prev.map(updater));
      if (typeof setSelPlace === "function") {
        setSelPlace((prev) => (prev?.id === itemId ? { ...prev, views: nextViews } : prev));
      }
    } else if (itemType === "tip") {
      setTips((prev) => prev.map(updater));
    } else if (itemType === "event") {
      setEvents((prev) => prev.map(updater));
    } else if (itemType === "housing") {
      setHousing((prev) => prev.map(updater));
      if (typeof setSelHousing === "function") {
        setSelHousing((prev) => (prev?.id === itemId ? { ...prev, views: nextViews } : prev));
      }
    }
  }, [setEvents, setHousing, setPlaces, setSelHousing, setSelPlace, setTips]);

  const getViewerKey = useCallback(() => {
    if (user?.id) return `user:${user.id}`;
    try {
      const storageKey = "la_viewer_key";
      let guestKey = localStorage.getItem(storageKey);
      if (!guestKey) {
        guestKey = (window?.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
        localStorage.setItem(storageKey, guestKey);
      }
      return `guest:${guestKey}`;
    } catch {
      return "guest:anonymous";
    }
  }, [user?.id]);

  const trackCardView = useCallback(async (itemType, item) => {
    const itemId = item?.id;
    if (!itemId || !item?.fromDB) return false;
    if (!authReady) return false;
    const viewerKey = getViewerKey();
    if (!viewerKey) return false;
    const viewedStorageKey = `viewed_once_${viewerKey}`;
    const viewedItemKey = `${itemType}:${itemId}`;
    try {
      const viewedRaw = localStorage.getItem(viewedStorageKey);
      const viewedMap = viewedRaw ? JSON.parse(viewedRaw) : {};
      if (viewedMap?.[viewedItemKey]) return true;
    } catch {}
    try {
      const response = await fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId, viewerKey }),
      });
      const payload = await response.json().catch(() => null);
      const nextViews = Number(payload?.views);
      const isCounted = typeof payload?.counted === "boolean";
      if (response.ok && isCounted && Number.isFinite(nextViews)) {
        setCardViewsLocally(itemType, itemId, nextViews);
        try {
          const viewedRaw = localStorage.getItem(viewedStorageKey);
          const viewedMap = viewedRaw ? JSON.parse(viewedRaw) : {};
          viewedMap[viewedItemKey] = true;
          localStorage.setItem(viewedStorageKey, JSON.stringify(viewedMap));
        } catch {}
        return true;
      }
      console.error("View track failed:", itemType, itemId, payload?.error || response.status);
      return false;
    } catch (err) {
      console.error("View track request error:", itemType, itemId, err);
      return false;
    }
  }, [authReady, getViewerKey, setCardViewsLocally]);

  useEffect(() => {
    if (scr !== "place-item" || !activePlace?.id) return;
    if (viewedRef.current.place === activePlace.id) return;
    let canceled = false;
    (async () => {
      const ok = await trackCardView("place", activePlace);
      if (!canceled && ok) viewedRef.current.place = activePlace.id;
    })();
    return () => { canceled = true; };
  }, [scr, activePlace?.id, trackCardView]);

  useEffect(() => {
    if (scr !== "place-item") viewedRef.current.place = null;
  }, [scr]);

  useEffect(() => {
    if (scr !== "housing-item" || !activeHousing?.id) return;
    if (viewedRef.current.housing === activeHousing.id) return;
    let canceled = false;
    (async () => {
      const ok = await trackCardView("housing", activeHousing);
      if (!canceled && ok) viewedRef.current.housing = activeHousing.id;
    })();
    return () => { canceled = true; };
  }, [scr, activeHousing?.id, trackCardView]);

  useEffect(() => {
    if (scr !== "housing-item") viewedRef.current.housing = null;
  }, [scr]);

  return { trackCardView };
}
