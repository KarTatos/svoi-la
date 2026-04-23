'use client';
import { useState, useEffect, useRef } from "react";
import { addPlace as dbAddPlace, updatePlace as dbUpdatePlace, deletePlace as dbDeletePlace, addTip as dbAddTip, updateTip as dbUpdateTip, deleteTip as dbDeleteTip, addEvent as dbAddEvent, updateEvent as dbUpdateEvent, deleteEvent as dbDeleteEvent, addHousing as dbAddHousing, updateHousing as dbUpdateHousing, deleteHousing as dbDeleteHousing, addComment as dbAddComment, updateComment as dbUpdateComment, deleteComment as dbDeleteComment, uploadPhoto, supabase } from "../lib/supabase";
import { useAppData } from "../hooks/useAppData";
import { useAuth } from "../hooks/useAuth";
import { useProfileWeather } from "../hooks/useProfileWeather";
import { useChatTextRenderer } from "../hooks/useChatTextRenderer";
import { useUscisNavigation } from "../hooks/useUscisNavigation";
import { useSupportRequests } from "../hooks/useSupportRequests";
import { useEngagement } from "../hooks/useEngagement";
import { useGoogleAutocomplete } from "../hooks/useGoogleAutocomplete";
import { useMapRouting } from "../hooks/useMapRouting";
import { useGoogleMapsCore } from "../hooks/useGoogleMapsCore";
import { useMiniMap } from "../hooks/useMiniMap";
import { usePlacesMap } from "../hooks/usePlacesMap";
import { usePhotoViewer } from "../hooks/usePhotoViewer";
import { usePlaceForm } from "../hooks/usePlaceForm";
import { useTipForm } from "../hooks/useTipForm";
import { useEventForm } from "../hooks/useEventForm";
import { useHousingForm } from "../hooks/useHousingForm";

import { T, DISTRICTS, PLACE_CATS, PLACE_CAT_IDS, INIT_PLACES, USCIS_CATS, CIVICS_RAW, shuffleTest, TIPS_CATS, INIT_TIPS, EVENT_CATS, INIT_EVENTS, INIT_HOUSING, SECTIONS, RICH_PREFIX, CARD_TEXT_MAX, limitCardText, twoLineClampStyle, encodeRichText, decodeRichText, getUscisPdfUrl, HeartIcon, HomeIcon, CalendarIcon, StarIcon, ShareIcon, decodeHousingPhotos, encodeHousingPhotos, formatPlaceAddressLabel } from "./svoi/config";
import { useCivicsTest } from "./svoi/useCivicsTest";
import CivicsTestScreen from "./svoi/screens/CivicsTestScreen";
import UscisScreen from "./svoi/screens/UscisScreen";
import UscisCategoryScreen from "./svoi/screens/UscisCategoryScreen";
import HomeScreen from "./svoi/screens/HomeScreen";
import ChatScreen from "./svoi/screens/ChatScreen";
import TipsScreen from "./svoi/screens/TipsScreen";
import EventsScreen from "./svoi/screens/EventsScreen";
import HousingListScreen from "./svoi/screens/HousingListScreen";
import HousingDetailScreen from "./svoi/screens/HousingDetailScreen";
import PlaceDetailScreen from "./svoi/screens/PlaceDetailScreen";
import ProfileScreen from "./svoi/screens/ProfileScreen";
import MyPlacesScreen from "./svoi/screens/MyPlacesScreen";
import SupportScreen from "./svoi/screens/SupportScreen";
import PlacesDistrictsScreen from "./svoi/screens/PlacesDistrictsScreen";
import DistrictCategoriesScreen from "./svoi/screens/DistrictCategoriesScreen";
import PlacesCategoryScreen from "./svoi/screens/PlacesCategoryScreen";
import AppHeader from "./svoi/layout/AppHeader";
import UscisPdfModal from "./svoi/modals/UscisPdfModal";
import PlacesMapModal from "./svoi/modals/PlacesMapModal";
import PhotoViewerModal from "./svoi/modals/PhotoViewerModal";
import PlaceFormModal from "./svoi/forms/PlaceFormModal";
import HousingFormModal from "./svoi/forms/HousingFormModal";

