import { useRef } from "react";

export function useGoogleMapsCore() {
  const googleMapsLoaderRef = useRef(null);
  const googleGeocoderRef = useRef(null);
  const geocodeCacheRef = useRef({});

  const ensureGoogleMapsApi = () => {
    if (typeof window === "undefined") return Promise.reject(new Error("No browser"));
    if (window.google?.maps) return Promise.resolve(window.google.maps);
    if (googleMapsLoaderRef.current) return googleMapsLoaderRef.current;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
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
        try {
          delete window[callbackName];
        } catch {}
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

  const saveGeocodeCache = (place, coords) => {
    if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return;
    const { primary, byAddress } = getGeocodeCacheKeys(place);
    if (primary) geocodeCacheRef.current[primary] = coords;
    if (byAddress) geocodeCacheRef.current[byAddress] = coords;
  };

  const geocodePlace = async (place) => {
    if (Number.isFinite(Number(place?.lat)) && Number.isFinite(Number(place?.lng))) {
      return { lat: Number(place.lat), lng: Number(place.lng) };
    }
    const { primary, byAddress } = getGeocodeCacheKeys(place);
    if (primary && geocodeCacheRef.current[primary]) return geocodeCacheRef.current[primary];
    if (byAddress && geocodeCacheRef.current[byAddress]) return geocodeCacheRef.current[byAddress];

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

  return {
    ensureGoogleMapsApi,
    saveGeocodeCache,
    geocodePlace,
  };
}

