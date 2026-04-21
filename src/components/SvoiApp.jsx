'use client';
import { useState, useEffect, useRef } from "react";
import { signInWithGoogle, signOut, getUser, getPlaces as fetchPlaces, addPlace as dbAddPlace, updatePlace as dbUpdatePlace, deletePlace as dbDeletePlace, getTips as fetchTips, addTip as dbAddTip, updateTip as dbUpdateTip, deleteTip as dbDeleteTip, getEvents as fetchEvents, addEvent as dbAddEvent, updateEvent as dbUpdateEvent, deleteEvent as dbDeleteEvent, getHousing as fetchHousing, addHousing as dbAddHousing, updateHousing as dbUpdateHousing, deleteHousing as dbDeleteHousing, getAllComments, addComment as dbAddComment, updateComment as dbUpdateComment, deleteComment as dbDeleteComment, toggleLike as dbToggleLike, getUserLikes, uploadPhoto, supabase } from "../lib/supabase";

import { T, DISTRICTS, PLACE_CATS, PLACE_CAT_IDS, INIT_PLACES, USCIS_CATS, CIVICS_RAW, shuffleTest, TIPS_CATS, INIT_TIPS, EVENT_CATS, INIT_EVENTS, INIT_HOUSING, SECTIONS, RICH_PREFIX, CARD_TEXT_MAX, limitCardText, twoLineClampStyle, encodeRichText, decodeRichText, getUscisPdfUrl, HeartIcon, ViewIcon, HomeIcon, CalendarIcon, StarIcon, decodeHousingPhotos, encodeHousingPhotos, formatPlaceAddressLabel } from "./svoi/config";