export default function App() {
  const ADMIN_EMAIL = "kushnir4work@gmail.com";
  const [scr, setScr] = useState(() => { try { return sessionStorage.getItem('scr') || 'home'; } catch { return 'home'; } });
  const [selD, setSelD] = useState(() => { try { const d = sessionStorage.getItem('selD'); return d ? JSON.parse(d) : null; } catch { return null; } });
  const [selPC, setSelPC] = useState(() => { try { const d = sessionStorage.getItem('selPC'); return d ? JSON.parse(d) : null; } catch { return null; } });
  const [selPlace, setSelPlace] = useState(null);
  const [selTC, setSelTC] = useState(null);
  const [housingBedsFilter, setHousingBedsFilter] = useState("all");
  // Save screen state on change
  useEffect(() => { try { sessionStorage.setItem('scr', scr); } catch {} }, [scr]);
  useEffect(() => { try { sessionStorage.setItem('selD', selD ? JSON.stringify(selD) : ''); } catch {} }, [selD]);
  useEffect(() => { try { sessionStorage.setItem('selPC', selPC ? JSON.stringify(selPC) : ''); } catch {} }, [selPC]);
  const [exp, setExp] = useState(null);
  const [expTip, setExpTip] = useState(null);
  const [mapP, setMapP] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapPlaces, setMapPlaces] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");
  const [placeSortField, setPlaceSortField] = useState("likes");
  const [placeSortDir, setPlaceSortDir] = useState("desc");
  const [likedTips, setLikedTips] = useState({});
  const [srch, setSrch] = useState("");
  const { user, signIn: signInAuth, signOut: signOutAuth, isAdmin } = useAuth([ADMIN_EMAIL]);
  const { places, tips, events, housing, setPlaces, setTips, setEvents, setHousing, reload: loadAllData } = useAppData(user);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [selEC, setSelEC] = useState(null);
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
  const [chat, setChat] = useState([{ role:"assistant", text:"Здравствуйте. Задайте вопрос по USCIS, местам, событиям, советам или жилью." }]);
  const [inp, setInp] = useState("");
  const [typing, setTyping] = useState(false);
  const [mt, setMt] = useState(false);
  const { profileLocation, profileWeather } = useProfileWeather();
  const [selHousing, setSelHousing] = useState(null);
  const [housingTextCollapsed, setHousingTextCollapsed] = useState(false);
  const [uscisPdfViewer, setUscisPdfViewer] = useState(null);
  const civicsTest = useCivicsTest({ questions: CIVICS_RAW, shuffleFn: shuffleTest });
  const { selU, setSelU, expF, setExpF, openUscisCategory, startTest } = useUscisNavigation({ setScr, civicsTest });
  const {
    sendingSupport,
    supportDone,
    supportError,
    clearSupportStatus,
    sendSupportRequest,
  } = useSupportRequests({ user });
  const {
    liked,
    favorites,
    handleToggleLike,
    toggleFavorite,
    resetEngagement,
  } = useEngagement({
    user,
    onRequireAuth: handleLogin,
    setPlaces,
    setTips,
    setEvents,
    setHousing,
  });
  const {
    selectedMapPlace,
    setSelectedMapPlace,
    routeInfo,
    setRouteInfo,
    routeLoading,
    setRouteLoading,
    miniSelectedPlaceId,
    setMiniSelectedPlaceId,
    miniRouteInfo,
    setMiniRouteInfo,
    miniRouteLoading,
    setMiniRouteLoading,
    resetMapRouting,
  } = useMapRouting();
  const { ensureGoogleMapsApi, saveGeocodeCache, geocodePlace } = useGoogleMapsCore();
  const { miniMapContainerRef, miniMapLoading, miniMapError, miniMapPlaces } = useMiniMap({
    scr,
    selPC,
    selD,
    places,
    placeCatIds: PLACE_CAT_IDS,
    placeSortField,
    placeSortDir,
    favorites,
    miniSelectedPlaceId,
    setMiniSelectedPlaceId,
    setMiniRouteInfo,
    setMiniRouteLoading,
    ensureGoogleMapsApi,
    geocodePlace,
  });
  const { mapContainerRef, openAllOnMap, openRouteForPlace } = usePlacesMap({
    showMapModal,
    setShowMapModal,
    mapLoading,
    setMapLoading,
    setMapError,
    mapPlaces,
    setMapPlaces,
    selD,
    selectedMapPlace,
    setSelectedMapPlace,
    setRouteInfo,
    setRouteLoading,
    ensureGoogleMapsApi,
    geocodePlace,
    openExternalUrl,
  });
  const {
    photoViewer,
    photoZoom,
    photoOffset,
    openPhotoViewer,
    closePhotoViewer,
    goPrevPhoto,
    goNextPhoto,
    onPhotoTouchStart,
    onPhotoTouchMove,
    onPhotoTouchEnd,
  } = usePhotoViewer();
  const canManageByOwnership = (itemUserId, itemAuthorName) => {
    if (!user) return false;
    if (isAdmin) return true;
    if (itemUserId && user.id === itemUserId) return true;
    if (!itemUserId && itemAuthorName && user.name === itemAuthorName) return true;
    return false;
  };
  const canManagePlace = (item) => canManageByOwnership(item?.userId, item?.addedBy);
  const canManageTip = (item) => canManageByOwnership(item?.userId, item?.author);
  const canManageEvent = (item) => canManageByOwnership(item?.userId, item?.author);
  const canManageHousing = (item) => canManageByOwnership(item?.userId, null);
  const {
    showAdd,
    setShowAdd,
    np,
    setNp,
    placeCoords,
    setPlaceCoords,
    nPhotos,
    setNPhotos,
    editingPlace,
    setEditingPlace,
    uploading,
    handleAddPlace,
    handleDeletePlace,
    startEditPlace,
    openAddForm,
    handlePhotos,
    resetPlaceForm,
  } = usePlaceForm({
    user,
    selD,
    selPC,
    places,
    selPlace,
    canManagePlace,
    setPlaces,
    setSelPlace,
    setSelD,
    setScr,
    setExp,
    addrValidPlace,
    setAddrValidPlace,
    setNameOptionsPlace,
    setAddrOptionsPlace,
    dbAddPlace,
    dbUpdatePlace,
    dbDeletePlace,
    uploadPhoto,
    limitCardText,
    PLACE_CATS,
    DISTRICTS,
    onRequireAuth: async () => {
      const { error } = await signInAuth();
      if (error) console.error("Login error:", error);
    },
  });
  const {
    showAddTip,
    setShowAddTip,
    newTip,
    setNewTip,
    newTipPhotos,
    setNewTipPhotos,
    editingTip,
    setEditingTip,
    resetTipForm,
    openAddTipForm,
    handleTipPhotos,
    startEditTip,
    handleDeleteTip,
    handleAddTip,
  } = useTipForm({
    user,
    selTC,
    tips,
    canManageTip,
    setTips,
    showComments,
    setShowComments,
    exp,
    setExp,
    dbAddTip,
    dbUpdateTip,
    dbDeleteTip,
    uploadPhoto,
    limitCardText,
    encodeRichText,
    onRequireAuth: async () => {
      const { error } = await signInAuth();
      if (error) console.error("Login error:", error);
    },
  });
  const {
    showAddEvent,
    setShowAddEvent,
    newEvent,
    setNewEvent,
    newEventPhotos,
    setNewEventPhotos,
    editingEvent,
    setEditingEvent,
    resetEventForm,
    openAddEventForm,
    handleEventPhotos,
    startEditEvent,
    handleDeleteEvent,
    handleAddEvent,
  } = useEventForm({
    user,
    events,
    canManageEvent,
    setEvents,
    setExp,
    addrValidEvent,
    setAddrValidEvent,
    setAddrOptionsEvent,
    dbAddEvent,
    dbUpdateEvent,
    dbDeleteEvent,
    uploadPhoto,
    limitCardText,
    encodeRichText,
    normalizeExternalUrl,
    onRequireAuth: async () => {
      const { error } = await signInAuth();
      if (error) console.error("Login error:", error);
    },
  });
  const {
    showAddHousing,
    setShowAddHousing,
    editingHousing,
    setEditingHousing,
    newHousing,
    setNewHousing,
    newHousingPhotos,
    setNewHousingPhotos,
    resetHousingForm,
    openAddHousingForm,
    handleAddHousing,
    startEditHousing,
    handleDeleteHousing,
  } = useHousingForm({
    user,
    isAdmin,
    housing,
    selHousing,
    canManageHousing,
    setHousing,
    setSelHousing,
    setScr,
    setAddrValidHousing,
    setAddrOptionsHousing,
    dbAddHousing,
    dbUpdateHousing,
    dbDeleteHousing,
    uploadPhoto,
    encodeHousingPhotos,
    decodeHousingPhotos,
    onRequireAuth: async () => {
      const { error } = await signInAuth();
      if (error) console.error("Login error:", error);
    },
  });

  useEffect(() => {
    if (scr === "housing-item") setHousingTextCollapsed(false);
  }, [scr, selHousing?.id]);

  const chatEnd = useRef(null);
  const inpRef = useRef(null);
  const fileRef = useRef(null);
  const tipFileRef = useRef(null);
  const eventFileRef = useRef(null);
  const housingFileRef = useRef(null);
  const datePickerRef = useRef(null);
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
  useEffect(() => {
    const scheduleReload = () => {
      if (realtimeReloadTimerRef.current) clearTimeout(realtimeReloadTimerRef.current);
      realtimeReloadTimerRef.current = setTimeout(() => {
        loadAllData();
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

  const goHome = () => { setScr("home"); setSelU(null); setSelD(null); setSelPC(null); setSelPlace(null); setSelTC(null); setSelEC(null); setSelHousing(null); setExp(null); setExpF(null); setExpTip(null); setMapP(null); setShowMapModal(false); setMapPlaces([]); resetMapRouting(); setSrch(""); resetPlaceForm(); resetTipForm(); resetEventForm(); resetHousingForm(); setTDone(false); setFilterDate(null); };
  function openExternalUrl(url) {
    if (!url) return;
    try {
      window.location.href = url;
    } catch {
      window.open(url, "_self");
    }
  }
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
  const openPlaceItem = (placeInput) => {
    const place = typeof placeInput === "object"
      ? placeInput
      : places.find((p) => String(p.id) === String(placeInput));
    if (!place) return;
    const district = DISTRICTS.find((d) => d.id === place.district) || null;
    const placeCat = PLACE_CATS.find((c) => c.id === place.cat) || null;
    if (district) setSelD(district);
    if (placeCat) setSelPC(placeCat);
    setSelPlace(place);
    setScr("place-item");
  };
  function normalizeExternalUrl(url) {
    const v = (url || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  }
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
  const {
    selectPlaceNameSuggestion,
    selectPlaceAddressSuggestion,
    selectEventAddressSuggestion,
    selectHousingAddressSuggestion,
  } = useGoogleAutocomplete({
    ensureGoogleMapsApi,
    saveGeocodeCache,
    np,
    setNp,
    setPlaceCoords,
    setAddrValidPlace,
    showAdd,
    selD,
    addrValidPlace,
    setAddrOptionsPlace,
    setNameOptionsPlace,
    setAddrLoadingPlace,
    setNameLoadingPlace,
    newEvent,
    setNewEvent,
    addrValidEvent,
    setAddrOptionsEvent,
    setAddrValidEvent,
    setAddrLoadingEvent,
    newHousing,
    setNewHousing,
    showAddHousing,
    addrValidHousing,
    setAddrOptionsHousing,
    setAddrValidHousing,
    setAddrLoadingHousing,
  });
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
  async function handleLogin() {
    const { error } = await signInAuth();
    if (error) console.error("Login error:", error);
  }
  const handleLogout = async () => { await signOutAuth(); resetEngagement(); };
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
  const sRes = srch.trim().length>=2 ? USCIS_CATS.flatMap(c=>c.docs.filter(d=>{const q=srch.toLowerCase();return d.form.toLowerCase().includes(q)||d.name.toLowerCase().includes(q);}).map(d=>({...d,cT:c.title,cI:c.icon}))) : [];
  const myPlacesRaw = user
    ? places.filter((p) => (p.userId && p.userId === user.id) || (!p.userId && p.addedBy && p.addedBy === user.name))
    : [];
  const myPlaces = myPlacesRaw.map((p) => ({
    ...p,
    districtLabel: DISTRICTS.find((d) => d.id === p.district)?.name || p.district || "LA",
  }));
  const savedPlacesCount = Object.entries(favorites || {}).filter(([k, v]) => v && String(k).startsWith("place-")).length;
  const myReviewsCount = user
    ? [...places, ...tips, ...events]
        .flatMap((item) => item.comments || [])
        .filter((c) => (c.userId && c.userId === user.id) || (!c.userId && c.author === user.name)).length
    : 0;
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
  const canManageActiveHousing = canManageHousing(activeHousing);
  const trackCardView = () => false;
  const { renderChatText } = useChatTextRenderer({
    events,
    tips,
    eventCategories: EVENT_CATS,
    tipCategories: TIPS_CATS,
    setSelHousing,
    setScr,
    openPlaceItem,
    setSelEC,
    setExp,
    setSelTC,
    setExpTip,
    trackCardView,
    openExternalUrl,
  });
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
    if (scr === "profile" && !user) setScr("home");
  }, [scr, user]);
  useEffect(() => {
    if (scr === "my-places" && !user) setScr("home");
  }, [scr, user]);
  useEffect(() => {
    if (scr === "support" && !user) setScr("home");
  }, [scr, user]);
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
  const commentsProps = {
    showComments,
    setShowComments,
    newComment,
    setNewComment,
    editingComment,
    setEditingComment,
    editCommentText,
    setEditCommentText,
    saveEditComment,
    deleteCommentFn,
    user,
    handleLogin,
    pl,
    iS,
  };

  return (
    <div style={{ fontFamily:"'Roboto', sans-serif", minHeight:"100vh", background:T.bg, color:T.text, maxWidth:480, margin:"0 auto", touchAction:"manipulation" }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet" />

      <AppHeader
        T={T}
        mt={mt}
        user={user}
        pl={pl}
        onGoHome={goHome}
        onOpenProfile={() => { if (!user) { handleLogin(); return; } setScr("profile"); }}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <main style={{ padding:"16px 16px 40px" }}>

        {scr==="home" && (
          <HomeScreen
            T={T}
            cd={cd}
            mt={mt}
            user={user}
            profileLocation={profileLocation}
            profileWeather={profileWeather}
            sections={SECTIONS}
            HomeIcon={HomeIcon}
            CalendarIcon={CalendarIcon}
            onOpenSection={setScr}
            onOpenChat={() => { if (!user) { handleLogin(); return; } setScr("chat"); }}
          />
        )}

        {scr==="profile" && user && (
          <ProfileScreen
            T={T}
            cd={cd}
            bk={bk}
            user={user}
            profileLocation={profileLocation}
            placesCount={places.length}
            savedPlacesCount={savedPlacesCount}
            myPlacesCount={myPlaces.length}
            myReviewsCount={myReviewsCount}
            onBack={goHome}
            onOpenMyPlaces={() => setScr("my-places")}
            onOpenSavedPlaces={() => setScr("places")}
            onOpenMyReviews={() => setScr("tips")}
            onOpenHelp={() => setScr("support")}
            onLogout={handleLogout}
          />
        )}

        {scr==="my-places" && user && (
          <MyPlacesScreen
            T={T}
            cd={cd}
            bk={bk}
            myPlaces={myPlaces}
            onBack={() => setScr("profile")}
            onOpenPlace={openPlaceItem}
          />
        )}

        {scr==="support" && user && (
          <SupportScreen
            T={T}
            cd={cd}
            bk={bk}
            pl={pl}
            iS={iS}
            user={user}
            onBack={() => setScr("profile")}
            onSubmit={sendSupportRequest}
            sending={sendingSupport}
            done={supportDone}
            error={supportError}
            onClearStatus={clearSupportStatus}
          />
        )}

        {scr==="uscis" && (
          <UscisScreen
            T={T}
            cd={cd}
            bk={bk}
            pl={pl}
            iS={iS}
            srch={srch}
            setSrch={setSrch}
            searchResults={sRes}
            uscisCategories={USCIS_CATS}
            onOpenCategory={openUscisCategory}
            onGoHome={goHome}
          />
        )}

        {scr==="uscis-cat" && selU && (
          <UscisCategoryScreen
            T={T}
            cd={cd}
            bk={bk}
            pl={pl}
            selectedCategory={selU}
            expandedIndex={expF}
            onExpand={setExpF}
            onBack={() => setScr("uscis")}
            onStartTest={startTest}
            getPdfUrl={getUscisPdfUrl}
          />
        )}

        {/* CIVICS TEST — English, shuffled answers */}
        {scr==="test" && (
          <CivicsTestScreen
            T={T}
            cd={cd}
            bk={bk}
            pl={pl}
            questionIndex={civicsTest.questionIndex}
            shuffledQuestions={civicsTest.shuffledQuestions}
            answersByIndex={civicsTest.answersByIndex}
            correctCount={civicsTest.correctCount}
            wrongCount={civicsTest.wrongCount}
            answeredCount={civicsTest.answeredCount}
            onAnswer={civicsTest.answer}
            onPrev={civicsTest.prev}
            onNext={civicsTest.next}
            onRetry={startTest}
            onExit={goHome}
          />
        )}

        {scr==="places" && (
          <PlacesDistrictsScreen
            T={T}
            cd={cd}
            bk={bk}
            mt={mt}
            districts={DISTRICTS}
            places={places}
            onGoHome={goHome}
            onSelectDistrict={(d) => { setSelD(d); setScr("district"); }}
          />
        )}

        {scr==="district" && selD && (
          <DistrictCategoriesScreen
            T={T}
            cd={cd}
            bk={bk}
            selectedDistrict={selD}
            districtPlaces={dPlaces}
            placeCategories={PLACE_CATS}
            onBack={() => { setScr("places"); setSelD(null); }}
            onSelectCategory={(c) => { setSelPC(c); setScr("places-cat"); }}
            onOpenAdd={openAddForm}
          />
        )}

        {/* ADD PLACE MODAL */}
        <PlaceFormModal
          showAdd={showAdd}
          selD={selD}
          cd={cd}
          T={T}
          user={user}
          handleLogin={handleLogin}
          pl={pl}
          editingPlace={editingPlace}
          np={np}
          setNp={setNp}
          setAddrValidPlace={setAddrValidPlace}
          setPlaceCoords={setPlaceCoords}
          setAddrOptionsPlace={setAddrOptionsPlace}
          nameLoadingPlace={nameLoadingPlace}
          nameOptionsPlace={nameOptionsPlace}
          setNameOptionsPlace={setNameOptionsPlace}
          onSelectPlaceNameSuggestion={selectPlaceNameSuggestion}
          onSelectPlaceAddressSuggestion={selectPlaceAddressSuggestion}
          PLACE_CATS={PLACE_CATS}
          DISTRICTS={DISTRICTS}
          iS={iS}
          addrLoadingPlace={addrLoadingPlace}
          addrOptionsPlace={addrOptionsPlace}
          addrValidPlace={addrValidPlace}
          CARD_TEXT_MAX={CARD_TEXT_MAX}
          fileRef={fileRef}
          handlePhotos={handlePhotos}
          nPhotos={nPhotos}
          setNPhotos={setNPhotos}
          setShowAdd={setShowAdd}
          handleDeletePlace={handleDeletePlace}
          handleAddPlace={handleAddPlace}
          uploading={uploading}
        />

        <PlacesCategoryScreen
          scr={scr}
          selPC={selPC}
          selD={selD}
          setScr={setScr}
          setSelPC={setSelPC}
          setSelPlace={setSelPlace}
          bk={bk}
          T={T}
          cPlaces={cPlaces}
          openAddForm={openAddForm}
          cd={cd}
          pl={pl}
          openAllOnMap={openAllOnMap}
          cPlacesDisplay={cPlacesDisplay}
          miniMapLoading={miniMapLoading}
          miniMapError={miniMapError}
          miniMapPlaces={miniMapPlaces}
          miniMapContainerRef={miniMapContainerRef}
          miniSelectedPlace={miniSelectedPlace}
          miniRouteLoading={miniRouteLoading}
          miniRouteInfo={miniRouteInfo}
          placeSortField={placeSortField}
          setPlaceSortField={setPlaceSortField}
          placeSortDir={placeSortDir}
          setPlaceSortDir={setPlaceSortDir}
          HeartIcon={HeartIcon}
          StarIcon={StarIcon}
          openAddressInMaps={openAddressInMaps}
          formatPlaceAddressLabel={formatPlaceAddressLabel}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          liked={liked}
          handleToggleLike={handleToggleLike}
          twoLineClampStyle={twoLineClampStyle}
          limitCardText={limitCardText}
        />

        <PlaceDetailScreen
          scr={scr}
          activePlace={activePlace}
          selPC={selPC}
          selD={selD}
          setScr={setScr}
          setExp={setExp}
          bk={bk}
          cd={cd}
          T={T}
          openAddressInMaps={openAddressInMaps}
          formatPlaceAddressLabel={formatPlaceAddressLabel}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          StarIcon={StarIcon}
          liked={liked}
          handleToggleLike={handleToggleLike}
          HeartIcon={HeartIcon}
          limitCardText={limitCardText}
          openPhotoViewer={openPhotoViewer}
          handleNativeShare={handleNativeShare}
          ShareIcon={ShareIcon}
          addPlaceComment={addPlaceComment}
          comments={commentsProps}
          canManagePlace={canManagePlace}
          startEditPlace={startEditPlace}
        />

                {/* TIPS */}
        {scr==="tips" && (
          <TipsScreen
            T={T}
            TIPS_CATS={TIPS_CATS}
            tips={tips}
            selTC={selTC}
            setSelTC={setSelTC}
            onGoHome={goHome}
            bk={bk}
            cd={cd}
            user={user}
            handleLogin={handleLogin}
            openAddTipForm={openAddTipForm}
            expTip={expTip}
            setExpTip={setExpTip}
            liked={liked}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            StarIcon={StarIcon}
            HeartIcon={HeartIcon}
            ShareIcon={ShareIcon}
            pl={pl}
            twoLineClampStyle={twoLineClampStyle}
            limitCardText={limitCardText}
            openPhotoViewer={openPhotoViewer}
            handleToggleLike={handleToggleLike}
            handleNativeShare={handleNativeShare}
            comments={commentsProps}
            handleAddComment={handleAddComment}
            canManageTip={canManageTip}
            startEditTip={startEditTip}
            handleDeleteTip={handleDeleteTip}
            catTips={catTips}
            showAddTip={showAddTip}
            setShowAddTip={setShowAddTip}
            setNewTipPhotos={setNewTipPhotos}
            setEditingTip={setEditingTip}
            editingTip={editingTip}
            newTip={newTip}
            setNewTip={setNewTip}
            CARD_TEXT_MAX={CARD_TEXT_MAX}
            tipFileRef={tipFileRef}
            handleTipPhotos={handleTipPhotos}
            newTipPhotos={newTipPhotos}
            handleAddTip={handleAddTip}
          />
        )}

        <EventsScreen
          scr={scr}
          selEC={selEC}
          setSelEC={setSelEC}
          setFilterDate={setFilterDate}
          goHome={goHome}
          bk={bk}
          T={T}
          EVENT_CATS={EVENT_CATS}
          events={events}
          cd={cd}
          openAddEventForm={openAddEventForm}
          setNewEvent={setNewEvent}
          filterDate={filterDate}
          CalendarIcon={CalendarIcon}
          datePickerRef={datePickerRef}
          fmtDate={fmtDate}
          catEvents={catEvents}
          exp={exp}
          setExp={setExp}
          favorites={favorites}
          normalizeExternalUrl={normalizeExternalUrl}
          pl={pl}
          openEventMap={openEventMap}
          twoLineClampStyle={twoLineClampStyle}
          limitCardText={limitCardText}
          openPhotoViewer={openPhotoViewer}
          liked={liked}
          toggleFavorite={toggleFavorite}
          StarIcon={StarIcon}
          HeartIcon={HeartIcon}
          handleNativeShare={handleNativeShare}
          ShareIcon={ShareIcon}
          comments={commentsProps}
          addEventComment={addEventComment}
          canManageEvent={canManageEvent}
          startEditEvent={startEditEvent}
          showAddEvent={showAddEvent}
          setShowAddEvent={setShowAddEvent}
          setNewEventPhotos={setNewEventPhotos}
          setAddrOptionsEvent={setAddrOptionsEvent}
          setAddrValidEvent={setAddrValidEvent}
          setEditingEvent={setEditingEvent}
          editingEvent={editingEvent}
          newEvent={newEvent}
          addrLoadingEvent={addrLoadingEvent}
          addrOptionsEvent={addrOptionsEvent}
          selectEventAddressSuggestion={selectEventAddressSuggestion}
          CARD_TEXT_MAX={CARD_TEXT_MAX}
          eventFileRef={eventFileRef}
          handleEventPhotos={handleEventPhotos}
          newEventPhotos={newEventPhotos}
          handleDeleteEvent={handleDeleteEvent}
          handleAddEvent={handleAddEvent}
        />

        <HousingListScreen
          scr={scr}
          goHome={goHome}
          bk={bk}
          T={T}
          HomeIcon={HomeIcon}
          openAddHousingForm={openAddHousingForm}
          cd={cd}
          housingBedsFilter={housingBedsFilter}
          setHousingBedsFilter={setHousingBedsFilter}
          pl={pl}
          housingSorted={housingSorted}
          favorites={favorites}
          setHousingTextCollapsed={setHousingTextCollapsed}
          setSelHousing={setSelHousing}
          setScr={setScr}
          toggleFavorite={toggleFavorite}
          StarIcon={StarIcon}
          formatHousingPrice={formatHousingPrice}
          formatHousingType={formatHousingType}
        />

        <HousingDetailScreen
          scr={scr}
          activeHousing={activeHousing}
          setScr={setScr}
          T={T}
          openPhotoViewer={openPhotoViewer}
          formatHousingPrice={formatHousingPrice}
          housingTextCollapsed={housingTextCollapsed}
          setHousingTextCollapsed={setHousingTextCollapsed}
          pl={pl}
          openAddressInMaps={openAddressInMaps}
          formatHousingType={formatHousingType}
          openTelegramContact={openTelegramContact}
          openMessageContact={openMessageContact}
          canManageActiveHousing={canManageActiveHousing}
          startEditHousing={startEditHousing}
          toggleFavorite={toggleFavorite}
          favorites={favorites}
          StarIcon={StarIcon}
          handleToggleLike={handleToggleLike}
          liked={liked}
          HeartIcon={HeartIcon}
          handleNativeShare={handleNativeShare}
          ShareIcon={ShareIcon}
        />

        {/* ADD HOUSING MODAL */}
        <HousingFormModal
          showAddHousing={showAddHousing}
          setShowAddHousing={setShowAddHousing}
          setEditingHousing={setEditingHousing}
          setAddrOptionsHousing={setAddrOptionsHousing}
          setAddrValidHousing={setAddrValidHousing}
          cd={cd}
          T={T}
          editingHousing={editingHousing}
          newHousing={newHousing}
          setNewHousing={setNewHousing}
          iS={iS}
          addrLoadingHousing={addrLoadingHousing}
          addrOptionsHousing={addrOptionsHousing}
          onSelectHousingAddressSuggestion={selectHousingAddressSuggestion}
          housingFileRef={housingFileRef}
          setNewHousingPhotos={setNewHousingPhotos}
          newHousingPhotos={newHousingPhotos}
          pl={pl}
          canManageHousing={canManageHousing}
          handleDeleteHousing={handleDeleteHousing}
          handleAddHousing={handleAddHousing}
        />

        {scr==="chat" && (
          <ChatScreen
            T={T}
            cd={cd}
            bk={bk}
            pl={pl}
            iS={iS}
            user={user}
            chat={chat}
            typing={typing}
            inp={inp}
            setInp={setInp}
            chatEndRef={chatEnd}
            inpRef={inpRef}
            renderChatText={renderChatText}
            onGoHome={goHome}
            onLogin={handleLogin}
            onSend={handleSend}
          />
        )}
      </main>

      <UscisPdfModal T={T} cd={cd} pl={pl} viewer={uscisPdfViewer} onClose={closeUscisPdf} />

      {showMapModal && (
        <PlacesMapModal
          T={T}
          cd={cd}
          pl={pl}
          selPC={selPC}
          selD={selD}
          mapLoading={mapLoading}
          mapError={mapError}
          mapPlaces={mapPlaces}
          mapContainerRef={mapContainerRef}
          selectedMapPlace={selectedMapPlace}
          routeLoading={routeLoading}
          routeInfo={routeInfo}
          onClose={() => setShowMapModal(false)}
          onOpenRoute={openRouteForPlace}
        />
      )}

      <PhotoViewerModal
        photoViewer={photoViewer}
        photoZoom={photoZoom}
        photoOffset={photoOffset}
        onClose={closePhotoViewer}
        onPrev={goPrevPhoto}
        onNext={goNextPhoto}
        onTouchStart={onPhotoTouchStart}
        onTouchMove={onPhotoTouchMove}
        onTouchEnd={onPhotoTouchEnd}
      />

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








