import { useEffect, useRef, useState } from "react";

export function usePlacesMap({
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
}) {
  const mapContainerRef = useRef(null);
  const googleMapRef = useRef(null);
  const googleMarkersRef = useRef([]);
  const googleDirectionsRendererRef = useRef(null);
  const mapUserMarkerRef = useRef(null);
  const [mapUserCoords, setMapUserCoords] = useState(null);
  const [mapReady, setMapReady] = useState(false);

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

  const requestUserCoords = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("no-geolocation"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 120000,
      });
    });

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
        setMapReady(true);

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
        if (mapUserMarkerRef.current) mapUserMarkerRef.current.setMap(null);

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

        try {
          const pos = await requestUserCoords();
          if (!disposed) {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setMapUserCoords(coords);
            mapUserMarkerRef.current = new maps.Marker({
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
          }
        } catch {
          setMapUserCoords(null);
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
          } else if (selD) {
            map.setCenter({ lat: selD.lat, lng: selD.lng });
            map.setZoom(12);
          }
        }, 0);
      } catch {
        setMapError("Не удалось загрузить Google Maps. Проверьте API key и ограничения.");
      }
    };
    init();
    return () => {
      disposed = true;
    };
  }, [showMapModal, mapLoading, mapPlaces, selectedMapPlace, selD, ensureGoogleMapsApi, setMapError, setRouteInfo, setRouteLoading, setSelectedMapPlace]);

  useEffect(() => {
    if (showMapModal) return;
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];
    if (googleDirectionsRendererRef.current) {
      googleDirectionsRendererRef.current.setMap(null);
      googleDirectionsRendererRef.current = null;
    }
    if (mapUserMarkerRef.current) {
      mapUserMarkerRef.current.setMap(null);
      mapUserMarkerRef.current = null;
    }
    setMapReady(false);
    setMapUserCoords(null);
    googleMapRef.current = null;
    if (mapContainerRef.current) mapContainerRef.current.innerHTML = "";
  }, [showMapModal]);

  useEffect(() => {
    if (!selectedMapPlace || !googleMapRef.current || !window.google?.maps) return;
    googleMapRef.current.panTo({ lat: selectedMapPlace.lat, lng: selectedMapPlace.lng });
  }, [selectedMapPlace]);

  useEffect(() => {
    if (!showMapModal || !mapReady || !selectedMapPlace || !googleMapRef.current || !window.google?.maps) return;
    let canceled = false;
    const maps = window.google.maps;
    const renderer = googleDirectionsRendererRef.current;
    if (!renderer) return;

    const build = async () => {
      setRouteLoading(true);
      try {
        let origin = mapUserCoords;
        if (!origin) {
          const pos = await requestUserCoords();
          if (canceled) return;
          origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setMapUserCoords(origin);
          if (googleMapRef.current && !mapUserMarkerRef.current) {
            mapUserMarkerRef.current = new maps.Marker({
              position: origin,
              map: googleMapRef.current,
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
          }
        }
        if (!origin) throw new Error("no-origin");
        const service = new maps.DirectionsService();
        const res = await service.route({
          origin,
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
    return () => {
      canceled = true;
    };
  }, [showMapModal, mapReady, selectedMapPlace, mapUserCoords, setRouteInfo, setRouteLoading]);

  return {
    mapContainerRef,
    openAllOnMap,
    openRouteForPlace,
  };
}
