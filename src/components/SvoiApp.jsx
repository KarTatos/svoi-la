'use client';
import { useCallback, useState, useEffect, useRef } from "react";
import { addPlace as dbAddPlace, updatePlace as dbUpdatePlace, deletePlace as dbDeletePlace, addTip as dbAddTip, updateTip as dbUpdateTip, deleteTip as dbDeleteTip, addEvent as dbAddEvent, updateEvent as dbUpdateEvent, deleteEvent as dbDeleteEvent, addHousing as dbAddHousing, updateHousing as dbUpdateHousing, deleteHousing as dbDeleteHousing, addComment as dbAddComment, updateComment as dbUpdateComment, deleteComment as dbDeleteComment, toggleLike as dbToggleLike, uploadPhoto } from "../lib/supabase";

import { T, DISTRICTS, PLACE_CATS, PLACE_CAT_IDS, USCIS_CATS, CIVICS_RAW, shuffleTest, TIPS_CATS, EVENT_CATS, INIT_JOBS, SECTIONS, RICH_PREFIX, CARD_TEXT_MAX, limitCardText, twoLineClampStyle, encodeRichText, decodeRichText, getUscisPdfUrl, HeartIcon, HomeIcon, CalendarIcon, StarIcon, ShareIcon, decodeHousingPhotos, encodeHousingPhotos, formatPlaceAddressLabel } from "./svoi/config";
import { useAuth } from "../hooks/useAuth";
import { useSupportRequests } from "../hooks/useSupportRequests";
import { useProfileWeather } from "../hooks/useProfileWeather";
import { usePlaceForm } from "../hooks/usePlaceForm";
import { useTipForm } from "../hooks/useTipForm";
import { useSessionState } from "../hooks/useSessionState";
import { useSvoiRouter } from "../hooks/useSvoiRouter";
import { useAppData } from "../hooks/useAppData";
import { cacheGeocodeFor, ensureGoogleMapsApi, fetchAddressSuggestions, geocodePlace } from "../lib/maps";
import { normalizeAddressText } from "../lib/text";
import { recordView } from "../lib/views";
import { useCivicsTest } from "./svoi/useCivicsTest";
import CivicsTestScreen from "./svoi/screens/CivicsTestScreen";
import UscisScreen from "./svoi/screens/UscisScreen";
import UscisCategoryScreen from "./svoi/screens/UscisCategoryScreen";
import HomeScreen from "./svoi/screens/HomeScreen";
import ChatScreen from "./svoi/screens/ChatScreen";
import ProfileScreen from "./svoi/screens/ProfileScreen";
import MyPlacesScreen from "./svoi/screens/MyPlacesScreen";
import SupportScreen from "./svoi/screens/SupportScreen";
import PlacesDistrictsScreen from "./svoi/screens/PlacesDistrictsScreen";
import DistrictCategoriesScreen from "./svoi/screens/DistrictCategoriesScreen";
import AppHeader from "./svoi/layout/AppHeader";
import PlaceFormModal from "./svoi/forms/PlaceFormModal";
import TipFormModal from "./svoi/forms/TipFormModal";
import EventCreateModal from "./svoi/forms/EventCreateModal";
import TipCard from "./svoi/cards/TipCard";
import UscisPdfModal from "./svoi/modals/UscisPdfModal";
import PlacesMapModal from "./svoi/modals/PlacesMapModal";
import PhotoViewerModal from "./svoi/modals/PhotoViewerModal";

