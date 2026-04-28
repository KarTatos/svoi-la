"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPlaces as fetchPlaces,
  getTips as fetchTips,
  getEvents as fetchEvents,
  getHousing as fetchHousing,
  getJobs as fetchJobs,
  getAllComments,
  getUserLikes,
  supabase,
} from "../lib/supabase";
import {
  decodeHousingPhotos,
  decodeRichText,
  INIT_HOUSING,
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
    photos: p.photos || [],
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
    photos: rich.photos,
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
    photos: rich.photos,
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
        !String(t).startsWith("comment:")
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

export function useAppData({ user, authReady }) {
  const [places, setPlaces] = useState([]);
  const [tips, setTips] = useState([]);
  const [events, setEvents] = useState([]);
  const [housing, setHousing] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [liked, setLiked] = useState({});
  const reloadTimerRef = useRef(null);

  const reload = useCallback(async (authUser = null) => {
    const [
      { data: dbPlaces, error: placesError },
      { data: dbTips, error: tipsError },
      { data: dbEvents, error: eventsError },
      { data: dbHousing, error: housingError },
      { data: dbJobs, error: jobsError },
      { data: placeComments },
      { data: tipComments },
      { data: eventComments },
    ] = await Promise.all([
      fetchPlaces(),
      fetchTips(),
      fetchEvents(),
      fetchHousing(),
      fetchJobs(),
      getAllComments("place"),
      getAllComments("tip"),
      getAllComments("event"),
    ]);

    const placesByItem = groupComments(placeComments);
    const tipsByItem = groupComments(tipComments);
    const eventsByItem = groupComments(eventComments);

    const mappedPlaces = (dbPlaces || [])
      .map((p) => mapPlace(p, placesByItem))
      .filter((p) => PLACE_CAT_IDS.has(p.cat));
    const mappedTips = (dbTips || []).map((t) => mapTip(t, tipsByItem));
    const mappedEvents = (dbEvents || []).map((e) => mapEvent(e, eventsByItem));
    const mappedHousing = (dbHousing || []).map((h) => mapHousing(h));

    if (!placesError) setPlaces(mappedPlaces);
    if (!tipsError) setTips(mappedTips);
    if (!eventsError) setEvents(mappedEvents);
    if (!housingError) setHousing(mappedHousing);
    else setHousing(INIT_HOUSING);
    if (!jobsError) setJobs((dbJobs || []).map((j) => ({
      id: j.id, type: j.type, title: j.title, district: j.district,
      price: j.price, price_type: j.price_type || "",
      schedule: j.schedule, english_lvl: j.english_lvl,
      work_auth: j.work_auth, description: j.description,
      telegram: j.telegram, phone: j.phone,
      author: j.author, user_id: j.user_id,
      likes: j.likes_count || 0, views: Number(j.views || 0),
      created_at: j.created_at,
    })));

    if (authUser?.id) {
      const userLikes = await getUserLikes(authUser.id);
      setLiked(userLikes || {});
    }
  }, []);

  // Initial load + reload on user change.
  useEffect(() => {
    if (!authReady) return;
    if (!user) setLiked({});
    reload(user || null);
  }, [authReady, user, reload]);

  // Realtime sync — debounced reload on any data table change.
  useEffect(() => {
    const scheduleReload = () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      reloadTimerRef.current = setTimeout(() => {
        reload(user || null);
      }, 260);
    };

    const channel = supabase
      .channel("svoi_la_realtime_sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "places" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "tips" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "housing" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, scheduleReload)
      .subscribe();

    return () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [user, reload]);

  return {
    places, setPlaces,
    tips, setTips,
    events, setEvents,
    housing, setHousing,
    jobs, setJobs,
    liked, setLiked,
    reload,
  };
}
