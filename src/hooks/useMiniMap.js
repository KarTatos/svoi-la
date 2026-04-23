import { useEffect, useRef, useState } from "react";

export function useMiniMap({
  scr,
  selPC,
  selD,
  places,
  placeCatIds,
  placeSortField,
  placeSortDir,
  favorites,
  miniSelectedPlaceId,
  setMiniSelectedPlaceId,
  setMiniRouteInfo,
  setMiniRouteLoading,
  ensureGoogleMapsApi,
  geocodePlace,
}) {
  const [miniMapLoading, setMiniMapLoading] = useState(false);
  const [miniMapError, setMiniMapError] = useState("");
  const [miniMapPlaces, setMiniMapPlaces] = useState([]);
  const [userCoords, setUserCoords] = useState(null);

  const miniMapContainerRef = useRef(null);
  const miniGoogleMapRef = useRef(null);
  const miniGoogleMarkersRef = useRef([]);
  const miniGoogleUserMarkerRef = useRef(null);
  const miniGoogleDirectionsRendererRef = useRef(null);

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
    const categoryPlaces = places.filter((p) => p.district === selD.id && p.cat === selPC.id && placeCatIds.has(p.cat));

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

    return () => {
      canceled = true;
    };
  }, [scr, selPC, selD, places, placeCatIds, geocodePlace, setMiniRouteInfo, setMiniRouteLoading, setMiniSelectedPlaceId]);

  useEffect(() => {
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
  }, [scr, selPC?.id, selD?.id, setMiniRouteInfo, setMiniRouteLoading, setMiniSelectedPlaceId]);

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

        const districtPlaces = places.filter((p) => p.district === selD?.id && p.cat === selPC.id && placeCatIds.has(p.cat));
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
          marker.addListener("click", () => {
            setMiniSelectedPlaceId(p.id);
          });
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
    return () => {
      disposed = true;
    };
  }, [scr, selPC, selD, miniMapLoading, miniMapPlaces, userCoords, places, favorites, placeSortField, placeSortDir, miniSelectedPlaceId, ensureGoogleMapsApi, placeCatIds, setMiniSelectedPlaceId]);

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
    return () => {
      canceled = true;
    };
  }, [scr, miniSelectedPlaceId, miniMapPlaces, setMiniRouteInfo, setMiniRouteLoading]);

  return {
    miniMapContainerRef,
    miniMapLoading,
    miniMapError,
    miniMapPlaces,
  };
}

