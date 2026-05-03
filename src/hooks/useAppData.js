"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPlaces as fetchPlaces,
  getTips as fetchTips,
  getEvents as fetchEvents,
  getHousing as fetchHousing,
  getAllComments,
  getUserLikes,
  supabase,
} from "../lib/supabase";
import {
  decodeHousingPhotos,
  decodeRichText,
  INIT_HOUSING,
  normalizePhotoList,
  PLACE_CAT_IDS,
} from "../components/svoi/config";
import { normalizeAddressText } from "../lib/text";

function groupComments(rows) {
  const grouped = {};
  (rows || []).forEach((c) => {
    if (!grouped[c.item_id]) grouped[c.item_id] = [];
    grouped[c.item_id].push({ id: c.id, author: c.author, text: c.text, userId: c.user_id });
  });
  return grouped;
}

function mapPlace(p, commentsByItem) {
  return {
    id: p.id,
    cat: p.category,
    district: p.district,
    name: p.name,
    address: p.address || "",
    tip: p.tip,
    addedBy: p.added_by,
    userId: p.user_id,
    img: p.img || "📍",
    photos: normalizePhotoList(p.photos),
    likes: p.likes_count || 0,
    views: Number(p.views || 0),
    comments: commentsByItem[p.id] || [],
    lat: Number.isFinite(Number(p.lat)) ? Number(p.lat) : null,
    lng: Number.isFinite(Number(p.lng)) ? Number(p.lng) : null,
    fromDB: true,
  };
}

function mapTip(t, commentsByItem) {
  const rich = decodeRichText(t.text);
  return {
    id: t.id,
    cat: t.category,
    title: t.title,
    text: rich.text,
    photos: normalizePhotoList(rich.photos),
    author: t.author,
    userId: t.user_id,
    likes: t.likes_count || 0,
    views: Number(t.views || 0),
    comments: commentsByItem[t.id] || [],
    fromDB: true,
  };
}

function mapEvent(e, commentsByItem) {
  const rich = decodeRichText(e.description);
  return {
    id: e.id,
    cat: e.category,
    title: e.title,
    date: e.date,
    location: e.location || "",
    desc: rich.text,
    website: rich.website,
    photos: normalizePhotoList(rich.photos),
    author: e.author,
    userId: e.user_id,
    likes: e.likes_count || 0,
    views: Number(e.views || 0),
    comments: commentsByItem[e.id] || [],
    fromDB: true,
  };
}

function mapHousing(h) {
  const photos = decodeHousingPhotos(h.photo);
  const tagList = Array.isArray(h.tags) ? h.tags : [];
  const tgTag = tagList.find((t) => String(t).startsWith("contact_tg:"));
  const msgTag = tagList.find((t) => String(t).startsWith("contact_msg:"));
  const commentTag = tagList.find((t) => String(t).startsWith("comment:"));
  let commentText = "";
  if (commentTag) {
    const raw = String(commentTag).replace("comment:", "");
    try {
      commentText = decodeURIComponent(raw);
    } catch {
      commentText = raw;
    }
  }
  return {
    id: h.id,
    title: h.title || "",
    address: normalizeAddressText(h.address || ""),
    district: h.district || "",
    type: h.type || "studio",
    minPrice: Number(h.min_price ?? h.minPrice ?? 0),
    options: Array.isArray(h.price_options)
      ? h.price_options
      : Array.isArray(h.options)
        ? h.options
        : [],
    beds: Number(h.beds ?? 0),
    baths: Number(h.baths ?? 0),
    updatedLabel: h.updated_label || h.updatedLabel || "",
    tags: tagList.filter(
      (t) =>
        !String(t).startsWith("contact_tg:") &&
        !String(t).startsWith("contact_msg:") &&
        !String(t).startsWith("comment:"),
    ),
    comment: commentText,
    telegram: tgTag ? String(tgTag).replace("contact_tg:", "").trim() : "",
    messageContact: msgTag ? String(msgTag).replace("contact_msg:", "").trim() : "",
    photos,
    photo: photos[0] || "",
    userId: h.user_id,
    likes: h.likes_count || 0,
    views: Number(h.views || 0),
    fromDB: true,
  };
}

function needsPlaces(screen) {
  return ["district", "places-cat", "place-item", "my-places"].includes(screen);
}

function needsTips(screen) {
  return screen === "tips";
}

function needsEvents(screen) {
  return screen === "events";
}

function needsHousing(screen) {
  return screen === "housing" || screen === "housing-item";
}