export default function App() {
  const [scr, setScr] = useState(() => { try { return sessionStorage.getItem('scr') || 'home'; } catch { return 'home'; } });
  const [selU, setSelU] = useState(null);
  const [selD, setSelD] = useState(() => { try { const d = sessionStorage.getItem('selD'); return d ? JSON.parse(d) : null; } catch { return null; } });
  const [selPC, setSelPC] = useState(() => { try { const d = sessionStorage.getItem('selPC'); return d ? JSON.parse(d) : null; } catch { return null; } });
  const [selPlace, setSelPlace] = useState(null);
  const [selTC, setSelTC] = useState(null);
  const [tipsSearchInput, setTipsSearchInput] = useState("");
  const [tipsSearchApplied, setTipsSearchApplied] = useState("");
  const [housingBedsFilter, setHousingBedsFilter] = useState("all");
  // Save screen state on change
  useEffect(() => { try { sessionStorage.setItem('scr', scr); } catch {} }, [scr]);
  useEffect(() => { try { sessionStorage.setItem('selD', selD ? JSON.stringify(selD) : ''); } catch {} }, [selD]);
  useEffect(() => { try { sessionStorage.setItem('selPC', selPC ? JSON.stringify(selPC) : ''); } catch {} }, [selPC]);
  const [exp, setExp] = useState(null);
  const [expF, setExpF] = useState(null);
  const [expTip, setExpTip] = useState(null);
  const [mapP, setMapP] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapPlaces, setMapPlaces] = useState([]);
  const [selectedMapPlace, setSelectedMapPlace] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [placeSortField, setPlaceSortField] = useState("likes");
  const [placeSortDir, setPlaceSortDir] = useState("desc");
  const [miniMapLoading, setMiniMapLoading] = useState(false);
  const [miniMapError, setMiniMapError] = useState("");
  const [miniMapPlaces, setMiniMapPlaces] = useState([]);
  const [miniSelectedPlaceId, setMiniSelectedPlaceId] = useState(null);
  const [miniRouteInfo, setMiniRouteInfo] = useState(null);
  const [miniRouteLoading, setMiniRouteLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [liked, setLiked] = useState({});
  const [favorites, setFavorites] = useState({});
  const [likedTips, setLikedTips] = useState({});
  const [srch, setSrch] = useState("");
  const [places, setPlaces] = useState([]);
  const [tips, setTips] = useState([]);
  const [housing, setHousing] = useState([]);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddTip, setShowAddTip] = useState(false);
  const [np, setNp] = useState({ name:"", cat:"", district:"", address:"", tip:"" });
  const [nPhotos, setNPhotos] = useState([]);
  const [editingPlace, setEditingPlace] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newTip, setNewTip] = useState({ title:"", text:"" });
  const [newTipPhotos, setNewTipPhotos] = useState([]);
  const [editingTip, setEditingTip] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [events, setEvents] = useState([]);
  const [selEC, setSelEC] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddHousing, setShowAddHousing] = useState(false);
  const [editingHousing, setEditingHousing] = useState(null);
  const [newEvent, setNewEvent] = useState({ title:"", date:"", location:"", desc:"", website:"", cat:"" });
  const [newHousing, setNewHousing] = useState({ address:"", district:"", type:"studio", minPrice:"", comment:"", telegram:"", messageContact:"" });
  const [newHousingPhotos, setNewHousingPhotos] = useState([]);
  const [newEventPhotos, setNewEventPhotos] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [addrOptionsPlace, setAddrOptionsPlace] = useState([]);
  const [nameOptionsPlace, setNameOptionsPlace] = useState([]);
  const [addrOptionsEvent, setAddrOptionsEvent] = useState([]);
  const [addrOptionsHousing, setAddrOptionsHousing] = useState([]);
  const [addrLoadingPlace, setAddrLoadingPlace] = useState(false);
  const [nameLoadingPlace, setNameLoadingPlace] = useState(false);
  const [addrLoadingEvent, setAddrLoadingEvent] = useState(false);
  const [addrLoadingHousing, setAddrLoadingHousing] = useState(false);
  const [addrValidPlace, setAddrValidPlace] = useState(false);
  const [addrValidEvent, setAddrValidEvent] = useState(false);
  const [addrValidHousing, setAddrValidHousing] = useState(false);
  const [photoViewer, setPhotoViewer] = useState(null);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [chat, setChat] = useState([{ role:"assistant", text:"Здравствуйте. Задайте вопрос по USCIS, местам, событиям, советам или жилью." }]);
  const [inp, setInp] = useState("");
  const [typing, setTyping] = useState(false);
  const [mt, setMt] = useState(false);
  const [tQ, setTQ] = useState(0);
  const [tAns, setTAns] = useState([]);
  const [tDone, setTDone] = useState(false);
  const [tShuf, setTShuf] = useState([]);
  const [selHousing, setSelHousing] = useState(null);
  const [housingTextCollapsed, setHousingTextCollapsed] = useState(false);
  const [uscisPdfViewer, setUscisPdfViewer] = useState(null);

  useEffect(() => {
    if (scr === "housing-item") setHousingTextCollapsed(false);
  }, [scr, selHousing?.id]);

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
  const chatEnd = useRef(null);
  const inpRef = useRef(null);
  const fileRef = useRef(null);
  const tipFileRef = useRef(null);
  const eventFileRef = useRef(null);
  const housingFileRef = useRef(null);
  const mapContainerRef = useRef(null);
  const miniMapContainerRef = useRef(null);
  const googleMapRef = useRef(null);
  const miniGoogleMapRef = useRef(null);
  const googleMarkersRef = useRef([]);
  const miniGoogleMarkersRef = useRef([]);
  const miniGoogleUserMarkerRef = useRef(null);
  const googleDirectionsRendererRef = useRef(null);
  const miniGoogleDirectionsRendererRef = useRef(null);
  const googleMapsLoaderRef = useRef(null);
  const datePickerRef = useRef(null);
  const googleAutocompleteRef = useRef(null);
  const googlePlacesServiceRef = useRef(null);
  const googleGeocoderRef = useRef(null);
  const geocodeCacheRef = useRef({});
  const viewedRef = useRef({ place: null, housing: null });
  const photoSwipeRef = useRef({ startX: 0, startY: 0, active: false });
  const photoPinchRef = useRef({ baseDistance: 0, baseZoom: 1 });
  const realtimeReloadTimerRef = useRef(null);

  useEffect(() => setMt(true), []);
  // Save navigation state to localStorage
  useEffect(() => {
    if (mt) {
      const state = { scr, selDId: selD?.id, selPCId: selPC?.id, selPlaceId: selPlace?.id, selUId: selU?.id, selTCId: selTC?.id, selECId: selEC?.id, selHousingId: selHousing?.id };
      try { localStorage.setItem('nav', JSON.stringify(state)); } catch {}
    }
  }, [scr, selD, selPC, selPlace, selU, selTC, selEC, selHousing, mt]);
  // Restore navigation on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nav'));
      if (saved?.scr) {
        setScr(saved.scr);
        if (saved.selDId) setSelD(DISTRICTS.find(d => d.id === saved.selDId) || null);
        if (saved.selPCId) setSelPC(PLACE_CATS.find(c => c.id === saved.selPCId) || null);
        if (saved.selPlaceId) setSelPlace({ id: saved.selPlaceId });
        if (saved.selUId) setSelU(USCIS_CATS.find(c => c.id === saved.selUId) || null);
        if (saved.selTCId) setSelTC(TIPS_CATS.find(c => c.id === saved.selTCId) || null);
        if (saved.selECId) setSelEC(EVENT_CATS.find(c => c.id === saved.selECId) || null);
        if (saved.selHousingId) setSelHousing({ id: saved.selHousingId });
      }
    } catch {}
  }, []);
  const fetchViewCounts = async (itemType, ids = []) => {
    const cleanIds = Array.from(new Set((ids || []).map((v) => String(v || "").trim()).filter(Boolean)));
    if (!cleanIds.length) return {};
    try {
      const query = new URLSearchParams({
        itemType,
        itemIds: cleanIds.join(","),
      });
      const res = await fetch(`/api/views?${query.toString()}`);
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.ok || typeof payload.counts !== "object") return {};
      return payload.counts || {};
    } catch {
      return {};
    }
  };
  const loadAllData = async (authUser = null) => {
    const [
      { data: dbPlaces, error: placesError },
      { data: dbTips, error: tipsError },
      { data: dbEvents, error: eventsError },
      { data: dbHousing, error: housingError },
      { data: placeComments },
      { data: tipComments },
      { data: eventComments },
    ] = await Promise.all([
      fetchPlaces(),
      fetchTips(),
      fetchEvents(),
      fetchHousing(),
      getAllComments("place"),
      getAllComments("tip"),
      getAllComments("event"),
    ]);

    const groupComments = (rows) => {
      const grouped = {};
      (rows || []).forEach((c) => {
        if (!grouped[c.item_id]) grouped[c.item_id] = [];
        grouped[c.item_id].push({ id:c.id, author:c.author, text:c.text, userId:c.user_id });
      });
      return grouped;
    };

    const placeCommentsByItem = groupComments(placeComments);
    const tipCommentsByItem = groupComments(tipComments);
    const eventCommentsByItem = groupComments(eventComments);

    const mappedPlaces = (dbPlaces || [])
      .map((p) => ({ id:p.id, cat:p.category, district:p.district, name:p.name, address:p.address||"", tip:p.tip, addedBy:p.added_by, userId:p.user_id, img:p.img||"📍", photos:p.photos||[], likes:p.likes_count||0, views:0, comments: placeCommentsByItem[p.id] || [], fromDB:true }))
      .filter((p) => PLACE_CAT_IDS.has(p.cat));
    const mappedTips = (dbTips || []).map((t) => {
      const rich = decodeRichText(t.text);
      return { id:t.id, cat:t.category, title:t.title, text:rich.text, photos:rich.photos, author:t.author, userId:t.user_id, likes:t.likes_count||0, views:0, comments: tipCommentsByItem[t.id] || [], fromDB:true };
    });

    const mappedEvents = (dbEvents || []).map((e) => {
      const rich = decodeRichText(e.description);
      return { id:e.id, cat:e.category, title:e.title, date:e.date, location:e.location||"", desc:rich.text, website:rich.website, photos:rich.photos, author:e.author, userId:e.user_id, likes:e.likes_count||0, views:0, comments: eventCommentsByItem[e.id] || [], fromDB:true };
    });

    const mappedHousing = (dbHousing || []).map((h) => {
      const photos = decodeHousingPhotos(h.photo);
      const tagList = Array.isArray(h.tags) ? h.tags : [];
      const tgTag = tagList.find((t) => String(t).startsWith("contact_tg:"));
      const msgTag = tagList.find((t) => String(t).startsWith("contact_msg:"));
      const commentTag = tagList.find((t) => String(t).startsWith("comment:"));
      let commentText = "";
      if (commentTag) {
        const raw = String(commentTag).replace("comment:", "");
        try { commentText = decodeURIComponent(raw); } catch { commentText = raw; }
      }
      return {
        id: h.id,
        title: h.title || "",
        address: normalizeAddressText(h.address || ""),
        district: h.district || "",
        type: h.type || "studio",
        minPrice: Number(h.min_price ?? h.minPrice ?? 0),
        options: Array.isArray(h.price_options) ? h.price_options : (Array.isArray(h.options) ? h.options : []),
        beds: Number(h.beds ?? 0),
        baths: Number(h.baths ?? 0),
        updatedLabel: h.updated_label || h.updatedLabel || "",
        tags: tagList.filter((t) => !String(t).startsWith("contact_tg:") && !String(t).startsWith("contact_msg:") && !String(t).startsWith("comment:")),
        comment: commentText,
        telegram: tgTag ? String(tgTag).replace("contact_tg:", "").trim() : "",
        messageContact: msgTag ? String(msgTag).replace("contact_msg:", "").trim() : "",
        photos,
        photo: photos[0] || "",
        userId: h.user_id,
        likes: h.likes_count || 0,
        views: 0,
        fromDB: true,
      };
    });

    const [placeViews, tipViews, eventViews, housingViews] = await Promise.all([
      fetchViewCounts("place", mappedPlaces.map((x) => x.id)),
      fetchViewCounts("tip", mappedTips.map((x) => x.id)),
      fetchViewCounts("event", mappedEvents.map((x) => x.id)),
      fetchViewCounts("housing", mappedHousing.map((x) => x.id)),
    ]);

    const withViews = (rows, viewMap) => rows.map((row) => ({ ...row, views: Number(viewMap?.[row.id] || 0) }));

    if (!placesError) setPlaces(withViews(mappedPlaces, placeViews));
    if (!tipsError) setTips(withViews(mappedTips, tipViews));
    if (!eventsError) setEvents(withViews(mappedEvents, eventViews));
    if (!housingError) setHousing(withViews(mappedHousing, housingViews));
    else setHousing(INIT_HOUSING);

    if (authUser?.id) {
      const userLikes = await getUserLikes(authUser.id);
      setLiked(userLikes || {});
    }
  };

  useEffect(() => {
    let canceled = false;
    async function init() {
      setAuthReady(false);
      const u = await getUser();
      if (canceled) return;
      if (u) {
        setUser({ id:u.id, name:u.user_metadata?.full_name||u.email||"Пользователь", email:u.email, avatar:"👤", avatarUrl:u.user_metadata?.avatar_url });
      } else {
        setUser(null);
        setLiked({});
      }
      await loadAllData(u || null);
      if (!canceled) setAuthReady(true);
    }
    init();
    return () => { canceled = true; };
  }, []);

  useEffect(() => {
    const scheduleReload = () => {
      if (realtimeReloadTimerRef.current) clearTimeout(realtimeReloadTimerRef.current);
      realtimeReloadTimerRef.current = setTimeout(() => {
        loadAllData(user || null);
      }, 260);
    };

    const channel = supabase
      .channel("svoi_la_realtime_sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "places" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "tips" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "housing" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, scheduleReload)
      .subscribe();

    return () => {
      if (realtimeReloadTimerRef.current) clearTimeout(realtimeReloadTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [chat, typing]);

  const goHome = () => { setScr("home"); setSelU(null); setSelD(null); setSelPC(null); setSelPlace(null); setSelTC(null); setSelEC(null); setSelHousing(null); setExp(null); setExpF(null); setExpTip(null); setMapP(null); setShowMapModal(false); setMapPlaces([]); setSelectedMapPlace(null); setMiniSelectedPlaceId(null); setMiniRouteInfo(null); setMiniRouteLoading(false); setSrch(""); setTipsSearchInput(""); setTipsSearchApplied(""); setShowAdd(false); setShowAddTip(false); setShowAddEvent(false); setShowAddHousing(false); setEditingHousing(null); setNewHousing({ address:"", district:"", type:"studio", minPrice:"", comment:"", telegram:"", messageContact:"" }); setNewHousingPhotos([]); setAddrValidHousing(false); setAddrOptionsHousing([]); setTDone(false); setEditingPlace(null); setEditingTip(null); setFilterDate(null); };
  const openExternalUrl = (url) => {
    if (!url) return;
    try {
      window.location.href = url;
    } catch {
      window.open(url, "_self");
    }
  };
  const openAddressInMaps = (address) => {
    const value = (address || "").trim();
    if (!value) return;
    const q = encodeURIComponent(value);
    openExternalUrl(`https://www.google.com/maps/search/?api=1&query=${q}`);
  };
  const openMap = (p, t) => { const q = encodeURIComponent(p.address); openExternalUrl(t==="google"?`https://www.google.com/maps/search/?api=1&query=${q}`:`https://maps.apple.com/?q=${q}`); setMapP(null); };
  const openEventMap = (location, t) => {
    const q = encodeURIComponent(location || "");
    openExternalUrl(t==="google"?`https://www.google.com/maps/search/?api=1&query=${q}`:`https://maps.apple.com/?q=${q}`);
  };
  const openUscisPdf = (url, title) => {
    const pdfUrl = String(url || "").trim();
    if (!pdfUrl) return;
    setUscisPdfViewer({ url: pdfUrl, title: title || "USCIS PDF" });
  };
  const closeUscisPdf = () => setUscisPdfViewer(null);
  const openChatAppLink = (url) => {
    const raw = String(url || "").trim();
    if (!raw) return;
    if (!raw.startsWith("app://")) {
      openExternalUrl(raw);
      return;
    }
    const withoutScheme = raw.slice("app://".length);
    const [type, idRaw] = withoutScheme.split("/");
    const id = String(idRaw || "").trim();
    if (!id) return;

    if (type === "housing") {
      setSelHousing({ id });
      setScr("housing-item");
      return;
    }
    if (type === "place") {
      const place = places.find((p) => String(p.id) === id);
      if (!place) return;
      const district = DISTRICTS.find((d) => d.id === place.district) || null;
      const placeCat = PLACE_CATS.find((c) => c.id === place.cat) || null;
      if (district) setSelD(district);
      if (placeCat) setSelPC(placeCat);
      setSelPlace(place);
      setScr("place-item");
      return;
    }
    if (type === "event") {
      const ev = events.find((e) => String(e.id) === id);
      if (!ev) return;
      const eventCat = EVENT_CATS.find((c) => c.id === ev.cat) || null;
      if (eventCat) setSelEC(eventCat);
      setScr("events");
      setExp(`ev-${ev.id}`);
      trackCardView("event", ev);
      return;
    }
    if (type === "tip") {
      const tip = tips.find((t) => String(t.id) === id);
      if (!tip) return;
      const tipCat = TIPS_CATS.find((c) => c.id === tip.cat) || null;
      if (tipCat) setSelTC(tipCat);
      setScr("tips");
      setExpTip(tip.id);
      trackCardView("tip", tip);
      return;
    }
  };
  const renderChatText = (text, isUser) => {
    const safe = String(text || "");
    const linkColor = isUser ? "#fff" : "#1E5AA5";
    const rowStyle = { display:"block", marginBottom:4 };
    const getAppLinkLabel = (href, rawLabel) => {
      if (rawLabel && rawLabel !== href) return rawLabel;
      const withoutScheme = String(href || "").replace(/^app:\/\//i, "");
      const [type] = withoutScheme.split("/");
      if (type === "place") return "Открыть карточку места";
      if (type === "tip") return "Открыть карточку совета";
      if (type === "event") return "Открыть карточку события";
      if (type === "housing") return "Открыть карточку жилья";
      return "Открыть карточку";
    };
    const parseLine = (line, lineIndex) => {
      const rx = /\[([^\]]+)\]\((app:\/\/[^)\s]+|https?:\/\/[^)\s]+)\)|(app:\/\/[^\s]+|https?:\/\/[^\s]+)/gi;
      const out = [];
      let last = 0;
      let m;
      while ((m = rx.exec(line)) !== null) {
        if (m.index > last) out.push(<span key={`t-${lineIndex}-${last}`}>{line.slice(last, m.index)}</span>);
        const rawLabel = m[1] || m[3];
        const href = m[2] || m[3];
        const isApp = href.startsWith("app://");
        const label = isApp ? getAppLinkLabel(href, rawLabel) : rawLabel;
        out.push(
          <button
            key={`l-${lineIndex}-${m.index}`}
            onClick={() => isApp ? openChatAppLink(href) : openExternalUrl(href)}
            style={{ background:"none", border:"none", padding:0, margin:0, color:linkColor, textDecoration:"underline", cursor:"pointer", fontFamily:"inherit", fontSize:"inherit", lineHeight:"inherit" }}
          >
            {label}
          </button>,
        );
        last = rx.lastIndex;
      }
      if (last < line.length) out.push(<span key={`t-${lineIndex}-end`}>{line.slice(last)}</span>);
      if (!out.length) return <span key={`empty-${lineIndex}`}>{line}</span>;
      return out;
    };
    return (
      <span style={{ display:"block" }}>
        {safe.split("\n").map((line, i) => (
          <span key={`line-${i}`} style={rowStyle}>
            {line.length ? parseLine(line, i) : <span>&nbsp;</span>}
          </span>
        ))}
      </span>
    );
  };
  const normalizeExternalUrl = (url) => {
    const v = (url || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  };
  const handleNativeShare = async ({ title, text, url }) => {
    const safeUrl = normalizeExternalUrl(url || window.location.href);
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: safeUrl });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(safeUrl);
        alert("Ссылка скопирована");
      }
    } catch {}
  };
  const ensureGoogleMapsApi = () => {
    if (typeof window === "undefined") return Promise.reject(new Error("No browser"));
    if (window.google?.maps) return Promise.resolve(window.google.maps);
    if (googleMapsLoaderRef.current) return googleMapsLoaderRef.current;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyCF1UVftmKSfE5x6QY2DoKIT9udSpyNaLM";
    if (!apiKey) return Promise.reject(new Error("Google Maps API key is missing"));

    googleMapsLoaderRef.current = new Promise((resolve, reject) => {
      const existing = document.getElementById("google-maps-js");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.google?.maps), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")), { once: true });
        return;
      }
      const callbackName = `initGoogleMaps_${Date.now()}`;
      window[callbackName] = () => {
        resolve(window.google?.maps);
        try { delete window[callbackName]; } catch {}
      };
      const script = document.createElement("script");
      script.id = "google-maps-js";
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${callbackName}&libraries=places`;
      script.onerror = () => {
        googleMapsLoaderRef.current = null;
        reject(new Error("Failed to load Google Maps script"));
      };
      document.head.appendChild(script);
    });
    return googleMapsLoaderRef.current;
  };
  const getGeocodeCacheKeys = (place = {}) => {
    const address = String(place.address || "").trim().toLowerCase();
    const name = String(place.name || "").trim().toLowerCase();
    return {
      primary: `${name}|${address}`,
      byAddress: `addr|${address}`,
    };
  };
  const setCardViewsLocally = (itemType, itemId, views) => {
    const nextViews = Number(views || 0);
    const updater = (item) => item.id === itemId ? { ...item, views: nextViews } : item;
    if (itemType === "place") {
      setPlaces((prev) => prev.map(updater));
      setSelPlace((prev) => prev?.id === itemId ? { ...prev, views: nextViews } : prev);
    } else if (itemType === "tip") {
      setTips((prev) => prev.map(updater));
    } else if (itemType === "event") {
      setEvents((prev) => prev.map(updater));
    } else if (itemType === "housing") {
      setHousing((prev) => prev.map(updater));
      setSelHousing((prev) => prev?.id === itemId ? { ...prev, views: nextViews } : prev);
    }
  };
  const getViewerKey = () => {
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
  };
  const trackCardView = async (itemType, item) => {
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
      if (response.ok && payload?.ok && Number.isFinite(Number(payload.views))) {
        setCardViewsLocally(itemType, itemId, Number(payload.views));
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
  };
  const saveGeocodeCache = (place, coords) => {
    if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return;
    const { primary, byAddress } = getGeocodeCacheKeys(place);
    if (primary) geocodeCacheRef.current[primary] = coords;
    if (byAddress) geocodeCacheRef.current[byAddress] = coords;
  };
  const geocodePlace = async (place) => {
    const { primary, byAddress } = getGeocodeCacheKeys(place);
    if (primary && geocodeCacheRef.current[primary]) return geocodeCacheRef.current[primary];
    if (byAddress && geocodeCacheRef.current[byAddress]) return geocodeCacheRef.current[byAddress];

    // Prefer Google geocoder for better match with Google Maps pins.
    try {
      const maps = await ensureGoogleMapsApi();
      if (maps?.Geocoder) {
        if (!googleGeocoderRef.current) googleGeocoderRef.current = new maps.Geocoder();
        const q = `${place.address || place.name}, Los Angeles County, California`;
        const googleCoords = await new Promise((resolve) => {
          googleGeocoderRef.current.geocode({ address: q, region: "us" }, (results, status) => {
            const loc = Array.isArray(results) ? results[0]?.geometry?.location : null;
            if (status !== "OK" || !loc) return resolve(null);
            resolve({ lat: Number(loc.lat()), lng: Number(loc.lng()) });
          });
        });
        if (googleCoords && Number.isFinite(googleCoords.lat) && Number.isFinite(googleCoords.lng)) {
          saveGeocodeCache(place, googleCoords);
          return googleCoords;
        }
      }
    } catch {}

    // Fallback, if Google geocode is unavailable.
    const query = encodeURIComponent(`${place.address || place.name}, Los Angeles County, California`);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&addressdetails=1&q=${query}`);
      const data = await res.json();
      if (!Array.isArray(data) || !data[0]) return null;
      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      const coords = { lat, lng };
      saveGeocodeCache(place, coords);
      return coords;
    } catch {
      return null;
    }
  };
  const openAllOnMap = async (placesArr) => {
    setShowMapModal(true);
    setMapLoading(true);
    setMapError("");
    setRouteInfo(null);
    setMapPlaces([]);
    setSelectedMapPlace(null);
    const limited = placesArr.slice(0, 40);
    const resolved = await Promise.all(
      limited.map(async (p) => {
        const coords = await geocodePlace(p);
        return coords ? { ...p, ...coords } : null;
      }),
    );
    const withCoords = resolved.filter(Boolean);
    setMapPlaces(withCoords);
    setSelectedMapPlace(withCoords[0] || null);
    setMapLoading(false);
  };
  const openRouteForPlace = (place, provider) => {
    if (!place) return;
    const destination = encodeURIComponent(place.address || `${place.lat},${place.lng}`);
    const url = provider === "google"
      ? `https://www.google.com/maps/dir/?api=1&destination=${destination}`
      : `https://maps.apple.com/?daddr=${destination}`;
    openExternalUrl(url);
  };
  const openPhotoViewer = (photos, startIndex = 0) => {
    const normalized = (Array.isArray(photos) ? photos : [])
      .filter((ph) => typeof ph === "string")
      .filter((ph) => /^(https?:\/\/|blob:|data:image\/)/i.test(ph));
    if (!normalized.length) return;
    const safeIndex = Math.max(0, Math.min(startIndex, normalized.length - 1));
    setPhotoViewer({ photos: normalized, index: safeIndex });
    setPhotoZoom(1);
  };
  const closePhotoViewer = () => {
    setPhotoViewer(null);
    setPhotoZoom(1);
  };
  const goPrevPhoto = () => {
    setPhotoViewer((prev) => {
      if (!prev || prev.photos.length < 2) return prev;
      const nextIndex = (prev.index - 1 + prev.photos.length) % prev.photos.length;
      return { ...prev, index: nextIndex };
    });
    setPhotoZoom(1);
  };
  const goNextPhoto = () => {
    setPhotoViewer((prev) => {
      if (!prev || prev.photos.length < 2) return prev;
      const nextIndex = (prev.index + 1) % prev.photos.length;
      return { ...prev, index: nextIndex };
    });
    setPhotoZoom(1);
  };

  const getGoogleComponent = (components, type, mode = "long") => {
    const found = (components || []).find((c) => (c.types || []).includes(type));
    if (!found) return "";
    return mode === "short" ? (found.short_name || "") : (found.long_name || "");
  };
  const normalizeAddressText = (value = "") => {
    const noHtml = String(value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    const firstVariant = noHtml.split(" / ")[0].split("/")[0].trim();
    const normalized = (firstVariant || noHtml)
      .replace(/\s*,\s*/g, ", ")
      .replace(/(,\s*){2,}/g, ", ")
      .replace(/,\s*$/, "")
      .trim();
    const parts = normalized.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 4) return parts.slice(0, 4).join(", ");
    return normalized;
  };
  const shortAddressFromGoogle = (components, fallback = "") => {
    const streetNumber = getGoogleComponent(components, "street_number");
    const route = getGoogleComponent(components, "route");
    const city =
      getGoogleComponent(components, "locality") ||
      getGoogleComponent(components, "sublocality_level_1") ||
      getGoogleComponent(components, "postal_town") ||
      "Los Angeles";
    const state = getGoogleComponent(components, "administrative_area_level_1", "short") || "CA";
    const line = [streetNumber, route].filter(Boolean).join(" ").trim();
    if (line) return `${line}, ${city}, ${state}`;
    if (fallback) {
      const parts = String(fallback).split(",").map((p) => p.trim()).filter(Boolean);
      return parts.slice(0, 3).join(", ");
    }
    return `${city}, ${state}`;
  };
  const ensureGooglePlacesServices = async () => {
    const maps = await ensureGoogleMapsApi();
    if (!maps?.places) throw new Error("Google Places library is not available");
    if (!googleAutocompleteRef.current) {
      googleAutocompleteRef.current = new maps.places.AutocompleteService();
    }
    if (!googlePlacesServiceRef.current) {
      const el = document.createElement("div");
      googlePlacesServiceRef.current = new maps.places.PlacesService(el);
    }
    return { maps, autocomplete: googleAutocompleteRef.current, placesService: googlePlacesServiceRef.current };
  };
  const getGooglePredictions = (autocomplete, input) => new Promise((resolve) => {
    const center = { lat: 34.0522, lng: -118.2437 };
    const req = {
      input,
      componentRestrictions: { country: "us" },
      locationBias: new window.google.maps.Circle({ center, radius: 90000 }).getBounds(),
    };
    autocomplete.getPlacePredictions(req, (predictions, status) => {
      const ok = status === window.google.maps.places.PlacesServiceStatus.OK;
      resolve(ok ? predictions || [] : []);
    });
  });
  const getGooglePlaceDetails = (placesService, placeId) => new Promise((resolve) => {
    placesService.getDetails(
      { placeId, fields: ["name", "formatted_address", "address_components", "geometry"] },
      (result, status) => {
        const ok = status === window.google.maps.places.PlacesServiceStatus.OK;
        resolve(ok ? result : null);
      },
    );
  });
  const fetchAddressSuggestions = async (query) => {
    const q = (query || "").trim();
    if (q.length < 3) return [];
    try {
      const { autocomplete, placesService } = await ensureGooglePlacesServices();
      const predictions = await getGooglePredictions(autocomplete, q);
      const top = predictions.slice(0, 6);
      const detailed = await Promise.all(
        top.map(async (pred) => {
          const details = pred?.place_id ? await getGooglePlaceDetails(placesService, pred.place_id) : null;
          const short = shortAddressFromGoogle(details?.address_components, details?.formatted_address || pred?.description || "");
          const placeName = details?.name || pred?.structured_formatting?.main_text || "";
          const label = placeName && !short.toLowerCase().includes(String(placeName).toLowerCase())
            ? `${placeName} — ${short}`
            : short;
          const lat = details?.geometry?.location?.lat?.();
          const lng = details?.geometry?.location?.lng?.();
          return {
            label,
            value: short,
            placeName,
            lat: Number.isFinite(Number(lat)) ? Number(lat) : null,
            lng: Number.isFinite(Number(lng)) ? Number(lng) : null,
          };
        }),
      );
      const uniq = [];
      const seen = new Set();
      for (const item of detailed) {
        if (!item?.value) continue;
        const key = `${item.value}|${item.label}`;
        if (seen.has(key)) continue;
        seen.add(key);
        uniq.push(item);
      }
      return uniq;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const q = (np.address || "").trim();
    if (addrValidPlace) { setAddrOptionsPlace([]); return; }
    if (q.length < 3) { setAddrOptionsPlace([]); return; }
    const t = setTimeout(async () => {
      setAddrLoadingPlace(true);
      const opts = await fetchAddressSuggestions(q);
      setAddrOptionsPlace(opts);
      setAddrLoadingPlace(false);
    }, 280);
    return () => clearTimeout(t);
  }, [np.address, addrValidPlace]);

  useEffect(() => {
    const q = (np.name || "").trim();
    if (!showAdd || !selD || addrValidPlace) { setNameOptionsPlace([]); setNameLoadingPlace(false); return; }
    if (q.length < 3) { setNameOptionsPlace([]); setNameLoadingPlace(false); return; }
    let canceled = false;
    const t = setTimeout(async () => {
      setNameLoadingPlace(true);
      const opts = await fetchAddressSuggestions(q);
      if (canceled) return;
      setNameOptionsPlace(opts);
      setNameLoadingPlace(false);
    }, 320);
    return () => { canceled = true; clearTimeout(t); };
  }, [np.name, showAdd, selD, addrValidPlace]);

  useEffect(() => {
    const q = (newEvent.location || "").trim();
    if (addrValidEvent) { setAddrOptionsEvent([]); return; }
    if (q.length < 3) { setAddrOptionsEvent([]); return; }
    const t = setTimeout(async () => {
      setAddrLoadingEvent(true);
      const opts = await fetchAddressSuggestions(q);
      setAddrOptionsEvent(opts);
      setAddrLoadingEvent(false);
    }, 280);
    return () => clearTimeout(t);
  }, [newEvent.location, addrValidEvent]);

  useEffect(() => {
    const q = (newHousing.address || "").trim();
    if (!showAddHousing) { setAddrOptionsHousing([]); setAddrLoadingHousing(false); return; }
    if (addrValidHousing) { setAddrOptionsHousing([]); return; }
    if (q.length < 3) { setAddrOptionsHousing([]); return; }
    const t = setTimeout(async () => {
      setAddrLoadingHousing(true);
      const opts = await fetchAddressSuggestions(q);
      setAddrOptionsHousing(opts);
      setAddrLoadingHousing(false);
    }, 280);
    return () => clearTimeout(t);
  }, [newHousing.address, addrValidHousing, showAddHousing]);

  useEffect(() => {
    if (!showMapModal) {
      setRouteInfo(null);
      setRouteLoading(false);
      return;
    }
    if (!mapContainerRef.current || mapLoading || !mapPlaces.length) return;
    let disposed = false;
    const init = async () => {
      try {
        const maps = await ensureGoogleMapsApi();
        if (disposed || !maps) return;

        if (!googleMapRef.current) {
          googleMapRef.current = new maps.Map(mapContainerRef.current, {
            zoom: 13,
            center: selD ? { lat: selD.lat, lng: selD.lng } : { lat: 34.09, lng: -118.33 },
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            cameraControl: false,
            gestureHandling: "greedy",
            styles: [
              { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
              { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#6e6e6e" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
              { featureType: "poi", stylers: [{ visibility: "off" }] },
              { featureType: "transit", stylers: [{ visibility: "off" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#e8edf5" }] },
            ],
          });
          googleDirectionsRendererRef.current = new maps.DirectionsRenderer({
            suppressMarkers: true,
            preserveViewport: true,
            polylineOptions: { strokeColor: "#F47B20", strokeOpacity: 0.9, strokeWeight: 5 },
          });
          googleDirectionsRendererRef.current.setMap(googleMapRef.current);
        }

        const map = googleMapRef.current;
        map.setOptions({
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          cameraControl: false,
          gestureHandling: "greedy",
        });
        maps.event.trigger(map, "resize");
        googleMarkersRef.current.forEach((m) => m.setMap(null));
        googleMarkersRef.current = [];

        const bounds = new maps.LatLngBounds();
        mapPlaces.forEach((p, idx) => {
          const marker = new maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            map,
            title: p.name,
            label: {
              text: String(idx + 1),
              color: "#fff",
              fontSize: "13px",
              fontWeight: "700",
            },
          });
          marker.addListener("click", () => setSelectedMapPlace(p));
          googleMarkersRef.current.push(marker);
          bounds.extend(marker.getPosition());
        });

        const hasBounds = !bounds.isEmpty();
        if (hasBounds) {
          map.fitBounds(bounds, 130);
          if (mapPlaces.length === 1) map.setZoom(12);
          else if (map.getZoom() > 14) map.setZoom(14);
        } else if (selD) {
          map.setCenter({ lat: selD.lat, lng: selD.lng });
          map.setZoom(12);
        }
        setTimeout(() => {
          maps.event.trigger(map, "resize");
          if (hasBounds) {
            map.fitBounds(bounds, 130);
            if (mapPlaces.length === 1) map.setZoom(12);
            else if (map.getZoom() > 14) map.setZoom(14);
          }
          else if (selD) {
            map.setCenter({ lat: selD.lat, lng: selD.lng });
            map.setZoom(12);
          }
        }, 0);
      } catch (e) {
        setMapError("Не удалось загрузить Google Maps. Проверьте API key и ограничения.");
      }
    };
    init();
    return () => { disposed = true; };
  }, [showMapModal, mapLoading, mapPlaces, selectedMapPlace, selD]);

  useEffect(() => {
    if (showMapModal) return;
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];
    if (googleDirectionsRendererRef.current) {
      googleDirectionsRendererRef.current.setMap(null);
      googleDirectionsRendererRef.current = null;
    }
    googleMapRef.current = null;
    if (mapContainerRef.current) mapContainerRef.current.innerHTML = "";
  }, [showMapModal]);

  useEffect(() => {
    if (!selectedMapPlace || !googleMapRef.current || !window.google?.maps) return;
    googleMapRef.current.panTo({ lat: selectedMapPlace.lat, lng: selectedMapPlace.lng });
  }, [selectedMapPlace]);

  useEffect(() => {
    if (!showMapModal || !selectedMapPlace || !googleMapRef.current || !window.google?.maps) return;
    if (!navigator.geolocation) return;
    let canceled = false;
    const maps = window.google.maps;
    const renderer = googleDirectionsRendererRef.current;
    if (!renderer) return;
    const getPosition = () => new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 7000, maximumAge: 120000 });
    });

    const build = async () => {
      setRouteLoading(true);
      try {
        const pos = await getPosition();
        if (canceled) return;
        const service = new maps.DirectionsService();
        const res = await service.route({
          origin: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          destination: { lat: selectedMapPlace.lat, lng: selectedMapPlace.lng },
          travelMode: maps.TravelMode.DRIVING,
        });
        if (canceled) return;
        renderer.setDirections(res);
        const leg = res?.routes?.[0]?.legs?.[0];
        setRouteInfo(leg ? { distance: leg.distance?.text || "", duration: leg.duration?.text || "" } : null);
      } catch {
        renderer.set("directions", null);
        setRouteInfo(null);
      } finally {
        if (!canceled) setRouteLoading(false);
      }
    };

    build();
    return () => { canceled = true; };
  }, [showMapModal, selectedMapPlace]);

  useEffect(() => {
    if (scr !== "places-cat" || !selPC || !selD) {
      setMiniMapPlaces([]);
      setMiniMapError("");
      setMiniMapLoading(false);
      setMiniSelectedPlaceId(null);
      setMiniRouteInfo(null);
      setMiniRouteLoading(false);
      return;
    }
    let canceled = false;
    const categoryPlaces = places.filter((p) => p.district === selD.id && p.cat === selPC.id && PLACE_CAT_IDS.has(p.cat));

    const loadMiniMapPlaces = async () => {
      setMiniMapLoading(true);
      setMiniMapError("");
      try {
        const resolved = await Promise.all(categoryPlaces.slice(0, 40).map(async (p) => {
          const coords = await geocodePlace(p);
          return coords ? { ...p, ...coords } : null;
        }));
        if (canceled) return;
        setMiniMapPlaces(resolved.filter(Boolean));
      } catch {
        if (canceled) return;
        setMiniMapPlaces([]);
        setMiniMapError("Не удалось загрузить мини-карту.");
      } finally {
        if (!canceled) setMiniMapLoading(false);
      }
    };

    loadMiniMapPlaces();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (canceled) return;
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          if (canceled) return;
          setUserCoords(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 },
      );
    } else {
      setUserCoords(null);
    }

    return () => { canceled = true; };
  }, [scr, selPC, selD, places]);

  useEffect(() => {
    // Force a fresh mini-map instance when category/district changes.
    miniGoogleMarkersRef.current.forEach((m) => m.setMap(null));
    miniGoogleMarkersRef.current = [];
    if (miniGoogleDirectionsRendererRef.current) {
      miniGoogleDirectionsRendererRef.current.setMap(null);
      miniGoogleDirectionsRendererRef.current = null;
    }
    if (miniGoogleUserMarkerRef.current) {
      miniGoogleUserMarkerRef.current.setMap(null);
      miniGoogleUserMarkerRef.current = null;
    }
    miniGoogleMapRef.current = null;
    if (miniMapContainerRef.current) miniMapContainerRef.current.innerHTML = "";
    setMiniSelectedPlaceId(null);
    setMiniRouteInfo(null);
    setMiniRouteLoading(false);
  }, [scr, selPC?.id, selD?.id]);

  useEffect(() => {
    if (scr !== "places-cat" || !selPC || !miniMapContainerRef.current || miniMapLoading || !miniMapPlaces.length) return;
    let disposed = false;
    const initMiniMap = async () => {
      try {
        const maps = await ensureGoogleMapsApi();
        if (disposed || !maps) return;

        if (!miniGoogleMapRef.current) {
          miniGoogleMapRef.current = new maps.Map(miniMapContainerRef.current, {
            zoom: 13,
            center: selD ? { lat: selD.lat, lng: selD.lng } : { lat: 34.09, lng: -118.33 },
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            cameraControl: false,
            gestureHandling: "greedy",
            styles: [
              { elementType: "geometry", stylers: [{ color: "#f7f7f8" }] },
              { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
              { featureType: "poi", stylers: [{ visibility: "off" }] },
              { featureType: "transit", stylers: [{ visibility: "off" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#eaf0f8" }] },
            ],
          });
        }

        const map = miniGoogleMapRef.current;
        if (!miniGoogleDirectionsRendererRef.current) {
          miniGoogleDirectionsRendererRef.current = new maps.DirectionsRenderer({
            suppressMarkers: true,
            preserveViewport: true,
            polylineOptions: { strokeColor: "#E74C3C", strokeOpacity: 0.95, strokeWeight: 4 },
          });
        }
        miniGoogleDirectionsRendererRef.current.setMap(map);
        map.setOptions({
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          cameraControl: false,
        });
        miniGoogleMarkersRef.current.forEach((m) => m.setMap(null));
        miniGoogleMarkersRef.current = [];
        if (miniGoogleUserMarkerRef.current) miniGoogleUserMarkerRef.current.setMap(null);

        const districtPlaces = places.filter((p) => p.district === selD?.id && p.cat === selPC.id && PLACE_CAT_IDS.has(p.cat));
        const sortedPlaces = [...districtPlaces].sort((a, b) => {
          let cmp = 0;
          if (placeSortField === "name") {
            cmp = (a.name || "").localeCompare(b.name || "", "en", { sensitivity: "base" });
          } else if (placeSortField === "favorites") {
            cmp = (favorites[`place-${a.id}`] ? 1 : 0) - (favorites[`place-${b.id}`] ? 1 : 0);
            if (cmp === 0) cmp = (a.likes || 0) - (b.likes || 0);
          } else {
            cmp = (a.likes || 0) - (b.likes || 0);
          }
          return placeSortDir === "asc" ? cmp : -cmp;
        });
        const orderedPlaces = miniSelectedPlaceId
          ? [
              ...sortedPlaces.filter((p) => p.id === miniSelectedPlaceId),
              ...sortedPlaces.filter((p) => p.id !== miniSelectedPlaceId),
            ]
          : sortedPlaces;
        const coordsById = new Map(miniMapPlaces.map((p) => [p.id, p]));
        const markerPlaces = orderedPlaces.map((p) => coordsById.get(p.id)).filter(Boolean);

        const bounds = new maps.LatLngBounds();
        markerPlaces.forEach((p, idx) => {
          const marker = new maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            map,
            title: p.name,
            label: {
              text: String(idx + 1),
              color: "#fff",
              fontSize: "12px",
              fontWeight: "700",
            },
          });
          marker.addListener("click", () => { setMiniSelectedPlaceId(p.id); });
          miniGoogleMarkersRef.current.push(marker);
          bounds.extend(marker.getPosition());
        });

        if (userCoords) {
          miniGoogleUserMarkerRef.current = new maps.Marker({
            position: userCoords,
            map,
            title: "Вы",
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: "#1F7AE0",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 2,
            },
          });
          bounds.extend(userCoords);
        }

        if (!bounds.isEmpty()) map.fitBounds(bounds, 40);
        maps.event.trigger(map, "resize");
      } catch {
        setMiniMapError("Google Maps недоступны для мини-карты.");
      }
    };
    initMiniMap();
    return () => { disposed = true; };
  }, [scr, selPC, selD, miniMapLoading, miniMapPlaces, userCoords, places, favorites, placeSortField, placeSortDir, miniSelectedPlaceId]);

  useEffect(() => {
    if (scr !== "places-cat") return;
    const renderer = miniGoogleDirectionsRendererRef.current;
    if (!miniSelectedPlaceId) {
      if (renderer) renderer.set("directions", null);
      setMiniRouteInfo(null);
      setMiniRouteLoading(false);
      return;
    }
    if (!window.google?.maps || !miniGoogleMapRef.current || !renderer) return;
    if (!navigator.geolocation) {
      setMiniRouteInfo(null);
      return;
    }
    const target = miniMapPlaces.find((p) => p.id === miniSelectedPlaceId);
    if (!target) return;

    let canceled = false;
    const maps = window.google.maps;
    const getPosition = () => new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 7000, maximumAge: 120000 });
    });

    const build = async () => {
      setMiniRouteLoading(true);
      try {
        const pos = await getPosition();
        if (canceled) return;
        const service = new maps.DirectionsService();
        const res = await service.route({
          origin: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          destination: { lat: target.lat, lng: target.lng },
          travelMode: maps.TravelMode.DRIVING,
        });
        if (canceled) return;
        renderer.setDirections(res);
        const leg = res?.routes?.[0]?.legs?.[0];
        setMiniRouteInfo(leg ? { distance: leg.distance?.text || "", duration: leg.duration?.text || "" } : null);
      } catch {
        renderer.set("directions", null);
        setMiniRouteInfo(null);
      } finally {
        if (!canceled) setMiniRouteLoading(false);
      }
    };

    build();
    return () => { canceled = true; };
  }, [scr, miniSelectedPlaceId, miniMapPlaces]);

  useEffect(() => {
    if (!photoViewer) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [photoViewer]);

  const getTouchDistance = (touches) => {
    if (!touches || touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };
  const onPhotoTouchStart = (e) => {
    if (!photoViewer) return;
    if (e.touches.length >= 2) {
      photoPinchRef.current.baseDistance = getTouchDistance(e.touches);
      photoPinchRef.current.baseZoom = photoZoom;
      photoSwipeRef.current.active = false;
      return;
    }
    if (e.touches.length === 1) {
      photoSwipeRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        active: true,
      };
    }
  };
  const onPhotoTouchMove = (e) => {
    if (!photoViewer) return;
    if (e.touches.length >= 2) {
      e.preventDefault();
      const baseDistance = photoPinchRef.current.baseDistance || getTouchDistance(e.touches);
      const distance = getTouchDistance(e.touches);
      if (!baseDistance || !distance) return;
      const nextZoom = Math.max(1, Math.min(4, (photoPinchRef.current.baseZoom || 1) * (distance / baseDistance)));
      setPhotoZoom(nextZoom);
    }
  };
  const onPhotoTouchEnd = (e) => {
    if (!photoViewer) return;
    if (e.touches.length >= 2) return;
    if (!photoSwipeRef.current.active) return;
    if (photoZoom > 1.02) {
      photoSwipeRef.current.active = false;
      return;
    }
    const changed = e.changedTouches?.[0];
    if (!changed) {
      photoSwipeRef.current.active = false;
      return;
    }
    const dx = changed.clientX - photoSwipeRef.current.startX;
    const dy = changed.clientY - photoSwipeRef.current.startY;
    photoSwipeRef.current.active = false;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNextPhoto();
    else goPrevPhoto();
  };

  const handleSend = async (t) => {
    const msg = t || inp.trim(); if (!msg) return;
    setChat(p => [...p, { role:"user", text:msg }]); setInp(""); setTyping(true);
    try {
      const appData = {
        places: places.slice(0, 250).map((p) => ({
          id: p.id,
          name: p.name,
          district: p.district,
          cat: p.cat,
          address: p.address,
          tip: p.tip,
          likes: p.likes || 0,
        })),
        tips: tips.slice(0, 120).map((t) => ({
          id: t.id,
          title: t.title,
          cat: t.cat,
          text: t.text,
        })),
        events: events.slice(0, 120).map((e) => ({
          id: e.id,
          title: e.title,
          cat: e.cat,
          location: e.location,
          date: e.date,
          desc: e.desc,
        })),
        housing: housing.slice(0, 120).map((h) => ({
          id: h.id,
          title: h.title,
          district: h.district,
          type: h.type,
          address: h.address,
          minPrice: h.minPrice,
          comment: h.comment || "",
          telegram: h.telegram,
          messageContact: h.messageContact,
        })),
      };
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ message:msg, history:chat.slice(-10), appData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setChat(p => [...p, { role:"assistant", text:data.text||"Нет ответа." }]);
    } catch(e) { setChat(p => [...p, { role:"assistant", text:"Ошибка. Попробуйте ещё раз." }]); }
    finally { setTyping(false); }
  };
  const handleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) console.error("Login error:", error);
  };
  const handleLogout = async () => { await signOut(); setUser(null); setLiked({}); setFavorites({}); };
  const handleAddPlace = async () => {
    if (!np.name || !np.cat || !np.tip || !user) return;
    const selectedDistrictId = np.district || selD?.id;
    if (!selectedDistrictId) {
      alert("Выберите район.");
      return;
    }
    if (!np.address.trim() || !addrValidPlace) {
      alert("Выберите реальный адрес из подсказок.");
      return;
    }
    setUploading(true);
    try {
      const safeTip = limitCardText(np.tip).trim();
      // Upload photos to Supabase Storage
      const uploadedUrls = [];
      for (const p of nPhotos) {
        if (p.file) {
          const url = await uploadPhoto(p.file);
          if (url) uploadedUrls.push(url);
          else console.warn('Photo upload failed for:', p.name);
        } else if (p.preview && p.preview.startsWith('http')) {
          uploadedUrls.push(p.preview);
        }
      }
      if (editingPlace) {
        const allPhotos = uploadedUrls;
        const updates = { name:np.name, category:np.cat, district:selectedDistrictId, address:np.address, tip:safeTip, img:PLACE_CATS.find(c=>c.id===np.cat)?.icon||editingPlace.img, photos:allPhotos };
        if (editingPlace.fromDB) await dbUpdatePlace(editingPlace.id, updates);
        setPlaces(prev => prev.map(p => p.id === editingPlace.id ? { ...p, name:np.name, cat:np.cat, district:selectedDistrictId, address:np.address, tip:safeTip, img:updates.img, photos:allPhotos } : p));
        setSelPlace((prev) => prev?.id === editingPlace.id ? { ...prev, name:np.name, cat:np.cat, district:selectedDistrictId, address:np.address, tip:safeTip, img:updates.img, photos:allPhotos } : prev);
        const nextDistrict = DISTRICTS.find((d) => d.id === selectedDistrictId) || null;
        if (nextDistrict) setSelD(nextDistrict);
        setEditingPlace(null);
      } else {
        const dbData = { name:np.name, category:np.cat, district:selectedDistrictId, address:np.address||'', tip:safeTip, rating:0, added_by:user.name, user_id:user.id, img:PLACE_CATS.find(c=>c.id===np.cat)?.icon||"📍", photos:uploadedUrls };
        const { data } = await dbAddPlace(dbData);
        const newId = data?.[0]?.id || Date.now();
        setPlaces(prev => [{ id:newId, cat:np.cat, district:selectedDistrictId, name:np.name, address:np.address, tip:safeTip, addedBy:user.name, userId:user.id, img:dbData.img, photos:uploadedUrls, likes:0, views:0, comments:[], fromDB:true }, ...prev]);
      }
      setNp({ name:"", cat:"", district:selD?.id || "", address:"", tip:"" }); setNPhotos([]); setShowAdd(false);
    } catch(err) {
      console.error('Add place error:', err);
      alert('Ошибка при сохранении. Попробуйте ещё раз.');
    } finally { setUploading(false); }
  };
  const handleDeletePlace = async (placeId) => {
    if (window.confirm("Удалить это место?")) {
      const { error } = await dbDeletePlace(placeId);
      if (error) {
        alert(error.message || "Не удалось удалить место");
        return false;
      }
      setPlaces(prev => prev.filter(p => p.id !== placeId));
      if (selPlace?.id === placeId) {
        setSelPlace(null);
        setScr("places-cat");
      }
      setExp(null);
      if (editingPlace?.id === placeId) {
        setShowAdd(false);
        setEditingPlace(null);
        setNPhotos([]);
      }
      return true;
    }
    return false;
  };
  const startEditPlace = (p) => {
    setEditingPlace(p);
    setNp({ name:p.name, cat:p.cat, district:p.district || selD?.id || "", address:p.address||"", tip:p.tip });
    setNPhotos((p.photos || []).filter(ph => typeof ph === "string" && ph.startsWith("http")).map((ph) => ({ name:"existing", preview:ph })));
    setAddrValidPlace(!!(p.address || "").trim());
    setNameOptionsPlace([]);
    setAddrOptionsPlace([]);
    setShowAdd(true);
  };
  const openAddForm = () => {
    if (!user) { handleLogin(); return; }
    setEditingPlace(null);
    setNp({ name:"", cat:selPC?.id||"", district:selD?.id || "", address:"", tip:"" });
    setNPhotos([]);
    setAddrValidPlace(false);
    setNameOptionsPlace([]);
    setAddrOptionsPlace([]);
    setShowAdd(true);
  };
  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const newFiles = files.map(f => ({ file: f, name: f.name, preview: URL.createObjectURL(f) }));
    setNPhotos(prev => [...prev, ...newFiles].slice(0, 5));
  };
  const handleTipPhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const newFiles = files.map(f => ({ file: f, name: f.name, preview: URL.createObjectURL(f) }));
    setNewTipPhotos(prev => [...prev, ...newFiles].slice(0, 3));
  };
  const handleEventPhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const newFiles = files.map(f => ({ file: f, name: f.name, preview: URL.createObjectURL(f) }));
    setNewEventPhotos(prev => [...prev, ...newFiles].slice(0, 3));
  };
  const startEditEvent = (ev) => {
    setEditingEvent(ev);
    setNewEvent({
      title: ev.title || "",
      date: ev.date ? new Date(ev.date).toISOString().slice(0,16) : "",
      location: ev.location || "",
      desc: ev.desc || "",
      website: ev.website || "",
      cat: ev.cat || "",
    });
    setNewEventPhotos((ev.photos || []).filter(ph => typeof ph === "string" && ph.startsWith("http")).map((ph) => ({ name:"existing", preview:ph })));
    setAddrValidEvent(!!(ev.location || "").trim());
    setAddrOptionsEvent([]);
    setShowAddEvent(true);
  };
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Удалить событие?")) return;
    const { error } = await dbDeleteEvent(eventId);
    if (error) {
      alert(error.message || "Не удалось удалить событие");
      return;
    }
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setShowAddEvent(false);
    setEditingEvent(null);
    setExp(null);
  };
  const startEditTip = (tip) => {
    setEditingTip(tip);
    setNewTip({ title: tip.title || "", text: tip.text || "" });
    setNewTipPhotos((tip.photos || []).filter(ph => typeof ph === "string" && ph.startsWith("http")).map((ph) => ({ name:"existing", preview:ph })));
    setShowAddTip(true);
  };
  const handleDeleteTip = async (tipId) => {
    if (!window.confirm("Удалить совет?")) return;
    const { error } = await dbDeleteTip(tipId);
    if (error) {
      alert(error.message || "Не удалось удалить совет");
      return;
    }
    setTips(prev => prev.filter(t => t.id !== tipId));
    setShowAddTip(false);
    setEditingTip(null);
    if (showComments === `tip-${tipId}`) setShowComments(null);
    if (exp === `tip-${tipId}`) setExp(null);
  };
  const handleAddTip = async () => {
    if (!newTip.title || !newTip.text || !user || !selTC) return;
    const safeTipText = limitCardText(newTip.text).trim();
    const uploaded = [];
    for (const p of newTipPhotos) {
      if (p.file) {
        const url = await uploadPhoto(p.file);
        if (url) uploaded.push(url);
      } else if (p.preview && p.preview.startsWith("http")) {
        uploaded.push(p.preview);
      }
    }
    const dbData = { category:selTC.id, title:newTip.title, text:encodeRichText(safeTipText, uploaded), author:user.name, user_id:user.id };
    if (editingTip) {
      await dbUpdateTip(editingTip.id, dbData);
      setTips(prev => prev.map(t => t.id === editingTip.id ? { ...t, cat:selTC.id, title:newTip.title, text:safeTipText, photos:uploaded } : t));
    } else {
      const { data } = await dbAddTip(dbData);
      const newId = data?.[0]?.id || Date.now();
      setTips(prev => [{ id:newId, cat:selTC.id, author:user.name, userId:user.id, title:newTip.title, text:safeTipText, photos:uploaded, likes:0, views:0, comments:[], fromDB:true }, ...prev]);
    }
    setNewTip({ title:"", text:"" }); setNewTipPhotos([]); setShowAddTip(false); setEditingTip(null);
  };
  const handleAddComment = async (tipId) => {
    if (!newComment.trim() || !user) return;
    const { data } = await dbAddComment({ item_id:tipId, item_type:"tip", author:user.name, user_id:user.id, text:newComment.trim() });
    const cId = data?.[0]?.id || Date.now();
    setTips(prev => prev.map(t => t.id === tipId ? { ...t, comments: [...(t.comments||[]), { id:cId, author:user.name, text:newComment.trim(), userId:user.id }] } : t));
    setNewComment("");
  };
  const addPlaceComment = async (placeId) => {
    if (!newComment.trim() || !user) return;
    const { data } = await dbAddComment({ item_id:placeId, item_type:"place", author:user.name, user_id:user.id, text:newComment.trim() });
    const cId = data?.[0]?.id || Date.now();
    setPlaces(prev => prev.map(p => p.id === placeId ? { ...p, comments: [...(p.comments||[]), { id:cId, author:user.name, text:newComment.trim(), userId:user.id }] } : p));
    setNewComment("");
  };
  const addEventComment = async (eventId) => {
    if (!newComment.trim() || !user) return;
    const { data } = await dbAddComment({ item_id:eventId, item_type:"event", author:user.name, user_id:user.id, text:newComment.trim() });
    const cId = data?.[0]?.id || Date.now();
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, comments: [...(e.comments||[]), { id:cId, author:user.name, text:newComment.trim(), userId:user.id }] } : e));
    setNewComment("");
  };
  const deleteCommentFn = async (itemId, commentId, type) => {
    await dbDeleteComment(commentId);
    const updater = (items) => items.map(item => item.id === itemId ? { ...item, comments: (item.comments||[]).filter(c => c.id !== commentId) } : item);
    if (type === "place") setPlaces(updater);
    else if (type === "tip") setTips(updater);
    else if (type === "event") setEvents(updater);
  };
  const saveEditComment = async (itemId, commentId, type) => {
    if (!editCommentText.trim()) return;
    await dbUpdateComment(commentId, editCommentText.trim());
    const updater = (items) => items.map(item => item.id === itemId ? { ...item, comments: (item.comments||[]).map(c => c.id === commentId ? { ...c, text: editCommentText.trim() } : c) } : item);
    if (type === "place") setPlaces(updater);
    else if (type === "tip") setTips(updater);
    else if (type === "event") setEvents(updater);
    setEditingComment(null); setEditCommentText("");
  };
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.desc || !newEvent.cat || !user) return;
    if (!newEvent.location.trim() || !addrValidEvent) {
      alert("Выберите место из подсказок адреса.");
      return;
    }
    const uploaded = [];
    for (const p of newEventPhotos) {
      if (p.file) {
        const url = await uploadPhoto(p.file);
        if (url) uploaded.push(url);
      } else if (p.preview && p.preview.startsWith("http")) {
        uploaded.push(p.preview);
      }
    }
    const safeEventDesc = limitCardText(newEvent.desc).trim();
    const website = normalizeExternalUrl(newEvent.website || "");
    const dbData = { category:newEvent.cat, title:newEvent.title, date:newEvent.date, location:newEvent.location||'', description:encodeRichText(safeEventDesc, uploaded, { website }), author:user.name, user_id:user.id };
    if (editingEvent) {
      await dbUpdateEvent(editingEvent.id, dbData);
      setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, cat:newEvent.cat, title:newEvent.title, date:newEvent.date, location:newEvent.location, desc:safeEventDesc, website, photos:uploaded } : ev));
    } else {
      const { data } = await dbAddEvent(dbData);
      const newId = data?.[0]?.id || Date.now();
      setEvents(prev => [{ id:newId, cat:newEvent.cat, title:newEvent.title, date:newEvent.date, location:newEvent.location, desc:safeEventDesc, website, photos:uploaded, author:user.name, userId:user.id, likes:0, views:0, comments:[], fromDB:true }, ...prev]);
    }
    setNewEvent({ title:"", date:"", location:"", desc:"", website:"", cat:"" }); setNewEventPhotos([]); setEditingEvent(null); setAddrValidEvent(false); setAddrOptionsEvent([]); setShowAddEvent(false);
  };
  const handleAddHousing = async () => {
    if (!user) { handleLogin(); return; }
    if (!newHousing.address.trim() || !newHousing.minPrice) return;
    if (editingHousing && (!editingHousing.userId || editingHousing.userId !== user.id)) {
      alert("Редактировать жильё может только автор объявления.");
      return;
    }
    const uploaded = [];
    for (const p of newHousingPhotos) {
      if (p.file) {
        const url = await uploadPhoto(p.file);
        if (url) uploaded.push(url);
      } else if (p.preview && p.preview.startsWith("http")) {
        uploaded.push(p.preview);
      }
    }
    const typeMap = { room: "Комната", studio: "Студия", "1bd": "1 bd", "2bd": "2 bd" };
    const title = `${typeMap[newHousing.type] || "Жильё"} · ${newHousing.district.trim() || "LA"}`;
    const contactTags = [];
    const tg = (newHousing.telegram || "").trim();
    const msg = (newHousing.messageContact || "").trim();
    const comment = String(newHousing.comment || "").slice(0, 1000).trim();
    if (tg) contactTags.push(`contact_tg:${tg}`);
    if (msg) contactTags.push(`contact_msg:${msg}`);
    if (comment) contactTags.push(`comment:${encodeURIComponent(comment)}`);
    const payload = {
      title,
      address: normalizeAddressText(newHousing.address.trim()),
      district: newHousing.district.trim(),
      type: (newHousing.type || "studio").trim(),
      min_price: Number(newHousing.minPrice || 0),
      price_options: [],
      beds: 0,
      baths: 0,
      updated_label: "",
      tags: contactTags,
      photo: encodeHousingPhotos(uploaded),
      user_id: user.id,
    };
    const saveFn = editingHousing ? dbUpdateHousing : dbAddHousing;
    const saveRes = editingHousing
      ? await saveFn(editingHousing.id, payload, user.id)
      : await saveFn(payload);
    const { data, error } = saveRes || {};
    if (error) {
      alert(error.message || "Не удалось сохранить жильё");
      return;
    }
    const row = data?.[0];
    if (row && editingHousing) {
      setHousing((prev) => prev.map((h) => h.id === editingHousing.id ? {
        id: row.id,
        title: row.title || "",
        address: normalizeAddressText(row.address || ""),
        district: row.district || "",
        type: row.type || "studio",
        minPrice: Number(row.min_price || 0),
        options: Array.isArray(row.price_options) ? row.price_options : [],
        beds: Number(row.beds || 0),
        baths: Number(row.baths || 0),
        updatedLabel: row.updated_label || "",
        tags: (Array.isArray(row.tags) ? row.tags : []).filter((t) => !String(t).startsWith("contact_tg:") && !String(t).startsWith("contact_msg:") && !String(t).startsWith("comment:")),
        comment: (() => {
          const c = (Array.isArray(row.tags) ? row.tags : []).find((t) => String(t).startsWith("comment:")) || "";
          const raw = String(c).replace("comment:", "");
          try { return decodeURIComponent(raw); } catch { return raw; }
        })(),
        telegram: ((Array.isArray(row.tags) ? row.tags : []).find((t) => String(t).startsWith("contact_tg:")) || "").replace("contact_tg:", ""),
        messageContact: ((Array.isArray(row.tags) ? row.tags : []).find((t) => String(t).startsWith("contact_msg:")) || "").replace("contact_msg:", ""),
        photos: decodeHousingPhotos(row.photo),
        photo: decodeHousingPhotos(row.photo)[0] || "",
        userId: row.user_id,
        likes: row.likes_count || 0,
        views: Number(row.views || 0),
        fromDB: true,
      } : h));
    } else if (row) {
      setHousing((prev) => [{
        id: row.id,
        title: row.title || "",
        address: normalizeAddressText(row.address || ""),
        district: row.district || "",
        type: row.type || "studio",
        minPrice: Number(row.min_price || 0),
        options: Array.isArray(row.price_options) ? row.price_options : [],
        beds: Number(row.beds || 0),
        baths: Number(row.baths || 0),
        updatedLabel: row.updated_label || "",
        tags: (Array.isArray(row.tags) ? row.tags : []).filter((t) => !String(t).startsWith("contact_tg:") && !String(t).startsWith("contact_msg:") && !String(t).startsWith("comment:")),
        comment: (() => {
          const c = (Array.isArray(row.tags) ? row.tags : []).find((t) => String(t).startsWith("comment:")) || "";
          const raw = String(c).replace("comment:", "");
          try { return decodeURIComponent(raw); } catch { return raw; }
        })(),
        telegram: ((Array.isArray(row.tags) ? row.tags : []).find((t) => String(t).startsWith("contact_tg:")) || "").replace("contact_tg:", ""),
        messageContact: ((Array.isArray(row.tags) ? row.tags : []).find((t) => String(t).startsWith("contact_msg:")) || "").replace("contact_msg:", ""),
        photos: decodeHousingPhotos(row.photo),
        photo: decodeHousingPhotos(row.photo)[0] || "",
        userId: row.user_id,
        likes: row.likes_count || 0,
        views: Number(row.views || 0),
        fromDB: true,
      }, ...prev]);
    }
    setNewHousing({ address:"", district:"", type:"studio", minPrice:"", comment:"", telegram:"", messageContact:"" });
    setNewHousingPhotos([]);
    setAddrValidHousing(false);
    setAddrOptionsHousing([]);
    setEditingHousing(null);
    setShowAddHousing(false);
  };
  const startEditHousing = (item) => {
    if (!item) return;
    if (!user?.id || !item.userId || item.userId !== user.id) {
      alert("Редактировать жильё может только автор объявления.");
      return;
    }
    setEditingHousing(item);
    setNewHousing({
      address: item.address || "",
      district: item.district || "",
      type: item.type || "studio",
      minPrice: String(item.minPrice || ""),
      comment: item.comment || "",
      telegram: item.telegram || "",
      messageContact: item.messageContact || "",
    });
    setNewHousingPhotos((item.photos || []).filter((ph) => typeof ph === "string" && ph.startsWith("http")).map((ph) => ({ name:"existing", preview:ph })));
    setAddrValidHousing(!!(item.address || "").trim());
    setAddrOptionsHousing([]);
    setShowAddHousing(true);
  };
  const handleDeleteHousing = async (housingId) => {
    if (!housingId) return;
    const item = housing.find((h) => h.id === housingId);
    if (!user?.id || !item?.userId || item.userId !== user.id) {
      alert("Удалять жильё может только автор объявления.");
      return;
    }
    if (!confirm("Удалить это жильё?")) return;
    const { error } = await dbDeleteHousing(housingId, user.id);
    if (error) {
      alert(error.message || "Не удалось удалить жильё");
      return;
    }
    setHousing((prev) => prev.filter((h) => h.id !== housingId));
    if (selHousing?.id === housingId) {
      setSelHousing(null);
      setScr("housing");
    }
    setEditingHousing(null);
    setShowAddHousing(false);
  };
  const handleToggleLike = async (itemId, itemType) => {
    if (!user) { handleLogin(); return; }
    const key = `${itemType}-${itemId}`;
    const wasLiked = liked[key];
    setLiked(prev => ({ ...prev, [key]: !wasLiked }));
    // Update local count
    const countUpdater = (items) => items.map(item => item.id === itemId ? { ...item, likes: (item.likes||0) + (wasLiked ? -1 : 1) } : item);
    if (itemType === "place") setPlaces(countUpdater);
    else if (itemType === "tip") setTips(countUpdater);
    else if (itemType === "event") setEvents(countUpdater);
    else if (itemType === "housing") setHousing(countUpdater);
    // Persist to DB
    await dbToggleLike(itemId, itemType, user.id);
  };
  const toggleFavorite = (itemId, itemType) => {
    const key = `${itemType}-${itemId}`;
    setFavorites(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const startTest = () => { setTShuf(shuffleTest(CIVICS_RAW)); setTQ(0); setTAns([]); setTDone(false); setScr("test"); };
  const ansTest = (i) => { setTAns(p => [...p, { correct: i === tShuf[tQ].correctIdx }]); if (tQ+1 >= tShuf.length) setTDone(true); else setTQ(tQ+1); };

  const sRes = srch.trim().length>=2 ? USCIS_CATS.flatMap(c=>c.docs.filter(d=>{const q=srch.toLowerCase();return d.form.toLowerCase().includes(q)||d.name.toLowerCase().includes(q);}).map(d=>({...d,cT:c.title,cI:c.icon}))) : [];
  const dPlaces = selD ? places.filter(p=>p.district===selD.id && PLACE_CAT_IDS.has(p.cat)) : [];
  const cPlaces = selPC ? dPlaces.filter(p=>p.cat===selPC.id) : [];
  const calcDistanceKm = (a, b) => {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const s1 = Math.sin(dLat / 2) ** 2;
    const s2 = Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s1 + s2));
  };
  const cPlacesSorted = [...cPlaces].sort((a, b) => {
    let cmp = 0;
    if (placeSortField === "name") {
      cmp = (a.name || "").localeCompare(b.name || "", "en", { sensitivity: "base" });
    } else if (placeSortField === "favorites") {
      cmp = (favorites[`place-${a.id}`] ? 1 : 0) - (favorites[`place-${b.id}`] ? 1 : 0);
      if (cmp === 0) cmp = (a.likes || 0) - (b.likes || 0);
    } else {
      cmp = (a.likes || 0) - (b.likes || 0);
    }
    return placeSortDir === "asc" ? cmp : -cmp;
  });
  const miniSelectedPlace = miniSelectedPlaceId ? cPlacesSorted.find((p) => p.id === miniSelectedPlaceId) || null : null;
  const cPlacesDisplay = miniSelectedPlace
    ? [miniSelectedPlace, ...cPlacesSorted.filter((p) => p.id !== miniSelectedPlace.id)]
    : cPlacesSorted;
  const activePlace = selPlace ? (places.find((p) => p.id === selPlace.id) || null) : null;
  const catTips = selTC ? tips.filter(t=>t.cat===selTC.id) : [];
  const tipsQuery = tipsSearchApplied.trim().toLowerCase();
  const tipsSearchResults = tipsQuery
    ? tips.filter((t) => {
        const catTitle = TIPS_CATS.find((c) => c.id === t.cat)?.title || "";
        const hay = `${t.title || ""} ${t.text || ""} ${t.author || ""} ${catTitle}`.toLowerCase();
        return hay.includes(tipsQuery);
      })
    : [];
  const applyTipsSearch = () => {
    setTipsSearchApplied(tipsSearchInput.trim());
    setSelTC(null);
    setExpTip(null);
  };
  const housingFiltered = housing.filter((item) => {
    const byQuery = true;
    const byBeds = housingBedsFilter === "all"
      || (housingBedsFilter === "studio" && item.type === "studio")
      || (housingBedsFilter === "1" && (item.type === "1bd" || item.type === "2bd"))
      || (housingBedsFilter === "2" && item.type === "2bd")
      || (housingBedsFilter === "room" && item.type === "room");
    return byQuery && byBeds;
  });
  const housingSorted = housingFiltered;
  const formatHousingPrice = (value) => {
    try { return Number(value || 0).toLocaleString("en-US"); } catch { return String(value || 0); }
  };
  const formatHousingType = (value) => {
    const map = { room: "Комната", studio: "Студия", "1bd": "1 bd", "2bd": "2 bd" };
    return map[value] || value || "Студия";
  };
  const openTelegramContact = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return;
    let username = raw;
    if (/^https?:\/\/t\.me\//i.test(raw)) {
      username = raw.replace(/^https?:\/\/t\.me\//i, "").split(/[/?#]/)[0] || "";
    }
    username = username.startsWith("@") ? username.slice(1) : username;
    if (!username) return;
    openExternalUrl(`tg://resolve?domain=${encodeURIComponent(username)}`);
  };
  const openMessageContact = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return;
    const digits = raw.replace(/[^\d+]/g, "");
    if (!digits) return;
    openExternalUrl(`sms:${encodeURIComponent(digits)}`);
  };
  const activeHousing = selHousing ? (housing.find((h) => h.id === selHousing.id) || null) : null;
  const canManageActiveHousing = !!(user?.id && activeHousing?.userId && user.id === activeHousing.userId);
  useEffect(() => {
    if (scr !== "place-item" || !activePlace?.id) return;
    if (viewedRef.current.place === activePlace.id) return;
    let canceled = false;
    (async () => {
      const ok = await trackCardView("place", activePlace);
      if (!canceled && ok) viewedRef.current.place = activePlace.id;
    })();
    return () => { canceled = true; };
  }, [scr, activePlace?.id, authReady]);
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
  }, [scr, activeHousing?.id, authReady]);
  useEffect(() => {
    if (scr !== "housing-item") viewedRef.current.housing = null;
  }, [scr]);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const catEvents = selEC ? events.filter(e=>{
    if (e.cat !== selEC.id) return false;
    const eventDate = new Date(e.date);
    if (Number.isNaN(eventDate.getTime())) return false;
    const eventDayStart = new Date(eventDate);
    eventDayStart.setHours(0, 0, 0, 0);
    if (eventDayStart < todayStart) return false;
    if (filterDate) {
      const evDate = eventDate.toDateString();
      const fDate = new Date(filterDate).toDateString();
      return evDate === fDate;
    }
    return true;
  }).sort((a,b) => new Date(a.date) - new Date(b.date)) : [];

  const fmtDate = (d) => {
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString("ru-RU", { weekday:"short", day:"numeric", month:"long", year:"numeric" }) + ", " + dt.toLocaleTimeString("ru-RU", { hour:"2-digit", minute:"2-digit" });
    } catch { return d; }
  };

  useEffect(() => {
    if (scr === "place-item" && !activePlace) setScr("places-cat");
  }, [scr, activePlace]);
  useEffect(() => {
    if (scr === "housing-item" && housing.length > 0 && !activeHousing) setScr("housing");
  }, [scr, activeHousing, housing.length]);
  useEffect(() => {
    if (!showAddHousing && !showAddEvent) return;
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, [showAddHousing, showAddEvent]);

  // ─── Reusable Comments Block ───
  const renderComments = (item, type, addFn) => {
    const comments = item.comments || [];
    const isOpen = showComments === `${type}-${item.id}`;
    return (
      <div style={{ padding:"0 16px 16px" }}>
        <button onClick={e=>{e.stopPropagation(); setShowComments(isOpen ? null : `${type}-${item.id}`); setNewComment(""); setEditingComment(null);}}
          style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, color:T.mid, padding:"4px 0", display:"flex", alignItems:"center", gap:6 }}>
          💬 Комментарии ({comments.length}) <span style={{ fontSize:10, color:T.light, transition:"0.3s", transform:isOpen?"rotate(180deg)":"" }}>▼</span>
        </button>
        {isOpen && (<div style={{ marginTop:8 }}>
          {comments.map((c) => (
            <div key={c.id||Math.random()} style={{ padding:"10px 12px", background:T.bg, borderRadius:10, marginBottom:6, fontSize:13 }}>
              {editingComment === c.id ? (
                <div style={{ display:"flex", gap:6 }}>
                  <input value={editCommentText} onChange={e=>setEditCommentText(e.target.value)} style={{ ...iS, flex:1, padding:"8px 12px", fontSize:13 }} />
                  <button onClick={()=>saveEditComment(item.id, c.id, type)} style={{ ...pl(true), padding:"8px 14px", fontSize:12 }}>✓</button>
                  <button onClick={()=>{setEditingComment(null);setEditCommentText("")}} style={{ ...pl(false), padding:"8px 14px", fontSize:12 }}>✕</button>
                </div>
              ) : (<div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:600, color:T.text }}>{c.author}</span>
                  {user && (user.id === c.userId || user.name === c.author) && (
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={()=>{setEditingComment(c.id);setEditCommentText(c.text)}} style={{ background:"none", border:"none", color:T.light, cursor:"pointer", fontSize:11, padding:2 }}>✏️</button>
                      <button onClick={()=>deleteCommentFn(item.id, c.id, type)} style={{ background:"none", border:"none", color:"#E74C3C", cursor:"pointer", fontSize:11, padding:2 }}>🗑</button>
                    </div>
                  )}
                </div>
                <div style={{ color:T.mid, marginTop:4 }}>{c.text}</div>
              </div>)}
            </div>
          ))}
          {user ? (
            <div style={{ display:"flex", gap:8, marginTop:6 }}>
              <input value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addFn(item.id)} placeholder="Написать комментарий..." style={{ ...iS, flex:1, padding:"10px 14px" }} />
              <button onClick={()=>addFn(item.id)} disabled={!newComment.trim()} style={{ ...pl(!!newComment.trim()), padding:"10px 16px", opacity:newComment.trim()?1:0.5 }}>→</button>
            </div>
          ) : (<button onClick={handleLogin} style={{ ...pl(false), width:"100%", fontSize:12, marginTop:4 }}>Войдите чтобы комментировать</button>)}
        </div>)}
      </div>
    );
  };

  // Prevent iOS pinch zoom
  useEffect(() => {
    const prevent = (e) => { if (e.touches && e.touches.length > 1) e.preventDefault(); };
    const preventGesture = (e) => e.preventDefault();
    document.addEventListener('touchmove', prevent, { passive: false });
    document.addEventListener('gesturestart', preventGesture);
    document.addEventListener('gesturechange', preventGesture);
    return () => {
      document.removeEventListener('touchmove', prevent);
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
    };
  }, []);

  const cd = { background:T.card, borderRadius:T.r, boxShadow:T.sh, border:`1px solid ${T.borderL}`, transition:"all 0.25s ease" };
  const bk = { background:"none", border:"none", color:T.primary, fontSize:14, fontWeight:500, cursor:"pointer", padding:"12px 0 8px", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 };
  const pl = (a) => ({ padding:"10px 20px", borderRadius:24, border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", background:a?T.primary:T.primaryLight, color:a?"#fff":T.primary });
  const iS = { width:"100%", padding:"14px 16px", background:T.card, border:`1px solid ${T.border}`, borderRadius:T.rs, color:T.text, fontSize:16, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ fontFamily:"'Roboto', sans-serif", minHeight:"100vh", background:T.bg, color:T.text, maxWidth:480, margin:"0 auto", touchAction:"manipulation" }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet" />

      <header style={{ padding:"16px 20px", background:T.card, borderBottom:`1px solid ${T.borderL}`, display:"flex", alignItems:"center", justifyContent:"space-between", opacity:mt?1:0, transition:"opacity 0.4s" }}>
        <div onClick={goHome} style={{ cursor:"pointer" }}>
          <h1 style={{ fontSize:22, fontWeight:900, margin:0 }}><span style={{ color:T.primary }}>МЫ</span> в LA</h1>
          <p style={{ margin:"1px 0 0", fontSize:11, color:T.light }}>путеводитель</p>
        </div>
        {user ? (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, color:T.mid }}>{user.name}</span>
            <div style={{ width:32, height:32, borderRadius:10, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>👤</div>
            <button onClick={handleLogout} style={{ background:"none", border:"none", color:T.light, fontSize:11, cursor:"pointer" }}>Выйти</button>
          </div>
        ) : (
          <button onClick={handleLogin} style={{ ...pl(false), padding:"8px 14px", fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Войти
          </button>
        )}
      </header>

      <main style={{ padding:"16px 16px 40px" }}>

        {scr==="home" && (() => {
          const chatSection = SECTIONS.find((s) => s.id === "chat-sec");
          const mainSections = SECTIONS.filter((s) => s.id !== "chat-sec");
          return (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                {mainSections.map((s,i) => (
                  <button key={s.id} onClick={() => { if (s.soon) return; setScr(s.id); }}
                    style={{ ...cd, padding:"20px 10px", cursor:s.soon?"default":"pointer", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", fontFamily:"inherit", color:T.text, position:"relative", opacity:mt?1:0, transform:mt?"translateY(0)":"translateY(12px)", transition:`all 0.4s ease ${i*0.05}s` }}
                    onMouseEnter={e=>{if(!s.soon)e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
                    {s.soon && <div style={{ position:"absolute", top:6, right:6, fontSize:8, fontWeight:700, color:T.light, background:T.bg, padding:"2px 6px", borderRadius:4, textTransform:"uppercase" }}>скоро</div>}
                    <div style={{ fontSize:28, marginBottom:8, filter:s.soon?"grayscale(0.6) opacity(0.4)":"none", display:"inline-flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
                      {s.id === "housing" ? <HomeIcon size={28} /> : s.id === "events" ? <CalendarIcon size={28} /> : s.icon}
                    </div>
                    <div style={{ fontWeight:700, fontSize:13, opacity:s.soon?0.4:1 }}>{s.title}</div>
                    <div style={{ fontSize:11, color:T.mid, marginTop:3, opacity:s.soon?0.3:0.7 }}>{s.desc}</div>
                  </button>
                ))}
              </div>
              {chatSection && (
                <button
                  onClick={() => { if (!user) {handleLogin();return;} setScr("chat"); }}
                  style={{ ...cd, marginTop:12, width:"100%", padding:"16px 18px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left", opacity:mt?1:0, transform:mt?"translateY(0)":"translateY(12px)", transition:"all 0.4s ease 0.35s" }}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}
                >
                  <div style={{ width:36, height:36, borderRadius:12, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{chatSection.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13, lineHeight:1.2 }}>AI Чат</div>
                    <div style={{ fontSize:11, color:T.mid, marginTop:3, opacity:0.7 }}>{chatSection.desc}</div>
                  </div>
                </button>
              )}
            </div>
          );
        })()}

        {/* USCIS */}
        {scr==="uscis" && (<div>
          <button onClick={goHome} style={bk}>← Главная</button>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 14px" }}>📋 Справочник USCIS</h2>
          <div style={{ ...cd, marginBottom:12, padding:"10px 12px", border:`1px solid #FDE2C7`, background:"#FFF8F1" }}>
            <div style={{ fontSize:12, color:T.mid, lineHeight:1.45 }}>
              Важно: информация в этом разделе только для ознакомления. Обязательно проверяйте актуальные требования на официальном сайте USCIS и при необходимости консультируйтесь с иммиграционным адвокатом.
            </div>
          </div>
          <div style={{ position:"relative", marginBottom:14 }}>
            <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:T.light, pointerEvents:"none" }}>🔎</div>
            <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Поиск формы..." style={{ ...iS, paddingLeft:42, borderColor:srch?T.primary:T.border }} />
          </div>
          {srch.trim().length>=2 ? (<div>{sRes.map((d,i) => { return (<div key={i} style={{ ...cd, padding:"14px 16px", marginBottom:8 }}>
            <div style={{ display:"flex", gap:8, marginBottom:6, alignItems:"center", flexWrap:"wrap" }}>
              {d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, color:T.primary, background:T.primaryLight, textDecoration:"none" }}>{d.form} ↗</a> : <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, color:T.primary, background:T.primaryLight }}>{d.form}</span>}
              <span style={{ fontSize:11, color:T.mid }}>{d.cI} {d.cT}</span>
            </div>
            <div style={{ fontWeight:600, fontSize:14 }}>{d.name}</div><div style={{ fontSize:12, color:T.mid, marginTop:3 }}>{d.desc}</div>
          </div>); })}{sRes.length===0 && <p style={{ fontSize:13, color:T.mid }}>Не найдено</p>}</div>) : (<><div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {USCIS_CATS.map(c => (<button key={c.id} onClick={() => { setSelU(c); setScr("uscis-cat"); setExpF(null); }}
              style={{ ...cd, display:"flex", alignItems:"center", gap:14, padding:"16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
              <div style={{ width:48, height:48, borderRadius:T.rs, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{c.icon}</div>
              <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{c.title}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{c.subtitle}</div></div>
              <div style={{ color:T.light }}>›</div>
            </button>))}
          </div>
          {/* Case status checker */}
          <div style={{ ...cd, marginTop:14, padding:"18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}><span style={{ fontSize:20 }}>🔍</span><span style={{ fontWeight:700, fontSize:15 }}>Проверить статус кейса</span></div>
            <p style={{ fontSize:13, color:T.mid, margin:"0 0 12px" }}>Введите receipt number</p>
            <div style={{ display:"flex", gap:8 }}>
              <input placeholder="EAC-XX-XXX-XXXXX" style={{ ...iS, flex:1, width:"auto" }} />
              <a href="https://egov.uscis.gov/casestatussearchwidget" target="_blank" rel="noopener noreferrer" style={{ ...pl(true), textDecoration:"none", display:"flex", alignItems:"center" }}>Проверить</a>
            </div>
          </div>
          </>)}
        </div>)}

        {/* USCIS CAT */}
        {scr==="uscis-cat" && selU && (<div>
          <button onClick={() => setScr("uscis")} style={bk}>← Справочник</button>
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 20px" }}>
            <div style={{ width:48, height:48, borderRadius:14, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>{selU.icon}</div>
            <div><h2 style={{ fontSize:22, fontWeight:700, margin:0 }}>{selU.title}</h2></div>
          </div>
          {selU.docs.map((d, i) => { const isE = expF===i; const pdfUrl = getUscisPdfUrl(d); return (<div key={i} style={{ ...cd, marginBottom:10, overflow:"hidden", borderColor:isE?T.primary+"40":T.borderL }}>
            <div onClick={() => setExpF(isE?null:i)} style={{ padding:"16px", cursor:"pointer" }} onMouseEnter={e=>{e.currentTarget.style.background=T.bg}} onMouseLeave={e=>{e.currentTarget.style.background=T.card}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  {d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:6, color:T.primary, background:T.primaryLight, textDecoration:"none" }}>{d.form} ↗</a> : <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:6, color:T.primary, background:T.primaryLight }}>{d.form}</span>}
                </div>
                <span style={{ fontSize:11, color:isE?T.primary:T.light, transform:isE?"rotate(180deg)":"", transition:"0.3s" }}>▼</span>
              </div>
              <div style={{ fontWeight:600, fontSize:14, marginTop:10 }}>{d.name}</div>
              <div style={{ fontSize:12, color:T.mid, marginTop:4 }}>{d.desc}</div>
            </div>
            {isE && (<div style={{ padding:"0 16px 16px", borderTop:`1px solid ${T.borderL}` }}>
              <div style={{ padding:14, background:T.bg, borderRadius:10, marginTop:12, fontSize:13, lineHeight:1.65, color:T.mid }}>{d.detail}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:12 }}>
                {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", ...pl(true), textDecoration:"none", fontSize:12 }}>uscis.gov ↗</a>}
                {pdfUrl && <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download style={{ ...pl(false), textDecoration:"none", fontSize:12, display:"inline-flex", alignItems:"center" }}>Открыть PDF</a>}
              </div>
              {d.isTest && <button onClick={startTest} style={{ ...pl(true), marginTop:12, width:"100%" }}>🇺🇸 Start Civics Test</button>}
            </div>)}
          </div>); })}
        </div>)}

        {/* CIVICS TEST — English, shuffled answers */}
        {scr==="test" && (<div>
          <button onClick={goHome} style={bk}>← Exit</button>
          {!tDone ? (<div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}><h2 style={{ fontSize:18, fontWeight:700, margin:0 }}>🇺🇸 Civics Test</h2><span style={{ fontSize:13, color:T.mid, fontWeight:600 }}>{tQ+1}/{tShuf.length}</span></div>
            <div style={{ width:"100%", height:4, background:T.borderL, borderRadius:2, marginBottom:20 }}><div style={{ width:`${((tQ+1)/tShuf.length)*100}%`, height:4, background:T.primary, borderRadius:2, transition:"width 0.3s" }} /></div>
            <div style={{ ...cd, padding:20 }}>
              <p style={{ fontSize:16, fontWeight:600, lineHeight:1.5, margin:"0 0 20px" }}>{tShuf[tQ]?.q}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {tShuf[tQ]?.opts.map((opt,oi) => (
                  <button key={oi} onClick={() => ansTest(oi)} style={{ ...cd, padding:"14px 16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left", fontSize:14, fontWeight:500, boxShadow:"none", border:`1.5px solid ${T.border}` }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=T.primary;e.currentTarget.style.background=T.primaryLight}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.card}}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginTop:12, fontSize:12, color:T.mid, textAlign:"center" }}>✅ {tAns.filter(a=>a.correct).length} · ❌ {tAns.filter(a=>!a.correct).length}</div>
          </div>) : (<div style={{ textAlign:"center" }}>
            <div style={{ fontSize:60, marginBottom:16 }}>{tAns.filter(a=>a.correct).length >= Math.floor(tShuf.length*0.6) ? "🎉" : "📚"}</div>
            <h2 style={{ fontSize:22, fontWeight:700, margin:"0 0 8px" }}>Test Complete!</h2>
            <div style={{ ...cd, padding:24, margin:"16px 0" }}>
              <div style={{ fontSize:48, fontWeight:900, color:tAns.filter(a=>a.correct).length>=Math.floor(tShuf.length*0.6)?"#27AE60":T.primary }}>{tAns.filter(a=>a.correct).length} / {tShuf.length}</div>
              <p style={{ fontSize:14, color:T.mid, marginTop:8 }}>correct answers</p>
            </div>
            <div style={{ display:"flex", gap:10 }}><button onClick={startTest} style={{ ...pl(true), flex:1, padding:14 }}>🔄 Retry</button><button onClick={goHome} style={{ ...pl(false), flex:1, padding:14 }}>← Home</button></div>
          </div>)}
        </div>)}

        {/* PLACES → DISTRICTS */}
        {scr==="places" && (<div>
          <button onClick={goHome} style={bk}>← Главная</button>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 16px" }}>📍 Выбери район</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {DISTRICTS.map((d, i) => { const cnt = places.filter(p=>p.district===d.id).length; return (
              <button key={d.id} onClick={() => { setSelD(d); setScr("district"); }}
                style={{ ...cd, display:"flex", alignItems:"center", gap:14, padding:"16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left", opacity:mt?1:0, transition:`all 0.4s ease ${i*0.04}s` }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
                <div style={{ width:48, height:48, borderRadius:T.rs, background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{d.emoji}</div>
                <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{d.name}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{d.desc}</div></div>
                <div style={{ textAlign:"right" }}><span style={{ fontSize:13, fontWeight:700, color:T.primary }}>{cnt}</span><br/><span style={{ fontSize:10, color:T.light }}>мест</span></div>
              </button>
            ); })}
          </div>
        </div>)}

        {/* DISTRICT → CATEGORIES */}
        {scr==="district" && selD && (<div>
          <button onClick={() => { setScr("places"); setSelD(null); }} style={bk}>← Районы</button>
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 18px" }}>
            <div style={{ width:48, height:48, borderRadius:14, background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{selD.emoji}</div>
            <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selD.name}</h2><p style={{ fontSize:13, color:T.mid, margin:0 }}>{dPlaces.length} мест</p></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {PLACE_CATS.map(c => { const cnt = dPlaces.filter(p=>p.cat===c.id).length; if (!cnt) return null; return (
              <button key={c.id} onClick={() => { setSelPC(c); setScr("places-cat"); }}
                style={{ ...cd, padding:"18px 14px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left" }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
                <div style={{ width:40, height:40, borderRadius:10, background:`${c.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{c.icon}</div>
                <div><div style={{ fontWeight:700, fontSize:14 }}>{c.title}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{cnt} мест</div></div>
              </button>
            ); })}
          </div>
          <button onClick={() => { openAddForm(); }} style={{ ...cd, width:"100%", marginTop:14, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Добавить место</button>
        </div>)}

        {/* ADD PLACE MODAL */}
        {showAdd && selD && (<div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>setShowAdd(false)}>
          <div style={{ ...cd, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
            {!user ? (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🔐</div>
                <button onClick={handleLogin} style={{ ...pl(true), padding:"14px 28px" }}>Войти через Google</button>
                <div style={{ marginTop:10, fontSize:12, color:T.mid, background:T.bg, border:`1px solid ${T.borderL}`, borderRadius:10, padding:"10px 12px", lineHeight:1.45 }}>
                  Вход через Google безопасен: мы не видим ваш пароль Google. Сохраняются только имя, email и аватар для работы аккаунта.
                </div>
              </div>
            ) : (<>
              <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>
                {editingPlace ? "✏️ Редактировать место" : "Новое место"} · {(DISTRICTS.find((d) => d.id === (np.district || selD?.id))?.name || selD.name)}
              </h3>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Название *</label>
              <input
                value={np.name}
                onChange={e=>{
                  const v = e.target.value;
                  setNp({...np,name:v});
                  setAddrValidPlace(false);
                  setAddrOptionsPlace([]);
                }}
                placeholder="Название"
                style={{ ...iS, marginBottom:6 }}
              />
              {nameLoadingPlace && <div style={{ fontSize:12, color:T.mid, marginBottom:8 }}>Ищем места...</div>}
              {!nameLoadingPlace && nameOptionsPlace.length > 0 && (
                <div style={{ marginBottom:10, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", maxHeight:180, overflowY:"auto", background:T.card }}>
                  {nameOptionsPlace.map((opt, i) => (
                    <button
                      key={`${opt.value}-${i}`}
                      onClick={() => {
                        setNp(prev => ({ ...prev, name: opt.placeName || prev.name, address: opt.value }));
                        if (Number.isFinite(opt.lat) && Number.isFinite(opt.lng)) saveGeocodeCache({ name: opt.placeName || np.name, address: opt.value }, { lat: opt.lat, lng: opt.lng });
                        setAddrValidPlace(true);
                        setNameOptionsPlace([]);
                        setAddrOptionsPlace([]);
                      }}
                      style={{ width:"100%", textAlign:"left", padding:"10px 12px", border:"none", borderBottom:i < nameOptionsPlace.length-1 ? `1px solid ${T.borderL}` : "none", background:T.card, cursor:"pointer", fontFamily:"inherit", fontSize:12, color:T.mid }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Категория *</label>
              <select value={np.cat} onChange={e=>setNp({...np,cat:e.target.value})} style={{ ...iS, marginBottom:14, appearance:"none", color:np.cat?T.text:T.light }}>
                <option value="">Выберите</option>{PLACE_CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
              </select>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Район *</label>
              <select
                value={np.district || selD?.id || ""}
                onChange={e=>setNp((prev)=>({ ...prev, district:e.target.value }))}
                style={{ ...iS, marginBottom:14, appearance:"none", color:(np.district || selD?.id)?T.text:T.light }}
              >
                <option value="">Выберите район</option>
                {DISTRICTS.map((d)=><option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Адрес *</label>
              <input value={np.address} onChange={e=>{setNp({...np,address:e.target.value}); setAddrValidPlace(false);}} placeholder="Адрес" style={{ ...iS, marginBottom:6, borderColor:np.address && !addrValidPlace ? "#f5b7b1" : T.border }} />
              {addrLoadingPlace && <div style={{ fontSize:12, color:T.mid, marginBottom:8 }}>Ищем адрес...</div>}
              {!addrLoadingPlace && addrOptionsPlace.length > 0 && !addrValidPlace && (
                <div style={{ marginBottom:10, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", maxHeight:160, overflowY:"auto", background:T.card }}>
                  {addrOptionsPlace.map((opt, i) => (
                    <button key={`${opt.value}-${i}`} onClick={() => { setNp(prev => ({ ...prev, address: opt.value })); if (Number.isFinite(opt.lat) && Number.isFinite(opt.lng)) saveGeocodeCache({ name: np.name, address: opt.value }, { lat: opt.lat, lng: opt.lng }); setAddrValidPlace(true); setAddrOptionsPlace([]); setNameOptionsPlace([]); }} style={{ width:"100%", textAlign:"left", padding:"10px 12px", border:"none", borderBottom:i < addrOptionsPlace.length-1 ? `1px solid ${T.borderL}` : "none", background:T.card, cursor:"pointer", fontFamily:"inherit", fontSize:12, color:T.mid }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
              {np.address && !addrValidPlace && <div style={{ fontSize:12, color:"#E74C3C", marginBottom:10 }}>Выберите адрес из подсказок.</div>}
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Комментарий *</label>
              <textarea value={np.tip} maxLength={CARD_TEXT_MAX} onChange={e=>setNp({...np,tip:e.target.value.slice(0, CARD_TEXT_MAX)})} placeholder="Ваш отзыв, совет, рекомендация..." style={{ ...iS, minHeight:80, resize:"vertical", marginBottom:6 }} />
              <div style={{ fontSize:11, color:T.light, marginBottom:12, textAlign:"right" }}>{np.tip.length}/{CARD_TEXT_MAX}</div>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display:"none" }} />
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
                {nPhotos.map((p,i) => (<div key={i} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>{p.preview ? <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /> : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", background:T.bg, fontSize:10, color:T.mid, padding:4 }}>📷</div>}<button onClick={()=>setNPhotos(pr=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>✕</button></div>))}
                {nPhotos.length<5 && <button onClick={()=>fileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>＋ Фото</button>}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>{setShowAdd(false);setNPhotos([])}} style={{ ...pl(false), flex:1, padding:14 }}>Отмена</button>
                {editingPlace && <button onClick={()=>handleDeletePlace(editingPlace.id)} style={{ ...pl(false), flex:1, padding:14, border:"1.5px solid #fecaca", color:"#E74C3C", background:"#FFF5F5" }}>Удалить</button>}
                <button onClick={handleAddPlace} disabled={!np.name||!np.cat||!np.tip||uploading} style={{ ...pl(true), flex:2, padding:14, opacity:(!np.name||!np.cat||!np.tip||uploading)?0.5:1 }}>{uploading ? '⏳ Загрузка...' : editingPlace ? 'Сохранить' : 'Опубликовать'}</button>
              </div>
            </>)}
          </div>
        </div>)}

        {/* PLACES IN CATEGORY */}
        {scr==="places-cat" && selPC && selD && (<div>
          <button onClick={() => { setScr("district"); setSelPC(null); setSelPlace(null); }} style={bk}>← {selD.name}</button>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, margin:"4px 0 12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${selPC.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{selPC.icon}</div>
              <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selPC.title}</h2><p style={{ fontSize:13, color:T.mid, margin:0 }}>{selD.name} · {cPlaces.length} мест</p></div>
            </div>
            <button
              onClick={() => { openAddForm(); }}
              style={{ width:38, height:38, borderRadius:12, border:`1.5px solid ${T.primary}55`, background:T.primaryLight, color:T.primary, fontSize:28, lineHeight:1, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 }}
              title="Добавить"
            >
              +
            </button>
          </div>
          {cPlaces.length > 0 && (
            <div style={{ ...cd, padding:0, overflow:"hidden", marginBottom:12 }}>
              <div style={{ padding:"8px 12px", borderBottom:`1px solid ${T.borderL}`, display:"flex", justifyContent:"flex-end", alignItems:"center" }}>
                <button onClick={() => openAllOnMap(cPlacesDisplay)} style={{ ...pl(false), padding:"6px 10px", fontSize:12 }}>⤢ Открыть карту</button>
              </div>
              <div style={{ position:"relative", height:220, background:"#ECEFF3" }}>
                {miniMapLoading && <div style={{ position:"absolute", inset:0, zIndex:2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:T.mid, background:"rgba(255,255,255,0.75)" }}>Загружаем мини-карту...</div>}
                {!miniMapLoading && miniMapError && <div style={{ position:"absolute", inset:0, zIndex:2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#C0392B", padding:12, textAlign:"center" }}>{miniMapError}</div>}
                {!miniMapLoading && !miniMapError && miniMapPlaces.length === 0 && <div style={{ position:"absolute", inset:0, zIndex:2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:T.mid, padding:12, textAlign:"center" }}>Для этой категории пока нет точек с координатами.</div>}
                <div ref={miniMapContainerRef} style={{ width:"100%", height:"100%" }} />
              </div>
              {miniSelectedPlace && (
                <div style={{ padding:"8px 12px", borderTop:`1px solid ${T.borderL}`, display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, fontSize:12 }}>
                  <span style={{ color:T.text, fontWeight:600 }}>{miniSelectedPlace.name}</span>
                  <span style={{ color:T.mid }}>
                    {miniRouteLoading ? "Считаем маршрут..." : miniRouteInfo ? `На машине: ${miniRouteInfo.duration} · ${miniRouteInfo.distance}` : "Маршрут недоступен"}
                  </span>
                </div>
              )}
            </div>
          )}

          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10, gap:8 }}>
            <button
              onClick={() => {
                if (placeSortField === "likes") setPlaceSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else { setPlaceSortField("likes"); setPlaceSortDir("desc"); }
              }}
              style={{ border:"none", cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:4, padding:"4px 8px", borderRadius:999, background:"#FFF1F1", color:"#C0392B", fontWeight:700, fontSize:12, lineHeight:1 }}
              title="Сортировать по лайкам"
            >
              <HeartIcon active={true} size={13} /> {placeSortField === "likes" ? (placeSortDir === "asc" ? "↑" : "↓") : "↕"}
            </button>
            <button
              onClick={() => {
                if (placeSortField === "favorites") setPlaceSortDir((d) => (d === "asc" ? "desc" : "asc"));
                else { setPlaceSortField("favorites"); setPlaceSortDir("desc"); }
              }}
              style={{ border:"none", cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:4, padding:"4px 8px", borderRadius:999, background:"#FFF8E8", color:"#D68910", fontWeight:700, fontSize:12, lineHeight:1 }}
              title="Сортировать по избранному"
            >
              <StarIcon active={true} size={13} /> {placeSortField === "favorites" ? (placeSortDir === "asc" ? "↑" : "↓") : "↕"}
            </button>
          </div>

          {cPlacesDisplay.map((p, idx) => (
            <button key={p.id} onClick={() => { setSelPlace(p); setScr("place-item"); }} style={{ ...cd, width:"100%", overflow:"hidden", marginBottom:12, cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left", borderColor:T.borderL }}>
              <div style={{ padding:16 }}>
                <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:16, display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ color:"#D7261E", fontWeight:800 }}>{idx + 1}</span>
                      <span>{p.name}</span>
                    </div>
                    <button onClick={(e)=>{ e.stopPropagation(); openAddressInMaps(p.address || selD.name); }} style={{ background:"none", border:"none", padding:0, marginTop:3, color:T.mid, fontSize:12, cursor:"pointer", fontFamily:"inherit", textDecoration:"underline", textAlign:"left" }}>
                      {formatPlaceAddressLabel(p.address || selD.name)}
                    </button>
                  </div>
                  <div style={{ minWidth:118, display:"flex", justifyContent:"flex-end", gap:6 }}>
                    <button onClick={(e)=>{ e.stopPropagation(); toggleFavorite(p.id,"place"); }} style={{ border:"none", background:favorites[`place-${p.id}`] ? "#FFF8E8" : "#F7F7F8", color:favorites[`place-${p.id}`] ? "#D68910" : T.mid, borderRadius:999, padding:"5px 9px", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:12, lineHeight:1, display:"inline-flex", alignItems:"center", justifyContent:"center" }} title="Избранное"><StarIcon active={!!favorites[`place-${p.id}`]} size={15} /></button>
                    <button
                      onClick={(e)=>{ e.stopPropagation(); handleToggleLike(p.id,"place"); }}
                      style={{ border:"none", background:liked[`place-${p.id}`] ? "#FFF1F1" : T.bg, color:liked[`place-${p.id}`] ? "#C0392B" : T.mid, borderRadius:999, padding:"5px 9px", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:12, lineHeight:1, display:"inline-flex", alignItems:"center", gap:4 }}
                      title="Нравится"
                    >
                      <HeartIcon active={!!liked[`place-${p.id}`]} size={15} /> {p.likes || 0}
                    </button>
                  </div>
                </div>
                <div style={{ marginTop:12, padding:12, background:T.bg, borderRadius:10, borderLeft:`3px solid ${selPC.color}` }}><div style={{ ...twoLineClampStyle, fontSize:13, color:T.mid }}>{limitCardText(p.tip)}</div></div>
                {Array.isArray(p.photos) && p.photos.length > 0 && (
                  <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:6 }}>
                    {p.photos.slice(0, 3).map((ph, pi) => (
                      <img
                        key={pi}
                        src={ph}
                        alt=""
                        style={{ width:"100%", height:105, objectFit:"cover", borderRadius:10, border:`1px solid ${T.borderL}`, display:"block" }}
                      />
                    ))}
                  </div>
                )}
                <div style={{ marginTop:10, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                  <span style={{ fontSize:11, color:T.light }}>от {p.addedBy}</span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, color:T.mid, fontWeight:700, fontSize:12, lineHeight:1 }}>
                    <ViewIcon size={13} /> {p.views || 0}
                  </span>
                </div>
              </div>
            </button>
          ))}
          <button onClick={() => { openAddForm(); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Добавить</button>
        </div>)}

        {/* PLACE ITEM PAGE */}
        {scr==="place-item" && activePlace && selPC && selD && (<div>
          <button onClick={() => { setScr("places-cat"); setExp(null); }} style={bk}>← {selPC.title}</button>
          <div style={{ ...cd, overflow:"hidden", borderColor:T.borderL }}>
            <div style={{ padding:16 }}>
              <div style={{ display:"flex", gap:14, marginBottom:12, alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:20, lineHeight:1.2 }}>{activePlace.name}</div>
                  <button onClick={() => openAddressInMaps(activePlace.address || selD.name)} style={{ background:"none", border:"none", padding:0, marginTop:5, color:T.mid, fontSize:13, cursor:"pointer", fontFamily:"inherit", textDecoration:"underline", textAlign:"left" }}>
                    {formatPlaceAddressLabel(activePlace.address || selD.name)}
                  </button>
                  <div style={{ marginTop:5, fontSize:12, color:T.light }}>от {activePlace.addedBy}</div>
                </div>
                <div style={{ minWidth:118, display:"flex", justifyContent:"flex-end", gap:6 }}>
                  <button onClick={() => toggleFavorite(activePlace.id,"place")} style={{ border:"none", background:favorites[`place-${activePlace.id}`] ? "#FFF8E8" : "#F7F7F8", color:favorites[`place-${activePlace.id}`] ? "#D68910" : T.mid, borderRadius:999, padding:"5px 9px", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:12, lineHeight:1, display:"inline-flex", alignItems:"center", justifyContent:"center" }} title="Избранное"><StarIcon active={!!favorites[`place-${activePlace.id}`]} size={15} /></button>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 8px", borderRadius:999, background:T.bg, color:T.mid, fontWeight:700, fontSize:12, lineHeight:1 }}><ViewIcon size={13} /> {activePlace.views || 0}</span>
                  <button
                    onClick={() => handleToggleLike(activePlace.id,"place")}
                    style={{ border:"none", borderRadius:999, padding:"5px 9px", background:liked[`place-${activePlace.id}`] ? "#FFF1F1" : T.bg, color:liked[`place-${activePlace.id}`] ? "#C0392B" : T.mid, fontWeight:700, fontSize:12, lineHeight:1, display:"inline-flex", alignItems:"center", gap:4, cursor:"pointer", fontFamily:"inherit" }}
                    title="Нравится"
                  >
                    <HeartIcon active={!!liked[`place-${activePlace.id}`]} size={15} /> {activePlace.likes || 0}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom:12, padding:12, background:T.bg, borderRadius:10, borderLeft:`3px solid ${selPC.color}` }}><div style={{ fontSize:14, color:T.mid, lineHeight:1.6, whiteSpace:"pre-wrap", overflowWrap:"anywhere", wordBreak:"break-word" }}>{limitCardText(activePlace.tip)}</div></div>

              {activePlace.photos?.length > 0 && (
                <div style={{ display:"flex", gap:8, overflowX:"auto", marginBottom:10, paddingBottom:4, scrollSnapType:"x mandatory" }}>
                  {activePlace.photos.map((ph, pi) => (
                    <img key={pi} src={ph} alt="" style={{ width:120, height:120, objectFit:"cover", borderRadius:12, border:`1px solid ${T.border}`, cursor:"zoom-in", flexShrink:0, scrollSnapAlign:"start" }} onClick={() => openPhotoViewer(activePlace.photos, pi)} />
                  ))}
                </div>
              )}
              {activePlace.photos?.length > 1 && <div style={{ fontSize:11, color:T.light, marginBottom:10 }}>Листайте фото →</div>}

              <div style={{ padding:"8px 0 10px", display:"flex", gap:14, alignItems:"center" }}>
                <button onClick={() => toggleFavorite(activePlace.id,"place")} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:favorites[`place-${activePlace.id}`] ? "#D68910" : T.mid, padding:0 }} title="Избранное"><StarIcon active={!!favorites[`place-${activePlace.id}`]} size={18} /></button>
                <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:14, color:T.mid }}><ViewIcon size={15} /> {activePlace.views || 0}</span>
                <button onClick={()=> handleNativeShare({title:activePlace.name,text:activePlace.tip,url:window.location.href})} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:18, color:T.mid, padding:0 }} title="Поделиться">➤</button>
              </div>

              {renderComments(activePlace, "place", addPlaceComment)}

              {user && (user.id === activePlace.userId || user.name === activePlace.addedBy) && (
                <div style={{ paddingTop:4, display:"flex", gap:8 }}>
                  <button onClick={()=>startEditPlace(activePlace)} style={{ flex:1, padding:"10px 0", borderRadius:24, border:`1.5px solid ${T.border}`, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:4, fontSize:12, fontWeight:600, background:T.card, color:T.mid }}>✏️ Редактировать</button>
                </div>
              )}
            </div>
          </div>
        </div>)}

        {/* TIPS */}
        {scr==="tips" && !selTC && (<div>
          <button onClick={goHome} style={bk}>← Главная</button>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 4px" }}>💡 Советы по жизни в LA</h2>
          <p style={{ fontSize:13, color:T.mid, margin:"0 0 16px" }}>Опыт от своих — лайфхаки, чаевые, банки, врачи</p>
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            <input
              value={tipsSearchInput}
              onChange={(e)=>setTipsSearchInput(e.target.value)}
              placeholder="Поиск по советам"
              style={{ ...iS, flex:1, marginBottom:0 }}
            />
            <button onClick={applyTipsSearch} style={{ ...pl(false), minWidth:44, padding:"0 12px", fontSize:16 }}>🔍</button>
          </div>
          {tipsQuery ? (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {tipsSearchResults.length === 0 && (
                <div style={{ ...cd, padding:16, fontSize:13, color:T.mid }}>Ничего не найдено по запросу: “{tipsSearchApplied}”</div>
              )}
              {tipsSearchResults.map((tip) => {
                const isE = expTip === tip.id;
                const isL = liked[`tip-${tip.id}`];
                const isF = favorites[`tip-${tip.id}`];
                const catTitle = TIPS_CATS.find((c) => c.id === tip.cat)?.title || "";
                return (
                  <div key={tip.id} style={{ ...cd, marginBottom:0, overflow:"hidden", borderColor:isE?T.primary+"40":T.borderL }}>
                    <div onClick={() => { const nextOpen = !isE; setExpTip(nextOpen ? tip.id : null); if (nextOpen) trackCardView("tip", tip); }} style={{ padding:16, cursor:"pointer", background:isE ? T.bg : T.card }}>
                      <div style={{ fontSize:11, color:T.light, marginBottom:4 }}>{catTitle}</div>
                      <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>{tip.title}</div>
                      <div style={{ ...(!isE ? twoLineClampStyle : {}), fontSize:13, lineHeight:1.6, color:T.mid, whiteSpace:isE ? "pre-wrap" : "normal", overflowWrap:"anywhere", wordBreak:"break-word" }}>{limitCardText(tip.text)}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
                        <span style={{ fontSize:11, color:T.light }}>от {tip.author}</span>
                        <div style={{ display:"flex", gap:10, fontSize:12, color:T.mid, alignItems:"center" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(tip.id,"tip"); }}
                            style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", color:isF ? "#D68910" : T.light, padding:0, fontSize:14, lineHeight:1 }}
                            title="Избранное"
                          >
                            <StarIcon active={!!isF} size={14} />
                          </button>
                          <span>👁 {tip.views || 0}</span>
                          <span style={{ display:"inline-flex", alignItems:"center", gap:4, color:isL?"#E74C3C":T.mid }}><HeartIcon active={!!isL} size={14} /> {tip.likes||0}</span>
                          <span>💬 {(tip.comments||[]).length}</span>
                          <span style={{ color:isE?T.primary:T.light, transform:isE?"rotate(180deg)":"", transition:"0.3s" }}>▼</span>
                        </div>
                      </div>
                    </div>
                    {isE && (<div style={{ borderTop:`1px solid ${T.borderL}` }}>
                      <div style={{ padding:"14px 16px 10px", display:"flex", gap:14, alignItems:"center" }}>
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(tip.id,"tip"); }} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:isF?"#D68910":T.mid, padding:0 }} title="Избранное"><StarIcon active={!!isF} size={18} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleToggleLike(tip.id,"tip"); }} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:isL?"#E74C3C":T.mid, padding:0 }} title="Нравится"><HeartIcon active={!!isL} /> <span style={{ fontSize:14 }}>{tip.likes||0}</span></button>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:14, color:T.mid }}>👁 {tip.views || 0}</span>
                        <button onClick={(e)=>{e.stopPropagation(); setShowComments(`tip-${tip.id}`);}} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:T.mid, padding:0 }} title="Комментарии">◌ <span style={{ fontSize:14 }}>{(tip.comments||[]).length}</span></button>
                        <button onClick={(e)=>{e.stopPropagation(); handleNativeShare({ title:tip.title, text:tip.text, url:window.location.href });}} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:18, color:T.mid, padding:0 }} title="Поделиться">↤</button>
                      </div>
                      {renderComments(tip, "tip", handleAddComment)}
                    </div>)}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {TIPS_CATS.map((c, i) => { const cnt = tips.filter(t=>t.cat===c.id).length; return (
                <button key={c.id} onClick={() => { setSelTC(c); }}
                  style={{ ...cd, display:"flex", alignItems:"center", gap:14, padding:"16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left" }}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
                  <div style={{ width:48, height:48, borderRadius:T.rs, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{c.icon}</div>
                  <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{c.title}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{c.desc}</div></div>
                  {cnt > 0 && <span style={{ fontSize:13, fontWeight:700, color:T.primary }}>{cnt}</span>}
                </button>
              ); })}
            </div>
          )}
        </div>)}

        {/* TIPS CATEGORY */}
        {scr==="tips" && selTC && (<div>
          <button onClick={() => setSelTC(null)} style={bk}>← Все советы</button>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, margin:"4px 0 18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{selTC.icon}</div>
              <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selTC.title}</h2><p style={{ fontSize:13, color:T.mid, margin:0 }}>{selTC.desc}</p></div>
            </div>
            <button
              onClick={() => { if (!user) {handleLogin();return;} setEditingTip(null); setNewTip({ title:"", text:"" }); setNewTipPhotos([]); setShowAddTip(true); }}
              style={{ width:38, height:38, borderRadius:12, border:`1.5px solid ${T.primary}55`, background:T.primaryLight, color:T.primary, fontSize:28, lineHeight:1, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 }}
              title="Добавить"
            >
              +
            </button>
          </div>
          {catTips.map((tip, i) => { const isE = expTip===tip.id; const isL = liked[`tip-${tip.id}`]; const isF = favorites[`tip-${tip.id}`]; return (
            <div key={tip.id} style={{ ...cd, marginBottom:12, overflow:"hidden", borderColor:isE?T.primary+"40":T.borderL }}>
              <div onClick={() => { const nextOpen = !isE; setExpTip(nextOpen ? tip.id : null); if (nextOpen) trackCardView("tip", tip); }} style={{ padding:16, cursor:"pointer", background:isE ? T.bg : T.card }}>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>{tip.title}</div>
                <div style={{ ...(!isE ? twoLineClampStyle : {}), fontSize:13, lineHeight:1.6, color:T.mid, whiteSpace:isE ? "pre-wrap" : "normal", overflowWrap:"anywhere", wordBreak:"break-word" }}>{limitCardText(tip.text)}</div>
                {isE && tip.photos?.length > 0 && (
                  <div style={{ display:"flex", gap:8, overflowX:"auto", marginTop:10, paddingBottom:4, scrollSnapType:"x mandatory" }}>
                    {tip.photos.map((ph, pi) => (
                      <img key={pi} src={ph} alt="" style={{ width:86, height:86, objectFit:"cover", borderRadius:10, border:`1px solid ${T.border}`, cursor:"zoom-in", flexShrink:0, scrollSnapAlign:"start" }} onClick={(e)=>{e.stopPropagation(); openPhotoViewer(tip.photos, pi);}} />
                    ))}
                  </div>
                )}
                {isE && tip.photos?.length > 1 && <div style={{ fontSize:11, color:T.light, marginTop:2 }}>Листайте фото →</div>}
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
                  <span style={{ fontSize:11, color:T.light }}>от {tip.author}</span>
                  <div style={{ display:"flex", gap:10, fontSize:12, color:T.mid, alignItems:"center" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(tip.id,"tip"); }}
                      style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", color:isF ? "#D68910" : T.light, padding:0, fontSize:14, lineHeight:1 }}
                      title="Избранное"
                    >
                      <StarIcon active={!!isF} size={14} />
                    </button>
                    <span>👁 {tip.views || 0}</span>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:4, color:isL?"#E74C3C":T.mid }}><HeartIcon active={!!isL} size={14} /> {tip.likes||0}</span>
                    <span>💬 {tip.comments.length}</span>
                    <span style={{ color:isE?T.primary:T.light, transform:isE?"rotate(180deg)":"", transition:"0.3s" }}>▼</span>
                  </div>
                </div>
              </div>
              {isE && (<div style={{ borderTop:`1px solid ${T.borderL}` }}>
                <div style={{ padding:"16px 16px 0", display:"none" }}>
                  <button onClick={(e) => { e.stopPropagation(); handleToggleLike(tip.id,"tip"); }} style={{ ...pl(isL), marginBottom:8, fontSize:12, display:"inline-flex", alignItems:"center", gap:6 }}>{isL ? <HeartIcon active={true} size={14} /> : <HeartIcon active={false} size={14} />} {isL ? "Понравилось" : "Нравится"}</button>
                </div>
                <div style={{ padding:"14px 16px 10px", display:"flex", gap:14, alignItems:"center" }}>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(tip.id,"tip"); }} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:isF?"#D68910":T.mid, padding:0 }} title="Избранное"><StarIcon active={!!isF} size={18} /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleToggleLike(tip.id,"tip"); }} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:isL?"#E74C3C":T.mid, padding:0 }} title="Нравится"><HeartIcon active={!!isL} /> <span style={{ fontSize:14 }}>{tip.likes||0}</span></button>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:14, color:T.mid }}>👁 {tip.views || 0}</span>
                  <button onClick={(e)=>{e.stopPropagation(); setShowComments(`tip-${tip.id}`);}} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:T.mid, padding:0 }} title="Комментарии">◌ <span style={{ fontSize:14 }}>{(tip.comments||[]).length}</span></button>
                  <button onClick={(e)=>{e.stopPropagation(); handleNativeShare({ title:tip.title, text:tip.text, url:window.location.href });}} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:18, color:T.mid, padding:0 }} title="Поделиться">➤</button>
                </div>
                {renderComments(tip, "tip", handleAddComment)}
                {user && (user.id === tip.userId || user.name === tip.author) && (
                  <div style={{ padding:"0 16px 16px", display:"flex", gap:8 }}>
                    <button onClick={(e)=>{e.stopPropagation(); startEditTip(tip);}} style={{ ...pl(false), flex:1, padding:10, fontSize:12 }}>✏️ Редактировать</button>
                    <button onClick={(e)=>{e.stopPropagation(); handleDeleteTip(tip.id);}} style={{ ...pl(false), flex:1, padding:10, fontSize:12, border:"1.5px solid #fecaca", color:"#E74C3C", background:"#FFF5F5" }}>🗑 Удалить</button>
                  </div>
                )}
              </div>)}
            </div>
          ); })}
          <button onClick={() => { if (!user) {handleLogin();return;} setEditingTip(null); setNewTip({ title:"", text:"" }); setNewTipPhotos([]); setShowAddTip(true); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Поделиться опытом</button>
        </div>)}

        {/* ADD TIP MODAL */}
        {showAddTip && selTC && (<div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>{setShowAddTip(false); setNewTipPhotos([]); setEditingTip(null);}}>
          <div style={{ ...cd, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
            <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>{selTC.icon} {editingTip ? "Редактировать совет" : "Новый совет"} · {selTC.title}</h3>
            <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Заголовок *</label>
            <input value={newTip.title} onChange={e=>setNewTip({...newTip,title:e.target.value})} placeholder="О чём совет?" style={{ ...iS, marginBottom:14 }} />
            <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Текст *</label>
            <textarea value={newTip.text} maxLength={CARD_TEXT_MAX} onChange={e=>setNewTip({...newTip,text:e.target.value.slice(0, CARD_TEXT_MAX)})} placeholder="Поделитесь опытом..." style={{ ...iS, minHeight:120, resize:"vertical", marginBottom:6 }} />
            <div style={{ fontSize:11, color:T.light, marginBottom:14, textAlign:"right" }}>{newTip.text.length}/{CARD_TEXT_MAX}</div>
            <input ref={tipFileRef} type="file" accept="image/*" multiple onChange={handleTipPhotos} style={{ display:"none" }} />
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
              {newTipPhotos.map((p,i) => (
                <div key={i} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>
                  <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  <button onClick={()=>setNewTipPhotos(pr=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>✕</button>
                </div>
              ))}
              {newTipPhotos.length < 3 && <button onClick={()=>tipFileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>＋ Фото (до 3)</button>}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{setShowAddTip(false); setNewTipPhotos([]); setEditingTip(null);}} style={{ ...pl(false), flex:1, padding:14 }}>Отмена</button>
              {editingTip && <button onClick={()=>handleDeleteTip(editingTip.id)} style={{ ...pl(false), flex:1, padding:14, border:"1.5px solid #fecaca", color:"#E74C3C", background:"#FFF5F5" }}>Удалить</button>}
              <button onClick={handleAddTip} disabled={!newTip.title||!newTip.text} style={{ ...pl(true), flex:2, padding:14, opacity:(!newTip.title||!newTip.text)?0.5:1 }}>{editingTip ? "Сохранить" : "Опубликовать"}</button>
            </div>
          </div>
        </div>)}

        {/* EVENTS */}
        {scr==="events" && !selEC && (<div>
          <button onClick={goHome} style={bk}>← Главная</button>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 4px" }}>🎉 События и мероприятия</h2>
          <p style={{ fontSize:13, color:T.mid, margin:"0 0 16px" }}>Концерты, праздники, встречи комьюнити</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {EVENT_CATS.map((c, i) => { const cnt = events.filter(e=>e.cat===c.id).length; return (
              <button key={c.id} onClick={() => setSelEC(c)}
                style={{ ...cd, display:"flex", alignItems:"center", gap:14, padding:"16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left" }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
                <div style={{ width:48, height:48, borderRadius:T.rs, background:`${c.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{c.icon}</div>
                <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{c.title}</div></div>
                {cnt>0 && <span style={{ fontSize:13, fontWeight:700, color:T.primary }}>{cnt}</span>}
              </button>
            ); })}
          </div>
        </div>)}

        {scr==="events" && selEC && (<div>
          <button onClick={() => { setSelEC(null); setFilterDate(null); }} style={bk}>← Все события</button>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, margin:"4px 0 12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:`${selEC.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{selEC.icon}</div>
              <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selEC.title}</h2></div>
            </div>
            <button
              onClick={() => { if (!user) {handleLogin();return;} setEditingEvent(null); setNewEvent({ title:"", date:"", location:"", desc:"", website:"", cat:selEC?.id||"" }); setNewEventPhotos([]); setAddrValidEvent(false); setAddrOptionsEvent([]); setShowAddEvent(true); }}
              style={{ width:38, height:38, borderRadius:12, border:`1.5px solid ${T.primary}55`, background:T.primaryLight, color:T.primary, fontSize:28, lineHeight:1, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 }}
              title="Добавить"
            >
              +
            </button>
          </div>
          {/* Date filter bar */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(9, minmax(0, 1fr))", gap:6, alignItems:"stretch" }}>
              <button onClick={() => setFilterDate(null)}
                style={{ padding:"6px 6px", borderRadius:12, border:`1.5px solid ${!filterDate?T.primary:T.border}`, background:!filterDate?T.primary:T.card, color:!filterDate?"#fff":T.mid, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", minWidth:0 }}>
                Все
              </button>
              {Array.from({length:7}, (_,i) => {
                const d = new Date(); d.setDate(d.getDate()+i);
                const dayNames = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];
                const isActive = filterDate && new Date(filterDate).toDateString() === d.toDateString();
                const isToday = i === 0;
                const isTodayAccent = isToday && !isActive;
                return (
                  <button key={i} onClick={() => setFilterDate(isActive ? null : d.toISOString())}
                    style={{ padding:"5px 4px", borderRadius:12, border:`1.5px solid ${isActive?T.primary:(isTodayAccent?"#E74C3C":T.border)}`, background:isActive?T.primary:(isTodayAccent?"#FFF5F5":T.card), color:isActive?"#fff":(isTodayAccent?"#C0392B":T.text), fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", minWidth:0, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:2, justifyContent:"center" }}>
                    <span style={{ fontSize:9, color:isActive?"#fff":(isTodayAccent?"#C0392B":T.light), fontWeight:400, lineHeight:1 }}>{isToday?"Сег":dayNames[d.getDay()]}</span>
                    <span style={{ fontSize:14, fontWeight:700, lineHeight:1 }}>{d.getDate()}</span>
                  </button>
                );
              })}
              {/* Calendar picker — always visible */}
              <div style={{ position:"relative", minWidth:0 }}>
                <button
                  style={{ padding:"5px 4px", borderRadius:12, border:`1.5px solid ${T.border}`, background:T.card, color:T.mid, fontSize:15, cursor:"pointer", fontFamily:"inherit", width:"100%", height:"100%", minHeight:42, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <CalendarIcon size={16} />
                </button>
                <input
                  ref={datePickerRef}
                  type="date"
                  onChange={(e)=>{ if (e.target.value) setFilterDate(e.target.value+"T00:00"); }}
                  style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", WebkitAppearance:"none", appearance:"none" }}
                />
              </div>
            </div>
            {filterDate && (
              <div style={{ fontSize:12, color:T.mid, marginTop:6, display:"flex", alignItems:"center", gap:6 }}>
                <CalendarIcon size={14} /> {fmtDate(filterDate).split(",").slice(0,2).join(",")}
                <button onClick={() => setFilterDate(null)} style={{ background:"none", border:"none", color:T.primary, cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:600, padding:0 }}>✕ сбросить</button>
              </div>
            )}
          </div>
          {catEvents.map((ev, i) => { const isEvExp = exp === `ev-${ev.id}`; const isF = favorites[`event-${ev.id}`]; const eventWebsite = normalizeExternalUrl(ev.website); return (<div key={ev.id} style={{ ...cd, marginBottom:12, overflow:"hidden", borderColor:isEvExp?T.primary+"40":T.borderL }}>
            <div onClick={() => { const nextOpen = !isEvExp; setExp(nextOpen ? `ev-${ev.id}` : null); if (nextOpen) trackCardView("event", ev); }} style={{ padding:18, cursor:"pointer" }} onMouseEnter={e=>{e.currentTarget.style.background=T.bg}} onMouseLeave={e=>{e.currentTarget.style.background=T.card}}>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>{ev.title}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:10 }}>
                <div style={{ fontSize:13, color:T.mid, display:"inline-flex", alignItems:"center", gap:5 }}><CalendarIcon size={13} /> {fmtDate(ev.date)}</div>
                {ev.location && <div style={{ fontSize:13, color:T.mid }}>📍 {ev.location}</div>}
              </div>
              {isEvExp && ev.location && (
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <button onClick={(e)=>{e.stopPropagation(); openEventMap(ev.location, "google");}} style={{ ...pl(false), padding:"8px 10px", fontSize:12 }}>Google Maps</button>
                  <button onClick={(e)=>{e.stopPropagation(); openEventMap(ev.location, "apple");}} style={{ ...pl(false), padding:"8px 10px", fontSize:12 }}>Apple Maps</button>
                </div>
              )}
              {isEvExp && eventWebsite && (
                <a href={eventWebsite} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} style={{ display:"inline-block", fontSize:13, color:T.primary, textDecoration:"none", marginBottom:10 }}>
                  Сайт мероприятия
                </a>
              )}
              <div style={{ ...(!isEvExp ? twoLineClampStyle : {}), fontSize:13, lineHeight:1.6, color:T.mid, marginBottom:10, whiteSpace:isEvExp ? "pre-wrap" : "normal", overflowWrap:"anywhere", wordBreak:"break-word" }}>{limitCardText(ev.desc)}</div>
              {isEvExp && ev.photos?.length > 0 && (
                <div style={{ display:"flex", gap:8, overflowX:"auto", marginBottom:10, paddingBottom:4, scrollSnapType:"x mandatory" }}>
                  {ev.photos.map((ph, pi) => (
                    <img key={pi} src={ph} alt="" style={{ width:86, height:86, objectFit:"cover", borderRadius:10, border:`1px solid ${T.border}`, cursor:"zoom-in", flexShrink:0, scrollSnapAlign:"start" }} onClick={(e)=>{e.stopPropagation(); openPhotoViewer(ev.photos, pi);}} />
                  ))}
                </div>
              )}
              {isEvExp && ev.photos?.length > 1 && <div style={{ fontSize:11, color:T.light, marginTop:-6, marginBottom:8 }}>Листайте фото →</div>}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11, color:T.light }}>от {ev.author}</span>
                <div style={{ display:"flex", gap:10, fontSize:12, color:T.mid, alignItems:"center" }}>
                  <button
                    onClick={(e)=>{e.stopPropagation(); toggleFavorite(ev.id,"event");}}
                    style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", color:isF ? "#D68910" : T.light, padding:0, fontSize:14, lineHeight:1 }}
                    title="Избранное"
                  >
                    <StarIcon active={!!isF} size={14} />
                  </button>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
                    <ViewIcon size={13} /> {ev.views || 0}
                  </span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, color:liked[`event-${ev.id}`]?"#E74C3C":T.mid }}><HeartIcon active={!!liked[`event-${ev.id}`]} size={14} /> {ev.likes}</span>
                  <span style={{ fontSize:10, color:isEvExp?T.primary:T.light, transform:isEvExp?"rotate(180deg)":"", transition:"0.3s" }}>▼</span>
                </div>
              </div>
            </div>
            {isEvExp && (<div style={{ borderTop:`1px solid ${T.borderL}` }}>
              <div style={{ padding:"14px 16px 10px", display:"flex", justifyContent:"flex-end", alignItems:"center" }}>
                <button onClick={(e)=>{e.stopPropagation(); handleNativeShare({ title:ev.title, text:ev.desc, url:window.location.href });}} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:18, color:T.mid, padding:0 }} title="Поделиться">➤</button>
              </div>
              {renderComments(ev, "event", addEventComment)}
              {user && (user.id === ev.userId || user.name === ev.author) && (
                <div style={{ padding:"0 16px 16px" }}>
                  <button onClick={(e)=>{e.stopPropagation(); startEditEvent(ev);}} style={{ width:"100%", padding:"10px 0", borderRadius:24, border:`1.5px solid ${T.primary}55`, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:600, background:T.primaryLight, color:T.primary }}>Редактировать событие</button>
                </div>
              )}
            </div>)}
          </div>); })}
          {catEvents.length===0 && <p style={{ fontSize:13, color:T.mid, textAlign:"center", padding:20 }}>Пока нет событий в этой категории</p>}
          <button onClick={() => { if (!user) {handleLogin();return;} setEditingEvent(null); setNewEvent({ title:"", date:"", location:"", desc:"", website:"", cat:selEC?.id||"" }); setNewEventPhotos([]); setAddrValidEvent(false); setAddrOptionsEvent([]); setShowAddEvent(true); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Добавить событие</button>
        </div>)}

        {/* ADD EVENT MODAL */}
        {showAddEvent && (<div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center", touchAction:"none" }} onClick={()=>{setShowAddEvent(false); setNewEventPhotos([]); setAddrOptionsEvent([]); setAddrValidEvent(false); setEditingEvent(null);}}>
          <div style={{ ...cd, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto", overscrollBehavior:"contain", touchAction:"pan-y", WebkitOverflowScrolling:"touch" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
            {!user ? (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🔐</div>
                <button onClick={handleLogin} style={{ ...pl(true), padding:"14px 28px" }}>Войти через Google</button>
                <div style={{ marginTop:10, fontSize:12, color:T.mid, background:T.bg, border:`1px solid ${T.borderL}`, borderRadius:10, padding:"10px 12px", lineHeight:1.45 }}>
                  Вход через Google безопасен: мы не видим ваш пароль Google. Сохраняются только имя, email и аватар для работы аккаунта.
                </div>
              </div>
            ) : (<>
              <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>{editingEvent ? "✏️ Редактировать событие" : "🎉 Новое событие"}</h3>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Название *</label>
              <input value={newEvent.title} onChange={e=>setNewEvent({...newEvent,title:e.target.value})} placeholder="Что за мероприятие?" style={{ ...iS, marginBottom:14 }} />
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Категория *</label>
              <select value={newEvent.cat} onChange={e=>setNewEvent({...newEvent,cat:e.target.value})} style={{ ...iS, marginBottom:14, appearance:"none", color:newEvent.cat?T.text:T.light }}>
                <option value="">Выберите</option>{EVENT_CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
              </select>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Дата и время *</label>
              <input type="datetime-local" value={newEvent.date} onChange={e=>setNewEvent({...newEvent,date:e.target.value})} style={{ ...iS, marginBottom:14 }} />
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Место</label>
              <input value={newEvent.location} onChange={e=>{setNewEvent({...newEvent,location:e.target.value}); setAddrValidEvent(false);}} placeholder="Адрес или название места" style={{ ...iS, marginBottom:6, borderColor:newEvent.location && !addrValidEvent ? "#f5b7b1" : T.border }} />
              {addrLoadingEvent && <div style={{ fontSize:12, color:T.mid, marginBottom:8 }}>Ищем место...</div>}
              {!addrLoadingEvent && addrOptionsEvent.length > 0 && !addrValidEvent && (
                <div style={{ marginBottom:10, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", maxHeight:160, overflowY:"auto", background:T.card }}>
                  {addrOptionsEvent.map((opt, i) => (
                    <button key={`${opt.value}-${i}`} onClick={() => { setNewEvent(prev => ({ ...prev, location: opt.value })); if (Number.isFinite(opt.lat) && Number.isFinite(opt.lng)) saveGeocodeCache({ name: newEvent.title, address: opt.value }, { lat: opt.lat, lng: opt.lng }); setAddrValidEvent(true); setAddrOptionsEvent([]); }} style={{ width:"100%", textAlign:"left", padding:"10px 12px", border:"none", borderBottom:i < addrOptionsEvent.length-1 ? `1px solid ${T.borderL}` : "none", background:T.card, cursor:"pointer", fontFamily:"inherit", fontSize:12, color:T.mid }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
              {newEvent.location && !addrValidEvent && <div style={{ fontSize:12, color:"#E74C3C", marginBottom:10 }}>Выберите реальное место из подсказок.</div>}
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Описание *</label>
              <textarea value={newEvent.desc} maxLength={CARD_TEXT_MAX} onChange={e=>setNewEvent({...newEvent,desc:e.target.value.slice(0, CARD_TEXT_MAX)})} placeholder="Подробности..." style={{ ...iS, minHeight:80, resize:"vertical", marginBottom:6 }} />
              <div style={{ fontSize:11, color:T.light, marginBottom:12, textAlign:"right" }}>{newEvent.desc.length}/{CARD_TEXT_MAX}</div>
              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Сайт (необязательно)</label>
              <input value={newEvent.website || ""} onChange={e=>setNewEvent({...newEvent,website:e.target.value})} placeholder="https://..." style={{ ...iS, marginBottom:20 }} />
              <input ref={eventFileRef} type="file" accept="image/*" multiple onChange={handleEventPhotos} style={{ display:"none" }} />
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
                {newEventPhotos.map((p,i) => (
                  <div key={i} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>
                    <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    <button onClick={()=>setNewEventPhotos(pr=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>✕</button>
                  </div>
                ))}
                {newEventPhotos.length < 3 && <button onClick={()=>eventFileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>＋ Фото (до 3)</button>}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>{setShowAddEvent(false); setNewEventPhotos([]); setAddrOptionsEvent([]); setAddrValidEvent(false); setEditingEvent(null);}} style={{ ...pl(false), flex:1, padding:14 }}>Отмена</button>
                {editingEvent && <button onClick={()=>handleDeleteEvent(editingEvent.id)} style={{ ...pl(false), flex:1, padding:14, border:"1.5px solid #fecaca", color:"#E74C3C", background:"#FFF5F5" }}>Удалить</button>}
                <button onClick={handleAddEvent} disabled={!newEvent.title||!newEvent.date||!newEvent.desc||!newEvent.cat} style={{ ...pl(true), flex:2, padding:14, opacity:(!newEvent.title||!newEvent.date||!newEvent.desc||!newEvent.cat)?0.5:1 }}>{editingEvent ? "Сохранить" : "Опубликовать"}</button>
              </div>
            </>)}
          </div>
        </div>)}

        {/* HOUSING */}
        {scr==="housing" && (<div>
          <button onClick={goHome} style={bk}>← Главная</button>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, margin:"4px 0 12px" }}>
            <h2 style={{ fontSize:20, fontWeight:700, margin:0, display:"inline-flex", alignItems:"center", gap:8 }}><HomeIcon size={18} /> Жильё в LA</h2>
            <button
              onClick={() => { if (!user) { handleLogin(); return; } setEditingHousing(null); setNewHousing({ address:"", district:"", type:"studio", minPrice:"", comment:"", telegram:"", messageContact:"" }); setNewHousingPhotos([]); setAddrValidHousing(false); setAddrOptionsHousing([]); setShowAddHousing(true); }}
              style={{ width:38, height:38, borderRadius:12, border:`1.5px solid ${T.primary}55`, background:T.primaryLight, color:T.primary, fontSize:28, lineHeight:1, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 }}
              title="Добавить жильё"
            >
              +
            </button>
          </div>
          <div style={{ ...cd, padding:12, marginBottom:10, boxShadow:"none", border:`1px solid ${T.border}` }}>
            <div style={{ fontSize:12, color:T.mid, marginBottom:8 }}>Фильтр по спальням</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {[
                { id:"all", label:"Все" },
                { id:"studio", label:"Studio" },
                { id:"1", label:"1+ bd" },
                { id:"2", label:"2+ bds" },
                { id:"room", label:"Комната" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={()=>setHousingBedsFilter(opt.id)}
                  style={{ ...pl(housingBedsFilter===opt.id), padding:"8px 12px", fontSize:12 }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:12, paddingBottom:70 }}>
            {housingSorted.map((h) => {
              const isFav = !!favorites[`housing-${h.id}`];
              return (
                <button
                  key={h.id}
                  onClick={() => { setHousingTextCollapsed(false); setSelHousing({ id: h.id }); setScr("housing-item"); }}
                  style={{ ...cd, width:"100%", overflow:"hidden", border:`1px solid ${T.border}`, boxShadow:"0 3px 14px rgba(0,0,0,0.08)", padding:0, cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left", background:T.card }}
                >
                  <div style={{ position:"relative", height:188, background:"#E9EDF2" }}>
                    {h.photo ? (
                      <img src={h.photo} alt={h.title || h.address} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    ) : (
                      <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:T.light, fontSize:12 }}>Нет фото</div>
                    )}
                    {!!h.updatedLabel && (
                      <div style={{ position:"absolute", top:10, left:10, background:"rgba(0,0,0,0.55)", color:"#fff", borderRadius:999, fontSize:11, fontWeight:700, padding:"6px 10px" }}>
                        {h.updatedLabel}
                      </div>
                    )}
                    <button
                      onClick={(e)=>{ e.stopPropagation(); toggleFavorite(h.id, "housing"); }}
                      style={{ position:"absolute", top:10, right:10, width:42, height:42, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.9)", color:isFav ? "#D68910" : "#1E4D97", fontSize:22, lineHeight:1, cursor:"pointer", fontFamily:"inherit" }}
                      title="Избранное"
                    >
                      <StarIcon active={!!isFav} size={20} />
                    </button>
                  </div>
                  <div style={{ padding:"10px 12px 12px" }}>
                    <div style={{ fontSize:24, fontWeight:900, lineHeight:1.05, marginBottom:6, letterSpacing:"-0.2px", fontFamily:"inherit" }}>${formatHousingPrice(h.minPrice)}</div>
                    <div style={{ fontSize:15, lineHeight:1.35, color:"#2E2E3A", marginBottom:4 }}>{h.address}</div>
                    <div style={{ fontSize:12, color:T.mid }}>{formatHousingType(h.type)} · {h.district || "LA"}</div>
                    {!!h.comment && <div style={{ fontSize:12, lineHeight:1.45, color:T.mid, marginTop:6, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{h.comment}</div>}
                  </div>
                </button>
              );
            })}
            {housingSorted.length===0 && (
              <div style={{ ...cd, padding:16, fontSize:13, color:T.mid, textAlign:"center" }}>Ничего не найдено. Попробуйте другой запрос или фильтры.</div>
            )}
          </div>

          <button onClick={() => { if (!user) { handleLogin(); return; } setEditingHousing(null); setNewHousing({ address:"", district:"", type:"studio", minPrice:"", comment:"", telegram:"", messageContact:"" }); setNewHousingPhotos([]); setAddrValidHousing(false); setAddrOptionsHousing([]); setShowAddHousing(true); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Добавить жильё</button>

        </div>)}

        {/* HOUSING ITEM */}
        {scr==="housing-item" && activeHousing && (() => {
          const galleryPhotos = Array.isArray(activeHousing.photos) && activeHousing.photos.length
            ? activeHousing.photos
            : (activeHousing.photo ? [activeHousing.photo] : []);
          return (
            <div>
              <div style={{ position:"relative", height:"calc(100vh - 122px)", overflowY:"auto", borderRadius:18, border:`1px solid ${T.border}`, background:"transparent", boxShadow:T.sh }}>
                <button onClick={() => setScr("housing")} style={{ position:"sticky", top:10, left:10, zIndex:4, margin:10, width:44, height:44, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.92)", color:"#222", fontSize:28, lineHeight:1, cursor:"pointer", fontFamily:"inherit" }} title="Закрыть">×</button>
                {galleryPhotos.length ? (
                  <div style={{ marginTop:-64 }}>
                    {galleryPhotos.map((src, i) => (
                      <button
                        key={`${src}-${i}`}
                        onClick={() => openPhotoViewer(galleryPhotos, i)}
                        style={{ display:"block", width:"100%", padding:0, margin:0, border:"none", background:"transparent", cursor:"zoom-in" }}
                      >
                        <img src={src} alt="" style={{ width:"100%", minHeight:240, maxHeight:560, objectFit:"cover", display:"block", borderBottom:`1px solid rgba(255,255,255,0.1)` }} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14 }}>Нет фото</div>
                )}

                <div style={{ position:"sticky", bottom:0, zIndex:3, background:T.card, borderTop:`1px solid ${T.border}`, borderRadius:"18px 18px 0 0", padding:"14px 14px calc(14px + env(safe-area-inset-bottom))" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:8 }}>
                    <div style={{ fontSize:28, fontWeight:900, lineHeight:1.05, letterSpacing:"-0.2px" }}>${formatHousingPrice(activeHousing.minPrice)}</div>
                    {!!activeHousing.comment && (
                      <button
                        onClick={() => setHousingTextCollapsed((v) => !v)}
                        style={{ ...pl(false), padding:"6px 10px", fontSize:11, whiteSpace:"nowrap" }}
                      >
                        {housingTextCollapsed ? "Развернуть текст" : "Свернуть текст"}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => openAddressInMaps(activeHousing.address)}
                    style={{ background:"none", border:"none", padding:0, marginBottom:6, fontWeight:700, fontSize:16, color:T.text, textAlign:"left", cursor:"pointer", fontFamily:"inherit", textDecoration:"underline" }}
                  >
                    {activeHousing.address}
                  </button>
                  {!!activeHousing.comment && !housingTextCollapsed && <div style={{ fontSize:13, lineHeight:1.55, color:T.mid, marginBottom:8 }}>{activeHousing.comment}</div>}
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                    {Number(activeHousing.beds || 0) > 0 && <span style={{ fontSize:12, padding:"5px 9px", borderRadius:999, background:T.bg, color:T.mid }}>{activeHousing.beds} beds</span>}
                    {Number(activeHousing.baths || 0) > 0 && <span style={{ fontSize:12, padding:"5px 9px", borderRadius:999, background:T.bg, color:T.mid }}>{activeHousing.baths} baths</span>}
                    <span style={{ fontSize:12, padding:"5px 9px", borderRadius:999, background:T.bg, color:T.mid }}>{activeHousing.district || "LA"}</span>
                    <span style={{ fontSize:12, padding:"5px 9px", borderRadius:999, background:T.bg, color:T.mid }}>{formatHousingType(activeHousing.type)}</span>
                  </div>
                  {(!!activeHousing.telegram || !!activeHousing.messageContact) && (
                    <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                      {!!activeHousing.telegram && <button onClick={() => openTelegramContact(activeHousing.telegram)} style={{ ...pl(false), flex:1, padding:"8px 10px", fontSize:12 }}>Telegram</button>}
                      {!!activeHousing.messageContact && <button onClick={() => openMessageContact(activeHousing.messageContact)} style={{ ...pl(false), flex:1, padding:"8px 10px", fontSize:12 }}>Сообщение</button>}
                    </div>
                  )}
                  {canManageActiveHousing && (
                    <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                      <button onClick={() => startEditHousing(activeHousing)} style={{ ...pl(false), width:"100%", padding:"8px 10px", fontSize:12 }}>Редактировать</button>
                    </div>
                  )}
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <button onClick={() => toggleFavorite(activeHousing.id, "housing")} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:favorites[`housing-${activeHousing.id}`] ? "#D68910" : T.mid, padding:0 }} title="Избранное"><StarIcon active={!!favorites[`housing-${activeHousing.id}`]} size={18} /></button>
                    <button onClick={() => handleToggleLike(activeHousing.id,"housing")} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:liked[`housing-${activeHousing.id}`]?"#E74C3C":T.mid, padding:0 }} title="Нравится"><HeartIcon active={!!liked[`housing-${activeHousing.id}`]} /> <span style={{ fontSize:14 }}>{activeHousing.likes||0}</span></button>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:14, color:T.mid }}><ViewIcon size={15} /> {activeHousing.views || 0}</span>
                    <button onClick={() => handleNativeShare({ title:activeHousing.title, text:`${activeHousing.address} · $${formatHousingPrice(activeHousing.minPrice)}`, url:window.location.href })} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:18, color:T.mid, padding:0 }} title="Поделиться">➤</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ADD HOUSING MODAL */}
        {showAddHousing && (
          <div
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center", touchAction:"none" }}
            onClick={()=>{ setShowAddHousing(false); setEditingHousing(null); setAddrOptionsHousing([]); setAddrValidHousing(false); }}
            onTouchMove={(e)=>{ if (e.target === e.currentTarget) e.preventDefault(); }}
            onWheel={(e)=>{ if (e.target === e.currentTarget) e.preventDefault(); }}
          >
            <div style={{ ...cd, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto", overscrollBehavior:"contain", touchAction:"pan-y", WebkitOverflowScrolling:"touch" }} onClick={e=>e.stopPropagation()}>
              <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
              <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 16px", display:"inline-flex", alignItems:"center", gap:8 }}><HomeIcon size={18} /> {editingHousing ? "Редактировать жильё" : "Новое жильё"}</h3>

              <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Адрес *</label>
              <input value={newHousing.address} onChange={(e)=>{ setNewHousing((s)=>({ ...s, address:e.target.value })); setAddrValidHousing(false); }} placeholder="1457 N Main St, Los Angeles, CA" style={{ ...iS, marginBottom:6, borderColor:newHousing.address && !addrValidHousing ? "#f5b7b1" : T.border }} />
              {addrLoadingHousing && <div style={{ fontSize:12, color:T.mid, marginBottom:8 }}>Ищем место...</div>}
              {!addrLoadingHousing && addrOptionsHousing.length > 0 && !addrValidHousing && (
                <div style={{ marginBottom:10, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", maxHeight:160, overflowY:"auto", background:T.card }}>
                  {addrOptionsHousing.map((opt, i) => (
                    <button key={`${opt.value}-${i}`} onClick={() => { setNewHousing((s) => ({ ...s, address: opt.value })); if (Number.isFinite(opt.lat) && Number.isFinite(opt.lng)) saveGeocodeCache({ name: "", address: opt.value }, { lat: opt.lat, lng: opt.lng }); setAddrValidHousing(true); setAddrOptionsHousing([]); }} style={{ width:"100%", textAlign:"left", padding:"10px 12px", border:"none", borderBottom:i < addrOptionsHousing.length-1 ? `1px solid ${T.borderL}` : "none", background:T.card, cursor:"pointer", fontFamily:"inherit", fontSize:12, color:T.mid }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Район</label>
                  <input value={newHousing.district} onChange={(e)=>setNewHousing((s)=>({ ...s, district:e.target.value }))} placeholder="Downtown LA" style={{ ...iS, marginBottom:0 }} />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Тип</label>
                  <select value={newHousing.type} onChange={(e)=>setNewHousing((s)=>({ ...s, type:e.target.value }))} style={{ ...iS, marginBottom:0 }}>
                    <option value="room">Комната</option>
                    <option value="studio">Студия</option>
                    <option value="1bd">1 bd</option>
                    <option value="2bd">2 bd</option>
                  </select>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10, marginBottom:12 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Цена от *</label>
                  <input type="number" value={newHousing.minPrice} onChange={(e)=>setNewHousing((s)=>({ ...s, minPrice:e.target.value }))} placeholder="1850" style={{ ...iS, marginBottom:0 }} />
                </div>
              </div>

              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Комментарий</label>
                <textarea value={newHousing.comment || ""} maxLength={1000} onChange={(e)=>setNewHousing((s)=>({ ...s, comment:e.target.value.slice(0, 1000) }))} placeholder="Описание жилья, условия, детали..." style={{ ...iS, minHeight:92, resize:"vertical", marginBottom:6 }} />
                <div style={{ fontSize:11, color:T.light, textAlign:"right" }}>{(newHousing.comment || "").length}/1000</div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Telegram</label>
                  <input value={newHousing.telegram} onChange={(e)=>setNewHousing((s)=>({ ...s, telegram:e.target.value }))} placeholder="@username" style={{ ...iS, marginBottom:0 }} />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Номер телефона</label>
                  <input value={newHousing.messageContact} onChange={(e)=>setNewHousing((s)=>({ ...s, messageContact:e.target.value }))} placeholder="+1 213 555 12 34" style={{ ...iS, marginBottom:0 }} />
                </div>
              </div>

              <input
                ref={housingFileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).map((file) => ({ file, name:file.name, preview: URL.createObjectURL(file) }));
                  setNewHousingPhotos((prev) => [...prev, ...files].slice(0, 10));
                }}
                style={{ display:"none" }}
              />
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 }}>
                {newHousingPhotos.map((p, i) => (
                  <div key={i} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>
                    <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    <button onClick={()=>setNewHousingPhotos((pr)=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>✕</button>
                  </div>
                ))}
                {newHousingPhotos.length < 10 && <button onClick={()=>housingFileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>＋ Фото (до 10)</button>}
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>{ setShowAddHousing(false); setEditingHousing(null); setAddrOptionsHousing([]); setAddrValidHousing(false); }} style={{ ...pl(false), flex:1, padding:14 }}>Отмена</button>
                {editingHousing && user?.id === editingHousing.userId && <button onClick={() => handleDeleteHousing(editingHousing.id)} style={{ ...pl(false), flex:1, padding:14, border:"1.5px solid #fecaca", color:"#E74C3C", background:"#FFF5F5" }}>Удалить</button>}
                <button onClick={handleAddHousing} disabled={!newHousing.address.trim() || !newHousing.minPrice} style={{ ...pl(true), flex:2, padding:14, opacity:(!newHousing.address.trim() || !newHousing.minPrice) ? 0.5 : 1 }}>{editingHousing ? "Сохранить" : "Опубликовать"}</button>
              </div>
            </div>
          </div>
        )}

        {/* CHAT */}
        {scr==="chat" && (<div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 120px)" }}>
          <button onClick={goHome} style={bk}>← Главная</button>
          {!user ? (
            <div style={{ textAlign:"center", padding:"40px 20px" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🔐</div>
              <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>Войдите для AI-чата</h3>
              <button onClick={handleLogin} style={{ ...pl(true), padding:"14px 28px" }}>Войти через Google</button>
              <div style={{ margin:"10px auto 0", maxWidth:420, fontSize:12, color:T.mid, background:T.bg, border:`1px solid ${T.borderL}`, borderRadius:10, padding:"10px 12px", lineHeight:1.45 }}>
                Вход через Google безопасен: мы не видим ваш пароль Google. Сохраняются только имя, email и аватар для работы аккаунта.
              </div>
            </div>
          ) : (<>
            <div style={{ flex:1, overflowY:"auto", paddingBottom:12 }}>
              {chat.map((m,i) => (<div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", marginBottom:10 }}>
                <div style={{ maxWidth:"85%", padding:"12px 16px", borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", background:m.role==="user"?T.primary:T.card, color:m.role==="user"?"#fff":T.text, fontSize:14, lineHeight:1.55, boxShadow:m.role==="user"?"0 2px 10px rgba(244,123,32,0.25)":T.sh, border:m.role==="user"?"none":`1px solid ${T.borderL}` }}>{renderChatText(m.text, m.role==="user")}</div>
              </div>))}
              {typing && <div style={{ display:"flex", marginBottom:10 }}><div style={{ ...cd, padding:"14px 20px", display:"flex", gap:5 }}>{[0,1,2].map(j=><div key={j} style={{ width:7, height:7, borderRadius:"50%", background:T.primary, opacity:0.4, animation:`pulse 1.2s ease ${j*0.2}s infinite` }} />)}</div></div>}
              <div ref={chatEnd} />
            </div>
            {chat.length<=1 && <div style={{ marginBottom:12 }}><div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{["Грин-карта через брак?","Стоимость N-400?","Работа без EAD?","Статус кейса?"].map((s,i)=><button key={i} onClick={()=>handleSend(s)} style={pl(false)}>{s}</button>)}</div></div>}
            <div style={{ display:"flex", gap:8, padding:"12px 0", borderTop:`1px solid ${T.borderL}` }}>
              <input ref={inpRef} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder="Задайте вопрос..." style={{ ...iS, flex:1, width:"auto" }} />
              <button onClick={()=>handleSend()} disabled={!inp.trim()} style={{ width:48, height:48, borderRadius:14, border:"none", background:inp.trim()?T.primary:T.bg, color:inp.trim()?"#fff":T.light, fontSize:20, cursor:inp.trim()?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>↑</button>
            </div>
          </>)}
        </div>)}
      </main>

      {uscisPdfViewer && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:320, display:"flex", alignItems:"center", justifyContent:"center", padding:10 }} onClick={closeUscisPdf}>
          <div style={{ ...cd, width:"100%", maxWidth:980, height:"92vh", borderRadius:16, overflow:"hidden", display:"grid", gridTemplateRows:"auto 1fr auto" }} onClick={(e)=>e.stopPropagation()}>
            <div style={{ padding:"10px 12px", borderBottom:`1px solid ${T.borderL}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
              <div style={{ fontWeight:700, fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{uscisPdfViewer.title || "USCIS PDF"}</div>
              <button onClick={closeUscisPdf} style={{ border:`1px solid ${T.border}`, background:T.card, borderRadius:10, padding:"6px 10px", cursor:"pointer", fontFamily:"inherit", color:T.mid }}>Закрыть</button>
            </div>
            <iframe src={uscisPdfViewer.url} title={uscisPdfViewer.title || "USCIS PDF"} style={{ width:"100%", height:"100%", border:"none", background:"#fff" }} />
            <div style={{ padding:"10px 12px", borderTop:`1px solid ${T.borderL}`, display:"flex", justifyContent:"flex-end", gap:8 }}>
              <a href={uscisPdfViewer.url} target="_blank" rel="noopener noreferrer" download style={{ ...pl(false), textDecoration:"none", fontSize:12, display:"inline-flex", alignItems:"center" }}>Скачать PDF</a>
              <a href={uscisPdfViewer.url} target="_blank" rel="noopener noreferrer" style={{ ...pl(true), textDecoration:"none", fontSize:12, display:"inline-flex", alignItems:"center" }}>Открыть в новой вкладке</a>
            </div>
          </div>
        </div>
      )}

      {showMapModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:280, display:"flex", alignItems:"center", justifyContent:"center", padding:12 }} onClick={() => setShowMapModal(false)}>
          <div style={{ ...cd, width:"100%", maxWidth:980, height:"90vh", borderRadius:18, overflow:"hidden", display:"grid", gridTemplateRows:"auto 1fr auto" }} onClick={(e)=>e.stopPropagation()}>
            <div style={{ padding:"12px 14px", borderBottom:`1px solid ${T.borderL}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>Карта мест · {selPC?.title || "Категория"}</div>
              <button onClick={() => setShowMapModal(false)} style={{ border:`1px solid ${T.border}`, background:T.card, borderRadius:10, padding:"6px 10px", cursor:"pointer", fontFamily:"inherit", color:T.mid }}>Закрыть</button>
            </div>

            <div style={{ position:"relative", background:"#ECEFF3" }}>
              {mapLoading && (
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:2, background:"rgba(255,255,255,0.65)", color:T.mid, fontSize:14 }}>
                  Загружаем карту и точки...
                </div>
              )}
              {!mapLoading && mapError && (
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:2, color:"#C0392B", fontSize:14, padding:16, textAlign:"center", background:"rgba(255,255,255,0.8)" }}>
                  {mapError}
                </div>
              )}
              {!mapLoading && mapPlaces.length === 0 && (
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:2, color:T.mid, fontSize:14 }}>
                  Не удалось найти координаты для точек в этой категории.
                </div>
              )}
              <div ref={mapContainerRef} style={{ width:"100%", height:"100%" }} />
            </div>

            <div style={{ borderTop:`1px solid ${T.borderL}`, padding:12, background:T.card }}>
              {selectedMapPlace ? (
                <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8 }}>
                  <div style={{ flex:"1 1 280px" }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{selectedMapPlace.name}</div>
                    <div style={{ fontSize:12, color:T.mid }}>{selectedMapPlace.address || selD?.name}</div>
                    {routeLoading && <div style={{ fontSize:12, color:T.mid, marginTop:4 }}>Считаем маршрут...</div>}
                    {!routeLoading && routeInfo && <div style={{ fontSize:12, color:T.mid, marginTop:4 }}>На машине: {routeInfo.duration} · {routeInfo.distance}</div>}
                  </div>
                  <button onClick={() => openRouteForPlace(selectedMapPlace, "google")} style={{ ...pl(false), padding:"10px 12px" }}>Google маршрут</button>
                  <button onClick={() => openRouteForPlace(selectedMapPlace, "apple")} style={{ ...pl(false), padding:"10px 12px" }}>Apple маршрут</button>
                </div>
              ) : (
                <div style={{ fontSize:12, color:T.mid }}>Нажмите на точку на карте, чтобы построить маршрут.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {photoViewer && (
        <div onClick={closePhotoViewer} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16, touchAction:"none" }}>
          <button
            onClick={(e)=>{e.stopPropagation(); closePhotoViewer();}}
            style={{ position:"absolute", top:"max(14px, env(safe-area-inset-top))", right:14, width:40, height:40, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.45)", background:"rgba(0,0,0,0.45)", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", zIndex:5 }}
          >
            X
          </button>
          {photoViewer.photos.length > 1 && (
            <>
              <button onClick={(e)=>{e.stopPropagation(); goPrevPhoto();}} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", width:42, height:42, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.35)", background:"rgba(0,0,0,0.35)", color:"#fff", fontSize:22, cursor:"pointer", zIndex:4 }}>‹</button>
              <button onClick={(e)=>{e.stopPropagation(); goNextPhoto();}} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:42, height:42, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.35)", background:"rgba(0,0,0,0.35)", color:"#fff", fontSize:22, cursor:"pointer", zIndex:4 }}>›</button>
            </>
          )}
          <div
            onClick={(e)=>e.stopPropagation()}
            onTouchStart={onPhotoTouchStart}
            onTouchMove={onPhotoTouchMove}
            onTouchEnd={onPhotoTouchEnd}
            style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", touchAction:"none" }}
          >
            <img
              src={photoViewer.photos[photoViewer.index]}
              alt=""
              draggable={false}
              style={{ maxWidth:"100%", maxHeight:"88vh", borderRadius:12, boxShadow:"0 10px 36px rgba(0,0,0,0.4)", transform:`scale(${photoZoom})`, transformOrigin:"center center", transition:photoZoom === 1 ? "transform 0.2s ease" : "none", userSelect:"none", WebkitUserSelect:"none" }}
            />
          </div>
          {photoViewer.photos.length > 1 && (
            <div style={{ position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)", color:"#fff", fontSize:12, background:"rgba(0,0,0,0.35)", border:"1px solid rgba(255,255,255,0.25)", padding:"5px 10px", borderRadius:999 }}>
              {photoViewer.index + 1} / {photoViewer.photos.length}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:.3; transform:scale(1) } 50% { opacity:1; transform:scale(1.2) } }
        input::placeholder, textarea::placeholder { color:#BBB }
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; -webkit-text-size-adjust:100% }
        html { touch-action:manipulation }
        ::-webkit-scrollbar { width:3px; height:3px }
        ::-webkit-scrollbar-thumb { background:#D5D5D5; border-radius:3px }
        button:active { transform:scale(0.97) }
        select { cursor:pointer }
        input, textarea, select { font-size:16px !important }
      `}</style>
    </div>
  );
}