const ADMIN_EMAILS = String(process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((x) => x.trim().toLowerCase())
  .filter(Boolean);

export default function App() {
  const [selU, setSelU] = useState(null);
  const [selD, setSelD] = useSessionState("selD", null);
  const [selPC, setSelPC] = useSessionState("selPC", null);
  const [selPlace, setSelPlace] = useState(null);
  const [selTC, setSelTC] = useState(null);
  const [tipsSearchInput, setTipsSearchInput] = useState("");
  const [tipsSearchApplied, setTipsSearchApplied] = useState("");
  const [housingBedsFilter, setHousingBedsFilter] = useState("all");
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
  const [favorites, setFavorites] = useState({});
  const [likedTips, setLikedTips] = useState({});
  const [srch, setSrch] = useState("");
  const { user, authReady, signIn, signOut: authSignOut, isAdmin } = useAuth(ADMIN_EMAILS);
  const {
    places, setPlaces,
    tips, setTips,
    events, setEvents,
    housing, setHousing,
    liked, setLiked,
  } = useAppData({ user, authReady });
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [selEC, setSelEC] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventSaving, setEventSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showAddHousing, setShowAddHousing] = useState(false);
  const [editingHousing, setEditingHousing] = useState(null);
  const [newHousing, setNewHousing] = useState({ address:"", district:"", type:"studio", minPrice:"", comment:"", telegram:"", messageContact:"" });
  const [newHousingPhotos, setNewHousingPhotos] = useState([]);
  const [filterDate, setFilterDate] = useState(null);
  const [jobsItems, setJobsItems] = useState(INIT_JOBS);
  const [jobsTab, setJobsTab] = useState("vacancy");
  const [showAddJob, setShowAddJob] = useState(false);
  const [newJob, setNewJob] = useState({
    type: "vacancy",
    title: "",
    district: "",
    price: "",
    schedule: "full-time",
    category: "",
    desc: "",
    telegram: "",
    phone: "",
  });
  const [addrOptionsPlace, setAddrOptionsPlace] = useState([]);
  const [nameOptionsPlace, setNameOptionsPlace] = useState([]);
  const [addrOptionsHousing, setAddrOptionsHousing] = useState([]);
  const [addrLoadingPlace, setAddrLoadingPlace] = useState(false);
  const [nameLoadingPlace, setNameLoadingPlace] = useState(false);
  const [addrLoadingHousing, setAddrLoadingHousing] = useState(false);
  const [addrValidPlace, setAddrValidPlace] = useState(false);
  const [addrValidHousing, setAddrValidHousing] = useState(false);
  const [photoViewer, setPhotoViewer] = useState(null);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [chat, setChat] = useState([{ role:"assistant", text:"Здравствуйте. Задайте вопрос по USCIS, местам, событиям, советам или жилью." }]);
  const [inp, setInp] = useState("");
  const [typing, setTyping] = useState(false);
  const [mt, setMt] = useState(false);
  const { profileLocation, profileWeather, userCoords: geoCoords } = useProfileWeather();
  const [selHousing, setSelHousing] = useState(null);
  const [housingTextCollapsed, setHousingTextCollapsed] = useState(false);
  const { scr, setScr } = useSvoiRouter({
    user,
    selPlace,
    places,
    selHousing,
    housing,
  });
  const trackView = useCallback(
    async (itemType, item) => {
      if (!item?.id) return;
      const id = item.id;
      const newViews = await recordView(itemType, id, user?.id || null);
      const updater = (it) => (it?.id === id ? { ...it, views: newViews } : it);
      if (itemType === "place") {
        setPlaces((prev) => prev.map(updater));
        setSelPlace((prev) => (prev?.id === id ? { ...prev, views: newViews } : prev));
      } else if (itemType === "tip") {
        setTips((prev) => prev.map(updater));
      } else if (itemType === "event") {
        setEvents((prev) => prev.map(updater));
      } else if (itemType === "housing") {
        setHousing((prev) => prev.map(updater));
        setSelHousing((prev) => (prev?.id === id ? { ...prev, views: newViews } : prev));
      }
    },
    [user?.id, setPlaces, setTips, setEvents, setHousing]
  );
  const [uscisPdfViewer, setUscisPdfViewer] = useState(null);
  const civicsTest = useCivicsTest({ questions: CIVICS_RAW, shuffleFn: shuffleTest });
  const supportRequests = useSupportRequests({ user });
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
  const placeForm = usePlaceForm({
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
    onRequireAuth: () => handleLogin(),
  });
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
  } = placeForm;
  const tipForm = useTipForm({
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
    onRequireAuth: () => handleLogin(),
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
  } = tipForm;
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem("jobs_board_v1");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setJobsItems(parsed);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("jobs_board_v1", JSON.stringify(jobsItems || []));
    } catch {}
  }, [jobsItems]);
  const chatEnd = useRef(null);
  const inpRef = useRef(null);
  const fileRef = useRef(null);
  const tipFileRef = useRef(null);
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
  const datePickerRef = useRef(null);
  const viewedRef = useRef({ place: null, housing: null });
  const photoSwipeRef = useRef({ startX: 0, startY: 0, active: false });
  const photoPinchRef = useRef({ baseDistance: 0, baseZoom: 1 });

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
        // Keep current screen source of truth in session state only.
        // Restoring `scr` from localStorage caused visible screen jumps.
        if (saved.selDId) setSelD(DISTRICTS.find(d => d.id === saved.selDId) || null);
        if (saved.selPCId) setSelPC(PLACE_CATS.find(c => c.id === saved.selPCId) || null);
        if (saved.selPlaceId) setSelPlace({ id: saved.selPlaceId });
        if (saved.selUId) setSelU(USCIS_CATS.find(c => c.id === saved.selUId) || null);
        if (saved.selTCId) setSelTC(TIPS_CATS.find(c => c.id === saved.selTCId) || null);
        if (saved.selECId) setSelEC(EVENT_CATS.find(c => c.id === saved.selECId) || null);
        if (saved.selHousingId) setSelHousing({ id: saved.selHousingId });
      }
    } catch {}
  }, [setSelD, setSelPC]);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [chat, typing]);

  const goHome = () => { setScr("home"); setSelU(null); setSelD(null); setSelPC(null); setSelPlace(null); setSelTC(null); setSelEC(null); setSelHousing(null); setExp(null); setExpF(null); setExpTip(null); setMapP(null); setShowMapModal(false); setMapPlaces([]); setSelectedMapPlace(null); setMiniSelectedPlaceId(null); setMiniRouteInfo(null); setMiniRouteLoading(false); setSrch(""); setTipsSearchInput(""); setTipsSearchApplied(""); setShowAdd(false); resetTipForm(); setShowAddEvent(false); setEditingEvent(null); setShowAddHousing(false); setShowAddJob(false); setJobsTab("vacancy"); setNewJob({ type:"vacancy", title:"", district:"", price:"", schedule:"full-time", category:"", desc:"", telegram:"", phone:"" }); setEditingHousing(null); setNewHousing({ address:"", district:"", type:"studio", minPrice:"", comment:"", telegram:"", messageContact:"" }); setNewHousingPhotos([]); setAddrValidHousing(false); setAddrOptionsHousing([]); setTDone(false); setEditingPlace(null); setFilterDate(null); };
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
      openPlaceItem(id);
      return;
    }
    if (type === "event") {
      const ev = events.find((e) => String(e.id) === id);
      if (!ev) return;
      const eventCat = EVENT_CATS.find((c) => c.id === ev.cat) || null;
      if (eventCat) setSelEC(eventCat);
      setScr("events");
      setExp(`ev-${ev.id}`);
      return;
    }
    if (type === "tip") {
      const tip = tips.find((t) => String(t.id) === id);
      if (!tip) return;
      const tipCat = TIPS_CATS.find((c) => c.id === tip.cat) || null;
      if (tipCat) setSelTC(tipCat);
      setScr("tips");
      setExpTip(tip.id);
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
  const onSelectPlaceNameSuggestion = (opt) => {
    setNp((prev) => ({ ...prev, name: opt.placeName || prev.name, address: opt.value }));
    if (Number.isFinite(opt.lat) && Number.isFinite(opt.lng)) {
      cacheGeocodeFor({ name: opt.placeName || np.name, address: opt.value }, { lat: opt.lat, lng: opt.lng });
      setPlaceCoords({ lat: opt.lat, lng: opt.lng });
      setAddrValidPlace(true);
    } else {
      setPlaceCoords({ lat: null, lng: null });
      setAddrValidPlace(false);
    }
    setNameOptionsPlace([]);
    setAddrOptionsPlace([]);
  };
  const onSelectPlaceAddressSuggestion = (opt) => {
    setNp((prev) => ({ ...prev, address: opt.value }));
    if (Number.isFinite(opt.lat) && Number.isFinite(opt.lng)) {
      cacheGeocodeFor({ name: np.name, address: opt.value }, { lat: opt.lat, lng: opt.lng });
      setPlaceCoords({ lat: opt.lat, lng: opt.lng });
      setAddrValidPlace(true);
    } else {
      setPlaceCoords({ lat: null, lng: null });
      setAddrValidPlace(false);
    }
    setAddrOptionsPlace([]);
    setNameOptionsPlace([]);
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
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ message:msg, history:chat.slice(-10) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setChat(p => [...p, { role:"assistant", text:data.text||"Нет ответа." }]);
    } catch(e) { setChat(p => [...p, { role:"assistant", text:"Ошибка. Попробуйте ещё раз." }]); }
    finally { setTyping(false); }
  };
  const handleLogin = async () => {
    const { error } = await signIn();
    if (error) console.error("Login error:", error);
  };
  const handleLogout = async () => { await authSignOut(); setLiked({}); setFavorites({}); };
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
  const startEditEvent = (eventItem) => {
    if (!eventItem) return;
    if (!canManageEvent(eventItem)) {
      alert("Редактировать событие может только автор или админ.");
      return;
    }
    setEditingEvent(eventItem);
    setShowAddEvent(true);
  };
  const mapDbEventToState = (row, fallback = {}) => {
    const rich = decodeRichText(row?.description);
    return {
      id: row.id,
      cat: row.category,
      title: row.title || "",
      date: row.date,
      location: row.location || "",
      desc: rich.text || "",
      website: rich.website || "",
      photos: Array.isArray(rich.photos) ? rich.photos : [],
      author: row.author || fallback.author || "Пользователь",
      userId: row.user_id || fallback.userId || null,
      likes: Number(row.likes_count ?? fallback.likes ?? 0),
      views: Number(row.views ?? fallback.views ?? 0),
      comments: Array.isArray(fallback.comments) ? fallback.comments : [],
      fromDB: true,
    };
  };
  const handleSaveEvent = async (payload) => {
    if (!user) { handleLogin(); return; }
    if (!selEC?.id) return;
    if (editingEvent && !canManageEvent(editingEvent)) {
      alert("Редактировать событие может только автор или админ.");
      return;
    }
    const title = String(payload?.title || "").trim();
    const date = String(payload?.date || "").trim();
    const location = normalizeAddressText(String(payload?.location || "").trim());
    const desc = limitCardText(String(payload?.desc || ""));
    const photos = Array.isArray(payload?.photos) ? payload.photos.filter((x) => typeof x === "string" && x.startsWith("http")) : [];
    if (!title || !date || !location || !desc) return;

    setEventSaving(true);
    try {
      const dbPayload = {
        category: selEC.id,
        title,
        date,
        location,
        description: encodeRichText(desc, photos, { website: editingEvent?.website || "" }),
        author: editingEvent?.author || user.name || "Пользователь",
        user_id: editingEvent?.userId || user.id,
      };
      const saveResult = editingEvent
        ? await dbUpdateEvent(editingEvent.id, dbPayload)
        : await dbAddEvent(dbPayload);
      const { data, error } = saveResult || {};
      if (error) {
        alert(error.message || "Не удалось сохранить событие");
        return;
      }
      const row = data?.[0];
      if (!row) {
        alert("Не удалось сохранить событие");
        return;
      }
      const mapped = mapDbEventToState(row, editingEvent || {});
      if (editingEvent) {
        setEvents((prev) => prev.map((ev) => (ev.id === editingEvent.id ? mapped : ev)));
      } else {
        setEvents((prev) => [mapped, ...prev]);
      }
      setEditingEvent(null);
      setShowAddEvent(false);
    } finally {
      setEventSaving(false);
    }
  };
  const handleDeleteEvent = async () => {
    if (!editingEvent?.id) return;
    if (!canManageEvent(editingEvent)) {
      alert("Удалять событие может только автор или админ.");
      return;
    }
    if (!confirm("Удалить это событие?")) return;
    setEventSaving(true);
    try {
      const { error } = await dbDeleteEvent(editingEvent.id);
      if (error) {
        alert(error.message || "Не удалось удалить событие");
        return;
      }
      setEvents((prev) => prev.filter((ev) => ev.id !== editingEvent.id));
      if (exp === `ev-${editingEvent.id}`) setExp(null);
      setShowAddEvent(false);
      setEditingEvent(null);
    } finally {
      setEventSaving(false);
    }
  };
  const handleAddHousing = async () => {
    if (!user) { handleLogin(); return; }
    if (!newHousing.address.trim() || !newHousing.minPrice) return;
    if (editingHousing && !canManageHousing(editingHousing)) {
      alert("Редактировать жильё может только автор или админ.");
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
      ? await saveFn(editingHousing.id, payload, isAdmin ? null : user.id)
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
    if (!canManageHousing(item)) {
      alert("Редактировать жильё может только автор или админ.");
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
    if (!canManageHousing(item)) {
      alert("Удалять жильё может только автор или админ.");
      return;
    }
    if (!confirm("Удалить это жильё?")) return;
    const { error } = await dbDeleteHousing(housingId, isAdmin ? null : user.id);
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

  const startTest = () => {
    civicsTest.start();
    setScr("test");
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
  const canManageActiveHousing = canManageHousing(activeHousing);
  const jobsFiltered = jobsItems
    .filter((item) => item.type === jobsTab)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const formatJobDate = (value) => {
    try {
      const dt = new Date(value);
      if (Number.isNaN(dt.getTime())) return "";
      return dt.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };
  const resetJobForm = (type = jobsTab) => {
    setNewJob({
      type,
      title: "",
      district: "",
      price: "",
      schedule: "full-time",
      category: "",
      desc: "",
      telegram: "",
      phone: "",
    });
  };
  const handleAddJob = () => {
    const title = String(newJob.title || "").trim();
    const district = String(newJob.district || "").trim();
    const price = String(newJob.price || "").trim();
    const desc = String(newJob.desc || "").trim();
    if (!title || !district || !price || !desc) return;
    if (!user) return;

    const next = {
      id: `job-${Date.now()}`,
      type: newJob.type === "service" ? "service" : "vacancy",
      title,
      district,
      price,
      schedule: String(newJob.schedule || "").trim(),
      category: String(newJob.category || "").trim(),
      desc,
      telegram: String(newJob.telegram || "").trim(),
      phone: String(newJob.phone || "").trim(),
      author: user.name || "Пользователь",
      userId: user.id || null,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    setJobsItems((prev) => [next, ...prev]);
    setShowAddJob(false);
    resetJobForm(next.type);
  };
  useEffect(() => {
    if (scr !== "place-item" || !activePlace?.id || !activePlace?.fromDB) return;
    if (viewedRef.current.place === activePlace.id) return;
    viewedRef.current.place = activePlace.id;
    trackView("place", activePlace);
  }, [scr, activePlace, trackView]);
  useEffect(() => {
    if (scr !== "place-item") viewedRef.current.place = null;
  }, [scr]);
  useEffect(() => {
    if (scr !== "housing-item" || !activeHousing?.id || !activeHousing?.fromDB) return;
    if (viewedRef.current.housing === activeHousing.id) return;
    viewedRef.current.housing = activeHousing.id;
    trackView("housing", activeHousing);
  }, [scr, activeHousing, trackView]);
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
  const getEventDateBadge = (value) => {
    try {
      const dt = new Date(value);
      if (Number.isNaN(dt.getTime())) return { dow: "—", day: "--", month: "—" };
      const dow = dt.toLocaleDateString("ru-RU", { weekday: "short" }).replace(".", "");
      const month = dt.toLocaleDateString("ru-RU", { month: "short" }).replace(".", "");
      return {
        dow: dow.toUpperCase(),
        day: String(dt.getDate()),
        month,
      };
    } catch {
      return { dow: "—", day: "--", month: "—" };
    }
  };
  const getEventTimeLabel = (value) => {
    try {
      const dt = new Date(value);
      if (Number.isNaN(dt.getTime())) return "";
      return dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };
  const eventCardPalettes = [
    { bg: "#FDF1DB", text: "#17324D" },
    { bg: "#EAF6EE", text: "#17324D" },
    { bg: "#EEF2FC", text: "#17324D" },
    { bg: "#FCEAEA", text: "#17324D" },
  ];

  useEffect(() => {
    if (!showAdd && !showAddTip && !showAddEvent && !showAddHousing && !showAddJob) return;
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;
    const prevTouchAction = document.body.style.touchAction;
    const scrollY = window.scrollY || 0;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      document.body.style.touchAction = prevTouchAction;
      window.scrollTo(0, scrollY);
    };
  }, [showAdd, showAddTip, showAddEvent, showAddHousing, showAddJob]);

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
    <div style={{ minHeight:"100vh", background:T.bg, color:T.text, maxWidth:480, margin:"0 auto", touchAction:"manipulation" }}>
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
            onSubmit={supportRequests.sendSupportRequest}
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
            onOpenCategory={(category) => { setSelU(category); setScr("uscis-cat"); setExpF(null); }}
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
            userCoords={geoCoords}
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
          onSelectPlaceNameSuggestion={onSelectPlaceNameSuggestion}
          onSelectPlaceAddressSuggestion={onSelectPlaceAddressSuggestion}
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
                <div style={{ marginTop:10, display:"flex", alignItems:"center", justifyContent:"flex-start", gap:10 }}>
                  <span style={{ fontSize:11, color:T.light }}>от {p.addedBy}</span>
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
                <button onClick={()=> handleNativeShare({title:activePlace.name,text:activePlace.tip,url:window.location.href})} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", color:T.mid, padding:0, display:"inline-flex", alignItems:"center", justifyContent:"center" }} title="Поделиться"><ShareIcon size={18} /></button>
              </div>

              {renderComments(activePlace, "place", addPlaceComment)}

              {canManagePlace(activePlace) && (
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
              {tipsSearchResults.map((tip) => (
                <TipCard
                  key={tip.id}
                  tip={tip}
                  isExpanded={expTip === tip.id}
                  isLiked={!!liked[`tip-${tip.id}`]}
                  isFavorited={!!favorites[`tip-${tip.id}`]}
                  canEdit={false}
                  categoryLabel={TIPS_CATS.find((c) => c.id === tip.cat)?.title || ""}
                  marginBottom={0}
                  T={T}
                  cd={cd}
                  pl={pl}
                  onToggleExpand={(open) => {
                    setExpTip(open ? tip.id : null);
                    if (open) trackView("tip", tip);
                  }}
                  onOpenPhoto={(photos, pi) => openPhotoViewer(photos, pi)}
                  onToggleFavorite={() => toggleFavorite(tip.id, "tip")}
                  onToggleLike={() => handleToggleLike(tip.id, "tip")}
                  onOpenComments={() => setShowComments(`tip-${tip.id}`)}
                  onShare={() =>
                    handleNativeShare({ title: tip.title, text: tip.text, url: window.location.href })
                  }
                  onEdit={() => {}}
                  onDelete={() => {}}
                  renderComments={renderComments}
                  handleAddComment={handleAddComment}
                />
              ))}
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
              onClick={openAddTipForm}
              style={{ width:38, height:38, borderRadius:12, border:`1.5px solid ${T.primary}55`, background:T.primaryLight, color:T.primary, fontSize:28, lineHeight:1, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 }}
              title="Добавить"
            >
              +
            </button>
          </div>
          {catTips.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              isExpanded={expTip === tip.id}
              isLiked={!!liked[`tip-${tip.id}`]}
              isFavorited={!!favorites[`tip-${tip.id}`]}
              canEdit={canManageTip(tip)}
              T={T}
              cd={cd}
              pl={pl}
              onToggleExpand={(open) => {
                setExpTip(open ? tip.id : null);
                if (open) trackView("tip", tip);
              }}
              onOpenPhoto={(photos, pi) => openPhotoViewer(photos, pi)}
              onToggleFavorite={() => toggleFavorite(tip.id, "tip")}
              onToggleLike={() => handleToggleLike(tip.id, "tip")}
              onOpenComments={() => setShowComments(`tip-${tip.id}`)}
              onShare={() =>
                handleNativeShare({ title: tip.title, text: tip.text, url: window.location.href })
              }
              onEdit={() => startEditTip(tip)}
              onDelete={() => handleDeleteTip(tip.id)}
              renderComments={renderComments}
              handleAddComment={handleAddComment}
            />
          ))}
          <button onClick={openAddTipForm} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Поделиться опытом</button>
        </div>)}

        {/* ADD TIP MODAL */}
        <TipFormModal
          showAddTip={showAddTip}
          selTC={selTC}
          setShowAddTip={setShowAddTip}
          setNewTipPhotos={setNewTipPhotos}
          setEditingTip={setEditingTip}
          cd={cd}
          T={T}
          editingTip={editingTip}
          newTip={newTip}
          setNewTip={setNewTip}
          iS={iS}
          CARD_TEXT_MAX={CARD_TEXT_MAX}
          tipFileRef={tipFileRef}
          handleTipPhotos={handleTipPhotos}
          newTipPhotos={newTipPhotos}
          pl={pl}
          canManageTip={canManageTip}
          handleDeleteTip={handleDeleteTip}
          handleAddTip={handleAddTip}
        />
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
              onClick={() => { if (!user) { handleLogin(); return; } setEditingEvent(null); setShowAddEvent(true); }}
              style={{ width:38, height:38, borderRadius:12, border:`1.5px solid ${T.primary}55`, background:T.primaryLight, color:T.primary, fontSize:28, lineHeight:1, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 }}
              title="Добавить событие"
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
                  <button key={d.toISOString().slice(0, 10)} onClick={() => setFilterDate(isActive ? null : d.toISOString())}
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
          {catEvents.map((ev, i) => { const isEvExp = exp === `ev-${ev.id}`; const isF = favorites[`event-${ev.id}`]; const eventWebsite = normalizeExternalUrl(ev.website); const dateBadge = getEventDateBadge(ev.date); const eventTime = getEventTimeLabel(ev.date); const cardPalette = eventCardPalettes[i % eventCardPalettes.length]; const goingCount = Math.max(Number(ev.likes) || 0, 0); return (<div key={ev.id} style={{ ...cd, marginBottom:12, overflow:"hidden", borderColor:isEvExp?T.primary+"40":T.borderL, padding:0 }}>
            <div onClick={() => { const nextOpen = !isEvExp; setExp(nextOpen ? `ev-${ev.id}` : null); if (nextOpen) trackView("event", ev); }} style={{ padding:"14px 14px 12px", cursor:"pointer", background:T.card }}>
              <div style={{ display:"flex", alignItems:"stretch", gap:12 }}>
                <div style={{ width:72, minWidth:72, borderRadius:18, background:cardPalette.bg, color:cardPalette.text, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"8px 6px", textAlign:"center", boxSizing:"border-box" }}>
                  <div style={{ fontSize:14, lineHeight:1, fontWeight:700, color:"#8D97AC", marginBottom:4 }}>{dateBadge.dow}</div>
                  <div style={{ fontSize:24, lineHeight:1, fontWeight:800, letterSpacing:"-0.02em", marginBottom:4 }}>{dateBadge.day}</div>
                  <div style={{ fontSize:14, lineHeight:1, fontWeight:700, color:"#8D97AC" }}>{dateBadge.month}</div>
                </div>
                <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:800, fontSize:16, lineHeight:1.22, color:T.text, marginBottom:6, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ev.title}</div>
                      <div style={{ fontSize:13, color:"#8D97AC", display:"flex", alignItems:"center", gap:6, minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        <span style={{ color:"#F26AA0", fontSize:12, lineHeight:1 }}>📍</span>
                        <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>{ev.location || "Локация уточняется"}{eventTime ? ` · ${eventTime}` : ""}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:10, marginTop:12 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:T.primary }}>
                      {goingCount} человек идет
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                      <button
                        onClick={(e)=>{e.stopPropagation(); toggleFavorite(ev.id,"event");}}
                        style={{ width:28, height:28, borderRadius:999, border:"none", background:"#F6F7FB", cursor:"pointer", fontFamily:"inherit", color:isF ? "#D68910" : "#A7AFBF", padding:0, display:"flex", alignItems:"center", justifyContent:"center" }}
                        title="Избранное"
                      >
                        <StarIcon active={!!isF} size={14} />
                      </button>
                      <button
                        onClick={(e)=>{e.stopPropagation(); toggleLike(ev.id,"event");}}
                        style={{ minWidth:38, height:28, borderRadius:999, border:"none", background:"#FFF2F0", cursor:"pointer", fontFamily:"inherit", color:liked[`event-${ev.id}`]?"#E74C3C":"#D37A7A", padding:"0 9px", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:4, fontSize:12, fontWeight:700 }}
                        title="Лайк"
                      >
                        <HeartIcon active={!!liked[`event-${ev.id}`]} size={13} /> {ev.likes}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {isEvExp && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${T.borderL}` }}>
                  {ev.location && (
                    <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                      <button onClick={(e)=>{e.stopPropagation(); openEventMap(ev.location, "google");}} style={{ ...pl(false), padding:"8px 10px", fontSize:12 }}>Google Maps</button>
                      <button onClick={(e)=>{e.stopPropagation(); openEventMap(ev.location, "apple");}} style={{ ...pl(false), padding:"8px 10px", fontSize:12 }}>Apple Maps</button>
                    </div>
                  )}
                  {eventWebsite && (
                    <a href={eventWebsite} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} style={{ display:"inline-block", fontSize:13, color:T.primary, textDecoration:"none", marginBottom:10 }}>
                      Сайт мероприятия
                    </a>
                  )}
                  <div style={{ fontSize:13, lineHeight:1.6, color:T.mid, marginBottom:10, whiteSpace:"pre-wrap", overflowWrap:"anywhere", wordBreak:"break-word" }}>{limitCardText(ev.desc)}</div>
                  {ev.photos?.length > 0 && (
                    <div style={{ display:"flex", gap:8, overflowX:"auto", marginBottom:10, paddingBottom:4, scrollSnapType:"x mandatory" }}>
                      {ev.photos.map((ph, pi) => (
                        <img key={pi} src={ph} alt="" style={{ width:86, height:86, objectFit:"cover", borderRadius:10, border:`1px solid ${T.border}`, cursor:"zoom-in", flexShrink:0, scrollSnapAlign:"start" }} onClick={(e)=>{e.stopPropagation(); openPhotoViewer(ev.photos, pi);}} />
                      ))}
                    </div>
                  )}
                  {ev.photos?.length > 1 && <div style={{ fontSize:11, color:T.light, marginTop:-6, marginBottom:8 }}>Листайте фото →</div>}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:11, color:T.light }}>от {ev.author}</span>
                    <span style={{ fontSize:10, color:isEvExp?T.primary:T.light, transform:isEvExp?"rotate(180deg)":"", transition:"0.3s" }}>▼</span>
                  </div>
                </div>
              )}
            </div>
            {isEvExp && (<div style={{ borderTop:`1px solid ${T.borderL}` }}>
              <div style={{ padding:"14px 16px 10px", display:"flex", justifyContent:"flex-end", alignItems:"center" }}>
                <button onClick={(e)=>{e.stopPropagation(); handleNativeShare({ title:ev.title, text:ev.desc, url:window.location.href });}} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", color:T.mid, padding:0, display:"inline-flex", alignItems:"center", justifyContent:"center" }} title="Поделиться"><ShareIcon size={18} /></button>
              </div>
              {renderComments(ev, "event", addEventComment)}
              {canManageEvent(ev) && (
                <div style={{ padding:"0 16px 16px" }}>
                  <button
                    onClick={(e)=>{ e.stopPropagation(); startEditEvent(ev); }}
                    style={{ width:"100%", padding:"11px 0", borderRadius:24, border:`1.5px solid ${T.primary}55`, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, background:T.primaryLight, color:T.primary }}
                  >
                    ✏️ Редактировать событие
                  </button>
                </div>
              )}
            </div>)}
          </div>); })}
          {catEvents.length===0 && <p style={{ fontSize:13, color:T.mid, textAlign:"center", padding:20 }}>Пока нет событий в этой категории</p>}
          <button onClick={() => { if (!user) { handleLogin(); return; } setEditingEvent(null); setShowAddEvent(true); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Добавить событие</button>
        </div>)}
        <EventCreateModal
          open={showAddEvent}
          onClose={() => { if (!eventSaving) { setShowAddEvent(false); setEditingEvent(null); } }}
          onSubmit={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onUploadPhoto={uploadPhoto}
          fetchAddressSuggestions={fetchAddressSuggestions}
          submitting={eventSaving}
          categoryTitle={selEC?.title || ""}
          cardTextMax={CARD_TEXT_MAX}
          palette={T}
          initialData={editingEvent}
        />
        {/* JOBS */}
        {scr==="jobs" && (<div>
          <button onClick={goHome} style={bk}>← Главная</button>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, margin:"4px 0 12px" }}>
            <h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>💼 Работа в LA</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <button
              onClick={() => setJobsTab("vacancy")}
              style={{ ...cd, padding:"18px 14px", border:`1px solid ${jobsTab==="vacancy"?`${T.primary}55`:T.border}`, boxShadow:jobsTab==="vacancy"?T.shH:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left", background:jobsTab==="vacancy"?T.primaryLight:T.card }}
            >
              <div style={{ fontSize:24, marginBottom:8 }}>💼</div>
              <div style={{ fontSize:16, fontWeight:700, color:T.text, marginBottom:2 }}>Вакансии</div>
              <div style={{ fontSize:12, color:T.mid }}>Поиск работы</div>
            </button>
            <button
              onClick={() => setJobsTab("service")}
              style={{ ...cd, padding:"18px 14px", border:`1px solid ${jobsTab==="service"?`${T.primary}55`:T.border}`, boxShadow:jobsTab==="service"?T.shH:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left", background:jobsTab==="service"?T.primaryLight:T.card }}
            >
              <div style={{ fontSize:24, marginBottom:8 }}>🛠️</div>
              <div style={{ fontSize:16, fontWeight:700, color:T.text, marginBottom:2 }}>Услуги</div>
              <div style={{ fontSize:12, color:T.mid }}>Услуги специалистов</div>
            </button>
          </div>
          <div style={{ ...cd, padding:"18px 14px", border:`1px solid ${T.border}`, boxShadow:"none" }}>
            <div style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:6 }}>
              {jobsTab === "vacancy" ? "Вакансии" : "Услуги"}
            </div>
            <div style={{ fontSize:13, color:T.mid, lineHeight:1.5 }}>
              Внутренности этого подраздела пока очищены. Следующим шагом соберем новую структуру именно для {jobsTab === "vacancy" ? "вакансий" : "услуг"}.
            </div>
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
                    <button onClick={() => handleNativeShare({ title:activeHousing.title, text:`${activeHousing.address} · $${formatHousingPrice(activeHousing.minPrice)}`, url:window.location.href })} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", color:T.mid, padding:0, display:"inline-flex", alignItems:"center", justifyContent:"center" }} title="Поделиться"><ShareIcon size={18} /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ADD HOUSING MODAL */}
        {showAddHousing && (
          <div
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:10000, display:"flex", alignItems:"flex-end", justifyContent:"center", touchAction:"none", pointerEvents:"auto", isolation:"isolate" }}
            onClick={()=>{ setShowAddHousing(false); setEditingHousing(null); setAddrOptionsHousing([]); setAddrValidHousing(false); }}
            onTouchMove={(e)=>{ if (e.target === e.currentTarget) e.preventDefault(); }}
            onWheel={(e)=>{ if (e.target === e.currentTarget) e.preventDefault(); }}
          >
            <div style={{ ...cd, position:"relative", zIndex:1, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto", overscrollBehavior:"contain", touchAction:"pan-y", WebkitOverflowScrolling:"touch" }} onClick={e=>e.stopPropagation()}>
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
                  <div key={`${p.preview || p.name || 'photo'}-${p.file?.lastModified || ''}-${p.file?.size || ''}`} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>
                    <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    <button onClick={()=>setNewHousingPhotos((pr)=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>✕</button>
                  </div>
                ))}
                {newHousingPhotos.length < 10 && <button onClick={()=>housingFileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>＋ Фото (до 10)</button>}
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>{ setShowAddHousing(false); setEditingHousing(null); setAddrOptionsHousing([]); setAddrValidHousing(false); }} style={{ ...pl(false), flex:1, padding:14 }}>Отмена</button>
              {editingHousing && canManageHousing(editingHousing) && <button onClick={() => handleDeleteHousing(editingHousing.id)} style={{ ...pl(false), flex:1, padding:14, border:"1.5px solid #fecaca", color:"#E74C3C", background:"#FFF5F5" }}>Удалить</button>}
                <button onClick={handleAddHousing} disabled={!newHousing.address.trim() || !newHousing.minPrice} style={{ ...pl(true), flex:2, padding:14, opacity:(!newHousing.address.trim() || !newHousing.minPrice) ? 0.5 : 1 }}>{editingHousing ? "Сохранить" : "Опубликовать"}</button>
              </div>
            </div>
          </div>
        )}

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