export function useAppData({ user, authReady, screen, enablePlacesTipsData = true }) {
  const [places, setPlaces] = useState([]);
  const [tips, setTips] = useState([]);
  const [events, setEvents] = useState([]);
  const [housing, setHousing] = useState([]);
  const [liked, setLiked] = useState({});

  const reloadTimerRef = useRef(null);
  const loadedRef = useRef({ places: false, tips: false, events: false, housing: false, likesForUserId: null });

  const loadPlaces = useCallback(async () => {
    const [placesRes, commentsRes] = await Promise.all([fetchPlaces(), getAllComments("place")]);
    const { data: dbPlaces, error } = placesRes;
    const { data: placeComments } = commentsRes;
    if (error) return;
    const placesByItem = groupComments(placeComments);
    const mappedPlaces = (dbPlaces || [])
      .map((p) => mapPlace(p, placesByItem))
      .filter((p) => PLACE_CAT_IDS.has(p.cat));
    setPlaces(mappedPlaces);
    loadedRef.current.places = true;
  }, []);

  const loadTips = useCallback(async () => {
    const [tipsRes, commentsRes] = await Promise.all([fetchTips(), getAllComments("tip")]);
    const { data: dbTips, error } = tipsRes;
    const { data: tipComments } = commentsRes;
    if (error) return;
    const tipsByItem = groupComments(tipComments);
    setTips((dbTips || []).map((t) => mapTip(t, tipsByItem)));
    loadedRef.current.tips = true;
  }, []);

  const loadEvents = useCallback(async () => {
    const [eventsRes, commentsRes] = await Promise.all([fetchEvents(), getAllComments("event")]);
    const { data: dbEvents, error } = eventsRes;
    const { data: eventComments } = commentsRes;
    if (error) return;
    const eventsByItem = groupComments(eventComments);
    setEvents((dbEvents || []).map((e) => mapEvent(e, eventsByItem)));
    loadedRef.current.events = true;
  }, []);

  const loadHousing = useCallback(async () => {
    const { data: dbHousing, error } = await fetchHousing();
    if (error) {
      setHousing(INIT_HOUSING);
      return;
    }
    setHousing((dbHousing || []).map((h) => mapHousing(h)));
    loadedRef.current.housing = true;
  }, []);

  const loadLikes = useCallback(async (authUser) => {
    if (!authUser?.id) {
      setLiked({});
      loadedRef.current.likesForUserId = null;
      return;
    }
    if (loadedRef.current.likesForUserId === authUser.id) return;
    const userLikes = await getUserLikes(authUser.id);
    setLiked(userLikes || {});
    loadedRef.current.likesForUserId = authUser.id;
  }, []);

  const reload = useCallback(async (authUser = null, force = false) => {
    await loadLikes(authUser);

    const shouldLoadPlaces = enablePlacesTipsData && needsPlaces(screen) && (force || !loadedRef.current.places);
    const shouldLoadTips = enablePlacesTipsData && needsTips(screen) && (force || !loadedRef.current.tips);
    const shouldLoadEvents = needsEvents(screen) && (force || !loadedRef.current.events);
    const shouldLoadHousing = needsHousing(screen) && (force || !loadedRef.current.housing);

    const tasks = [];
    if (shouldLoadPlaces) tasks.push(loadPlaces());
    if (shouldLoadTips) tasks.push(loadTips());
    if (shouldLoadEvents) tasks.push(loadEvents());
    if (shouldLoadHousing) tasks.push(loadHousing());

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }
  }, [enablePlacesTipsData, loadEvents, loadHousing, loadLikes, loadPlaces, loadTips, screen]);

  useEffect(() => {
    if (!authReady) return;
    reload(user || null, false);
  }, [authReady, user, screen, reload]);

  useEffect(() => {
    const scheduleReload = () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      reloadTimerRef.current = setTimeout(() => {
        reload(user || null, true);
      }, 260);
    };

    const channel = supabase
      .channel("svoi_la_realtime_sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "places" }, () => {
        if (!enablePlacesTipsData) return;
        if (needsPlaces(screen) || loadedRef.current.places) scheduleReload();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tips" }, () => {
        if (!enablePlacesTipsData) return;
        if (needsTips(screen) || loadedRef.current.tips) scheduleReload();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => {
        if (needsEvents(screen) || loadedRef.current.events) scheduleReload();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "housing" }, () => {
        if (needsHousing(screen) || loadedRef.current.housing) scheduleReload();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
        if (needsEvents(screen) || (enablePlacesTipsData && (needsPlaces(screen) || needsTips(screen)))) scheduleReload();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, () => {
        scheduleReload();
      })
      .subscribe();

    return () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [screen, user, reload, enablePlacesTipsData]);

  return {
    places,
    setPlaces,
    tips,
    setTips,
    events,
    setEvents,
    housing,
    setHousing,
    liked,
    setLiked,
    reload,
  };
}
