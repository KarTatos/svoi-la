'use client';
import { useCallback, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { addPlace as dbAddPlace, updatePlace as dbUpdatePlace, deletePlace as dbDeletePlace, addTip as dbAddTip, updateTip as dbUpdateTip, deleteTip as dbDeleteTip, addEvent as dbAddEvent, updateEvent as dbUpdateEvent, deleteEvent as dbDeleteEvent, addHousing as dbAddHousing, updateHousing as dbUpdateHousing, deleteHousing as dbDeleteHousing, addComment as dbAddComment, updateComment as dbUpdateComment, deleteComment as dbDeleteComment, toggleLike as dbToggleLike, uploadPhoto, syncUserDisplayName } from "../lib/supabase";

import { T, DISTRICTS, PLACE_CATS, PLACE_CAT_IDS, USCIS_CATS, CIVICS_RAW, shuffleTest, TIPS_CATS, EVENT_CATS, SECTIONS, RICH_PREFIX, CARD_TEXT_MAX, limitCardText, twoLineClampStyle, encodeRichText, decodeRichText, getUscisPdfUrl, HeartIcon, HomeIcon, CalendarIcon, StarIcon, ShareIcon, decodeHousingPhotos, encodeHousingPhotos, formatPlaceAddressLabel, normalizePhotoList } from "./svoi/config";
import JobsScreen from "./svoi/screens/JobsScreen";
import MarketScreen from "./svoi/screens/MarketScreen";
import EventsScreen from "./svoi/screens/EventsScreen";
import { useAuth } from "../hooks/useAuth";
import { useSupportRequests } from "../hooks/useSupportRequests";
import { useProfileWeather } from "../hooks/useProfileWeather";
import { useUscisNews } from "../hooks/useUscisNews";
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
import TipsScreen from "./svoi/screens/TipsScreen";
import HousingScreen from "./svoi/screens/HousingScreen";
import HousingItemScreen from "./svoi/screens/HousingItemScreen";
import AppHeader from "./svoi/layout/AppHeader";
import BottomNav from "./svoi/layout/BottomNav";
import PlaceFormModal from "./svoi/forms/PlaceFormModal";
import TipFormModal from "./svoi/forms/TipFormModal";
import EventCreateModal from "./svoi/forms/EventCreateModal";
import UscisPdfModal from "./svoi/modals/UscisPdfModal";
import PlacesMapModal from "./svoi/modals/PlacesMapModal";
import PhotoViewerModal from "./svoi/modals/PhotoViewerModal";
import CommentsBlock from "./svoi/comments/CommentsBlock";
import { useUiStore } from "../store/uiStore";
import { useJobsQuery } from "../hooks/queries/useJobsQuery";
import { useMarketQuery } from "../hooks/queries/useMarketQuery";
import { useJobMutations } from "../hooks/queries/useJobMutations";
import { useMarketMutations } from "../hooks/queries/useMarketMutations";
import { usePostsQuery } from "../hooks/queries/usePostsQuery";
import { usePostMutations } from "../hooks/queries/usePostMutations";
import CommunityScreen from "./svoi/screens/CommunityScreen";

const ADMIN_EMAILS = String(process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((x) => x.trim().toLowerCase())
  .filter(Boolean);

export default function App() {
  const queryClient = useQueryClient();
  const [scr, setScr] = useSessionState("scr", "home", {
    serialize: (value) => String(value || ""),
    deserialize: (raw) => String(raw || ""),
  });
  const [selU, setSelU] = useState(null);
  const [selD, setSelD] = useSessionState("selD", null);
  const [selPC, setSelPC] = useSessionState("selPC", null);
  const [selPlace, setSelPlace] = useState(null);
  const [selTC, setSelTC] = useState(null);
  const tipsSearchInput = useUiStore((s) => s.tipsSearchInput);
  const setTipsSearchInput = useUiStore((s) => s.setTipsSearchInput);
  const tipsSearchApplied = useUiStore((s) => s.tipsSearchApplied);
  const setTipsSearchApplied = useUiStore((s) => s.setTipsSearchApplied);
  const housingBedsFilter = useUiStore((s) => s.housingBedsFilter);
  const setHousingBedsFilter = useUiStore((s) => s.setHousingBedsFilter);
  const housingSortByFavorites = useUiStore((s) => s.housingSortByFavorites);
  const setHousingSortByFavorites = useUiStore((s) => s.setHousingSortByFavorites);
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
  const placeSortField = useUiStore((s) => s.placeSortField);
  const setPlaceSortField = useUiStore((s) => s.setPlaceSortField);
  const placeSortDir = useUiStore((s) => s.placeSortDir);
  const setPlaceSortDir = useUiStore((s) => s.setPlaceSortDir);
  const [miniMapLoading, setMiniMapLoading] = useState(false);
  const [miniMapError, setMiniMapError] = useState("");
  const [miniMapPlaces, setMiniMapPlaces] = useState([]);
  const [miniSelectedPlaceId, setMiniSelectedPlaceId] = useState(null);
  const [miniRouteInfo, setMiniRouteInfo] = useState(null);
  const [miniRouteLoading, setMiniRouteLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const favorites = useUiStore((s) => s.favorites);
  const setFavorites = useUiStore((s) => s.setFavorites);
  const [likedTips, setLikedTips] = useState({});
  const [srch, setSrch] = useState("");
  const { user, authReady, signIn, signOut: authSignOut, isAdmin, updateDisplayName } = useAuth(ADMIN_EMAILS);
  const {
    places, setPlaces,
    tips, setTips,
    events, setEvents,
    housing, setHousing,
    liked, setLiked,
  } = useAppData({ user, authReady, screen: scr });
  const { data: jobs = [] } = useJobsQuery(authReady);
  const { data: market = [] } = useMarketQuery(authReady);
  const { data: posts = [], error: postsError } = usePostsQuery(authReady && scr === "community-chat");
  const { addJobMutation, updateJobMutation, deleteJobMutation } = useJobMutations();
  const { addMarketMutation, updateMarketMutation, deleteMarketMutation } = useMarketMutations();
  const { addPostMutation, updatePostMutation, deletePostMutation } = usePostMutations();
  const [showComments, setShowComments] = useState(null);
  const [selEC, setSelEC] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventSaving, setEventSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showAddHousing, setShowAddHousing] = useState(false);
  const [editingHousing, setEditingHousing] = useState(null);
  const [newHousing, setNewHousing] = useState({ address:"", district:"", type:"studio", minPrice:"", comment:"", telegram:"", messageContact:"" });
  const [newHousingPhotos, setNewHousingPhotos] = useState([]);
  const [filterDate, setFilterDate] = useState(null);
  const [addrOptionsPlace, setAddrOptionsPlace] = useState([]);
  const [nameOptionsPlace, setNameOptionsPlace] = useState([]);
  const [addrOptionsHousing, setAddrOptionsHousing] = useState([]);
  const [addrLoadingPlace, setAddrLoadingPlace] = useState(false);
  const [nameLoadingPlace, setNameLoadingPlace] = useState(false);
  const [addrLoadingHousing, setAddrLoadingHousing] = useState(false);
  const [addrValidPlace, setAddrValidPlace] = useState(false);
  const [addrValidHousing, setAddrValidHousing] = useState(false);
  const photoViewer = useUiStore((s) => s.photoViewer);
  const setPhotoViewer = useUiStore((s) => s.setPhotoViewer);
  const photoZoom = useUiStore((s) => s.photoZoom);
  const setPhotoZoom = useUiStore((s) => s.setPhotoZoom);
  const resetUi = useUiStore((s) => s.resetUi);
  const [chat, setChat] = useState([{ role:"assistant", text:"Здравствуйте. Задайте вопрос по USCIS, местам, событиям, советам или жилью." }]);
  const [inp, setInp] = useState("");
  const [typing, setTyping] = useState(false);
  const [mt, setMt] = useState(false);
  const { profileLocation, profileWeather, userCoords: geoCoords } = useProfileWeather();
  const { news: uscisNews } = useUscisNews();
  const [selHousing, setSelHousing] = useState(null);
  const [housingTextCollapsed, setHousingTextCollapsed] = useState(false);
  useSvoiRouter({
    scr,
    setScr,
    user,
    selPlace,
    places,
    selHousing,
    housing,
  });
  // Трекинг просмотренных событий на этом устройстве (должен быть ДО trackView)
  const seenEventIds = useRef(
    new Set(JSON.parse(typeof window !== "undefined" ? (localStorage.getItem("seenEventIds") || "[]") : "[]"))
  );
  const markEventSeen = useCallback((id) => {
    seenEventIds.current.add(String(id));
    try { localStorage.setItem("seenEventIds", JSON.stringify([...seenEventIds.current])); } catch {}
  }, []);

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
        markEventSeen(id);
      } else if (itemType === "housing") {
        setHousing((prev) => prev.map(updater));
        setSelHousing((prev) => (prev?.id === id ? { ...prev, views: newViews } : prev));
      }
    },
    [user?.id, setPlaces, setTips, setEvents, setHousing, markEventSeen]
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
  const canManagePost = (item) => canManageByOwnership(item?.userId, item?.author);
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
  }, [user?.id, setFavorites]);

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
  const housingFileRef = useRef(null);
  const mapContainerRef = useRef(null);
  const miniMapContainerRef = useRef(null);
  const googleMapRef = useRef(null);
  const miniGoogleMapRef = useRef(null);
  const googleMarkersRef = useRef([]);
  const googleUserMarkerRef = useRef(null);
  const miniGoogleMarkersRef = useRef([]);
  const miniGoogleUserMarkerRef = useRef(null);
  const googleDirectionsRendererRef = useRef(null);
  const miniGoogleDirectionsRendererRef = useRef(null);
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

  const goHome = () => { setScr("home"); setSelU(null); setSelD(null); setSelPC(null); setSelPlace(null); setSelTC(null); setSelEC(null); setSelHousing(null); setExp(null); setExpF(null); setExpTip(null); setMapP(null); setShowMapModal(false); setMapPlaces([]); setSelectedMapPlace(null); setMiniSelectedPlaceId(null); setMiniRouteInfo(null); setMiniRouteLoading(false); setSrch(""); resetUi(); setShowAdd(false); resetTipForm(); setShowAddEvent(false); setEditingEvent(null); setShowAddHousing(false); setEditingHousing(null); setNewHousing({ address:"", district:"", type:"studio", minPrice:"", comment:"", telegram:"", messageContact:"" }); setNewHousingPhotos([]); setAddrValidHousing(false); setAddrOptionsHousing([]); setEditingPlace(null); setFilterDate(null); };
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
      const photos = Array.isArray(prev?.photos) ? prev.photos : [];
      if (!prev || photos.length < 2) return prev;
      const currentIndex = Number.isInteger(prev.index) ? prev.index : 0;
      const nextIndex = (currentIndex - 1 + photos.length) % photos.length;
      return { ...prev, index: nextIndex, photos };
    });
    setPhotoZoom(1);
  };
  const goNextPhoto = () => {
    setPhotoViewer((prev) => {
      const photos = Array.isArray(prev?.photos) ? prev.photos : [];
      if (!prev || photos.length < 2) return prev;
      const currentIndex = Number.isInteger(prev.index) ? prev.index : 0;
      const nextIndex = (currentIndex + 1) % photos.length;
      return { ...prev, index: nextIndex, photos };
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
        if (googleUserMarkerRef.current) {
          googleUserMarkerRef.current.setMap(null);
          googleUserMarkerRef.current = null;
        }

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

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (disposed) return;
              const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              googleUserMarkerRef.current = new maps.Marker({
                position: coords,
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
              bounds.extend(coords);
            },
            () => {},
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 },
          );
        }

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
    if (googleUserMarkerRef.current) {
      googleUserMarkerRef.current.setMap(null);
      googleUserMarkerRef.current = null;
    }
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
  }, [showMapModal, selectedMapPlace, mapLoading, mapPlaces]);

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
      return;
    }
    if (e.touches.length === 1 && photoSwipeRef.current.active && photoZoom <= 1.02) {
      const dx = e.touches[0].clientX - photoSwipeRef.current.startX;
      const dy = e.touches[0].clientY - photoSwipeRef.current.startY;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault();
      }
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
  const onPhotoTouchCancel = () => {
    photoSwipeRef.current.active = false;
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
  const handleUpdateDisplayName = async (nextName) => {
    await updateDisplayName(nextName);
    if (!user?.id || user.id === "local-owner") return;
    await syncUserDisplayName(user.id, nextName);

    const renameComments = (comments = []) =>
      comments.map((c) => (String(c.userId || "") === String(user.id) ? { ...c, author: nextName } : c));
    setPlaces((prev) => prev.map((p) => (
      String(p.userId || "") === String(user.id)
        ? { ...p, addedBy: nextName, comments: renameComments(p.comments) }
        : { ...p, comments: renameComments(p.comments) }
    )));
    setTips((prev) => prev.map((t) => (
      String(t.userId || "") === String(user.id)
        ? { ...t, author: nextName, comments: renameComments(t.comments) }
        : { ...t, comments: renameComments(t.comments) }
    )));
    setEvents((prev) => prev.map((e) => (
      String(e.userId || "") === String(user.id)
        ? { ...e, author: nextName, comments: renameComments(e.comments) }
        : { ...e, comments: renameComments(e.comments) }
    )));
    queryClient.setQueryData(["jobs"], (prev = []) => prev.map((j) => (String(j.user_id || "") === String(user.id) ? { ...j, author: nextName } : j)));
    queryClient.setQueryData(["market"], (prev = []) => prev.map((m) => (String(m.user_id || "") === String(user.id) ? { ...m, author: nextName } : m)));
    queryClient.setQueryData(["posts"], (prev = []) =>
      prev.map((p) => (
        String(p.userId || p.user_id || "") === String(user.id)
          ? { ...p, author: nextName, comments: renameComments(p.comments) }
          : { ...p, comments: renameComments(p.comments) }
      ))
    );
  };
  const handleAddComment = async (tipId, text) => {
    const trimmed = String(text || "").trim();
    if (!trimmed || !user) return;
    const { data } = await dbAddComment({ item_id:tipId, item_type:"tip", author:user.name, user_id:user.id, text:trimmed });
    const cId = data?.[0]?.id || Date.now();
    setTips(prev => prev.map(t => t.id === tipId ? { ...t, comments: [...(t.comments||[]), { id:cId, author:user.name, text:trimmed, userId:user.id }] } : t));
  };
  const addPlaceComment = async (placeId, text) => {
    const trimmed = String(text || "").trim();
    if (!trimmed || !user) return;
    const { data } = await dbAddComment({ item_id:placeId, item_type:"place", author:user.name, user_id:user.id, text:trimmed });
    const cId = data?.[0]?.id || Date.now();
    setPlaces(prev => prev.map(p => p.id === placeId ? { ...p, comments: [...(p.comments||[]), { id:cId, author:user.name, text:trimmed, userId:user.id }] } : p));
  };
  const addEventComment = async (eventId, text) => {
    const trimmed = String(text || "").trim();
    if (!trimmed || !user) return;
    const { data } = await dbAddComment({ item_id:eventId, item_type:"event", author:user.name, user_id:user.id, text:trimmed });
    const cId = data?.[0]?.id || Date.now();
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, comments: [...(e.comments||[]), { id:cId, author:user.name, text:trimmed, userId:user.id }] } : e));
  };
  const deleteCommentFn = async (itemId, commentId, type) => {
    await dbDeleteComment(commentId);
    const updater = (items) => items.map(item => item.id === itemId ? { ...item, comments: (item.comments||[]).filter(c => c.id !== commentId) } : item);
    if (type === "place") setPlaces(updater);
    else if (type === "tip") setTips(updater);
    else if (type === "event") setEvents(updater);
    else if (type === "post") queryClient.setQueryData(["posts"], updater);
  };
  const saveEditComment = async (itemId, commentId, type, text) => {
    const trimmed = String(text || "").trim();
    if (!trimmed) return;
    await dbUpdateComment(commentId, trimmed);
    const updater = (items) => items.map(item => item.id === itemId ? { ...item, comments: (item.comments||[]).map(c => c.id === commentId ? { ...c, text: trimmed } : c) } : item);
    if (type === "place") setPlaces(updater);
    else if (type === "tip") setTips(updater);
    else if (type === "event") setEvents(updater);
    else if (type === "post") {
      queryClient.setQueryData(["posts"], (prev = []) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, comments: (item.comments || []).map((c) => (c.id === commentId ? { ...c, text: trimmed } : c)) }
            : item
        )
      );
    }
  };
  const createPost = async (text) => {
    if (!user) { handleLogin(); return; }
    try {
      await addPostMutation.mutateAsync({
        text: String(text || "").trim(),
        author: user.name || user.email?.split("@")[0] || "Пользователь",
        user_id: user.id,
      });
    } catch (err) {
      throw new Error(err?.message || "Не удалось создать пост. Проверьте миграцию posts.");
    }
  };
  const updatePost = async (id, payload) => {
    try {
      await updatePostMutation.mutateAsync({ id, payload });
    } catch (err) {
      throw new Error(err?.message || "Не удалось обновить пост.");
    }
  };
  const deletePost = async (id) => {
    if (!window.confirm("Удалить пост?")) return;
    try {
      await deletePostMutation.mutateAsync(id);
    } catch (err) {
      alert(err?.message || "Не удалось удалить пост.");
    }
  };
  const addPostReply = async (postId, text) => {
    const trimmed = String(text || "").trim();
    if (!trimmed || !user) return;
    const { data } = await dbAddComment({ item_id: postId, item_type: "post", author: user.name, user_id: user.id, text: trimmed });
    const cId = data?.[0]?.id || Date.now();
    queryClient.setQueryData(["posts"], (prev = []) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), { id: cId, author: user.name, text: trimmed, userId: user.id }] }
          : post
      )
    );
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
      photos: normalizePhotoList(rich.photos),
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
    const photos = normalizePhotoList(payload?.photos);
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
    else if (itemType === "post") queryClient.setQueryData(["posts"], countUpdater);
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
  const housingSorted = housingSortByFavorites
    ? [...housingFiltered].sort((a, b) => {
        const aFav = favorites[`housing-${a.id}`] ? 1 : 0;
        const bFav = favorites[`housing-${b.id}`] ? 1 : 0;
        return bFav - aFav;
      })
    : housingFiltered;
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

  useEffect(() => {
    if (!showAdd && !showAddTip && !showAddEvent && !showAddHousing) return;
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
  }, [showAdd, showAddTip, showAddEvent, showAddHousing]);

  const renderComments = (item, type, addFn) => (
    <CommentsBlock
      item={item}
      type={type}
      T={T}
      iS={iS}
      pl={pl}
      user={user}
      onLogin={handleLogin}
      onAddComment={addFn}
      onEditComment={saveEditComment}
      onDeleteComment={deleteCommentFn}
    />
  );

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

  useEffect(() => {
    if (typeof document === "undefined") return;
    const bodyPrev = document.body.style.background;
    const htmlPrev = document.documentElement.style.background;
    if (scr === "community-chat") {
      document.body.style.background = "#000000";
      document.documentElement.style.background = "#000000";
    }
    return () => {
      document.body.style.background = bodyPrev;
      document.documentElement.style.background = htmlPrev;
    };
  }, [scr]);

  const cd = { background:T.card, borderRadius:T.r, boxShadow:T.sh, border:`1px solid ${T.borderL}`, transition:"all 0.25s ease" };
  const bk = { background:"none", border:"none", color:T.primary, fontSize:14, fontWeight:500, cursor:"pointer", padding:"12px 0 8px", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 };
  const pl = (a) => ({ padding:"10px 20px", borderRadius:24, border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", background:a?T.primary:T.primaryLight, color:a?"#fff":T.primary });
  const iS = { width:"100%", padding:"14px 16px", background:T.card, border:`1px solid ${T.border}`, borderRadius:T.rs, color:T.text, fontSize:16, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ minHeight:"var(--app-min-height, 100dvh)", background:scr==="community-chat" ? "#000000" : T.bg, color:T.text, maxWidth:480, margin:"0 auto", touchAction:"manipulation" }}>
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

      <main style={{ padding:"16px 16px calc(env(safe-area-inset-bottom) + var(--bottom-nav-reserve, 90px))", background:scr==="community-chat" ? "#000000" : "transparent" }}>

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
            onUpdateDisplayName={handleUpdateDisplayName}
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
            news={uscisNews}
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
            onOpenAdd={openAddForm}
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
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, margin:"4px 0 12px" }}>
            <button
              onClick={() => { setScr("district"); setSelPC(null); setSelPlace(null); }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 13,
                border: "none",
                background: "#FFFFFF",
                color: "#8E8E93",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                flexShrink: 0,
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
              title="Назад"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
                <h2 style={{ fontSize:19, fontWeight:700, margin:0, lineHeight:1.2 }}>{selPC.title}</h2>
              </div>
              <p style={{ fontSize:13, color:T.mid, margin:"2px 0 0" }}>{selD.name} · {cPlaces.length} мест</p>
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
                      <Image
                        key={pi}
                        src={ph}
                        alt=""
                        width={180}
                        height={105}
                        sizes="(max-width: 480px) 31vw, 180px"
                        unoptimized
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
                    <Image key={pi} src={ph} alt="" width={120} height={120} sizes="120px" unoptimized style={{ width:120, height:120, objectFit:"cover", borderRadius:12, border:`1px solid ${T.border}`, cursor:"zoom-in", flexShrink:0, scrollSnapAlign:"start" }} onClick={() => openPhotoViewer(activePlace.photos, pi)} />
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

        {scr==="tips" && (
          <TipsScreen
            T={T}
            cd={cd}
            pl={pl}
            iS={iS}
            selTC={selTC}
            setSelTC={setSelTC}
            tips={tips}
            tipsQuery={tipsQuery}
            tipsSearchInput={tipsSearchInput}
            setTipsSearchInput={setTipsSearchInput}
            tipsSearchApplied={tipsSearchApplied}
            tipsSearchResults={tipsSearchResults}
            expTip={expTip}
            setExpTip={setExpTip}
            liked={liked}
            favorites={favorites}
            goHome={goHome}
            trackView={trackView}
            openPhotoViewer={openPhotoViewer}
            toggleFavorite={toggleFavorite}
            handleToggleLike={handleToggleLike}
            setShowComments={setShowComments}
            handleNativeShare={handleNativeShare}
            renderComments={renderComments}
            handleAddComment={handleAddComment}
            canManageTip={canManageTip}
            startEditTip={startEditTip}
            handleDeleteTip={handleDeleteTip}
            openAddTipForm={openAddTipForm}
            applyTipsSearch={applyTipsSearch}
            catTips={catTips}
          />
        )}

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
        {scr === "events" && (
          <EventsScreen
            T={T} cd={cd} bk={bk} pl={pl}
            user={user}
            events={events}
            selEC={selEC}
            setSelEC={setSelEC}
            seenEventIds={seenEventIds}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            exp={exp}
            setExp={setExp}
            favorites={favorites}
            liked={liked}
            catEvents={catEvents}
            onGoHome={goHome}
            onRequireAuth={handleLogin}
            onToggleFavorite={(id, type) => toggleFavorite(id, type)}
            onToggleLike={(id, type) => toggleLike(id, type)}
            onTrackView={trackView}
            onOpenEventMap={openEventMap}
            onNativeShare={handleNativeShare}
            onOpenPhotoViewer={openPhotoViewer}
            onAddEvent={() => { setEditingEvent(null); setShowAddEvent(true); }}
            renderComments={(ev, type) => renderComments(ev, type, addEventComment)}
            canManageEvent={canManageEvent}
            onEditEvent={startEditEvent}
            normalizeExternalUrl={normalizeExternalUrl}
          />
        )}
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
        {scr === "jobs" && (
          <JobsScreen
            T={T} cd={cd} bk={bk} pl={pl} iS={iS}
            user={user}
            jobs={jobs}
            liked={liked}
            onGoHome={goHome}
            onToggleLike={(id, type) => handleToggleLike(id, type)}
            onShare={(job) => handleNativeShare({ title: job.title, text: job.description || "", url: window.location.href })}
            onRequireAuth={handleLogin}
            trackView={trackView}
            onAdd={async (payload) => {
              await addJobMutation.mutateAsync(payload);
            }}
            onUpdate={async (id, payload) => {
              await updateJobMutation.mutateAsync({ id, payload });
            }}
            onDelete={async (id) => {
              await deleteJobMutation.mutateAsync(id);
            }}
            canManage={(job) => canManageByOwnership(job?.user_id, job?.author)}
          />
        )}

        {/* SELL / MARKETPLACE */}
        {scr === "sell" && (
          <MarketScreen
            T={T} cd={cd} bk={bk} pl={pl} iS={iS}
            user={user}
            items={market}
            liked={liked}
            onGoHome={goHome}
            onToggleLike={(id, type) => handleToggleLike(id, type)}
            onShare={(item) => handleNativeShare({ title: item.title, text: item.description || "", url: window.location.href })}
            onRequireAuth={handleLogin}
            trackView={trackView}
            onAdd={async (payload) => {
              await addMarketMutation.mutateAsync(payload);
            }}
            onUpdate={async (id, payload) => {
              await updateMarketMutation.mutateAsync({ id, payload });
            }}
            onDelete={async (id) => {
              await deleteMarketMutation.mutateAsync(id);
            }}
            canManage={(item) => canManageByOwnership(item?.user_id, item?.author)}
            uploadPhoto={uploadPhoto}
          />
        )}

        {scr==="housing" && (
          <HousingScreen
            T={T}
            cd={cd}
            pl={pl}
            user={user}
            favorites={favorites}
            housingBedsFilter={housingBedsFilter}
            setHousingBedsFilter={setHousingBedsFilter}
            housingSortByFavorites={housingSortByFavorites}
            setHousingSortByFavorites={setHousingSortByFavorites}
            housingSorted={housingSorted}
            goHome={goHome}
            handleLogin={handleLogin}
            toggleFavorite={toggleFavorite}
            setHousingTextCollapsed={setHousingTextCollapsed}
            setSelHousing={setSelHousing}
            setScr={setScr}
            formatHousingPrice={formatHousingPrice}
            formatHousingType={formatHousingType}
            onOpenAddHousing={() => {
              setEditingHousing(null);
              setNewHousing({ address:"", district:"", type:"studio", minPrice:"", comment:"", telegram:"", messageContact:"" });
              setNewHousingPhotos([]);
              setAddrValidHousing(false);
              setAddrOptionsHousing([]);
              setShowAddHousing(true);
            }}
          />
        )}

        {scr==="housing-item" && activeHousing && (
          <HousingItemScreen
            T={T}
            pl={pl}
            favorites={favorites}
            liked={liked}
            activeHousing={activeHousing}
            housingTextCollapsed={housingTextCollapsed}
            setHousingTextCollapsed={setHousingTextCollapsed}
            setScr={setScr}
            openPhotoViewer={openPhotoViewer}
            openAddressInMaps={openAddressInMaps}
            openTelegramContact={openTelegramContact}
            openMessageContact={openMessageContact}
            canManageActiveHousing={canManageActiveHousing}
            startEditHousing={startEditHousing}
            toggleFavorite={toggleFavorite}
            handleToggleLike={handleToggleLike}
            handleNativeShare={handleNativeShare}
            formatHousingPrice={formatHousingPrice}
            formatHousingType={formatHousingType}
          />
        )}

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
                    <Image src={p.preview} alt="" fill sizes="60px" unoptimized style={{ objectFit:"cover", display:"block" }} />
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

        {scr==="community-chat" && (
          <CommunityScreen
            T={T}
            cd={cd}
            pl={pl}
            iS={iS}
            user={user}
            posts={posts}
            postsError={postsError}
            liked={liked}
            onGoHome={goHome}
            onLogin={handleLogin}
            onToggleLike={handleToggleLike}
            onCreatePost={createPost}
            onUpdatePost={updatePost}
            onDeletePost={deletePost}
            canManagePost={canManagePost}
            onAddReply={addPostReply}
            onEditReply={saveEditComment}
            onDeleteReply={deleteCommentFn}
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
        onTouchCancel={onPhotoTouchCancel}
      />

      <BottomNav
        scr={scr}
        setScr={setScr}
        user={user}
        onLogin={handleLogin}
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





