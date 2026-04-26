// Browser-only helpers for Google Maps + geocoding + address autocomplete.
// All state lives at module level — fresh on each page load, cached for the session.

let loaderPromise = null;
let geocoder = null;
let autocompleteService = null;
let placesService = null;
const geocodeCache = Object.create(null);

function getApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
}

export function ensureGoogleMapsApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("No browser"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loaderPromise) return loaderPromise;
  const apiKey = getApiKey();
  if (!apiKey) return Promise.reject(new Error("Google Maps API key is missing"));

  loaderPromise = new Promise((resolve, reject) => {
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
      loaderPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });
  return loaderPromise;
}

export function getGeocodeCacheKeys(place = {}) {
  const address = String(place.address || "").trim().toLowerCase();
  const name = String(place.name || "").trim().toLowerCase();
  return {
    primary: `${name}|${address}`,
    byAddress: `addr|${address}`,
  };
}

function saveGeocodeCache(place, coords) {
  if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return;
  const { primary, byAddress } = getGeocodeCacheKeys(place);
  if (primary) geocodeCache[primary] = coords;
  if (byAddress) geocodeCache[byAddress] = coords;
}

function getGoogleComponent(components, type, mode = "long") {
  const found = (components || []).find((c) => (c.types || []).includes(type));
  if (!found) return "";
  return mode === "short" ? found.short_name || "" : found.long_name || "";
}

function shortAddressFromGoogle(components, fallback = "") {
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
    const parts = String(fallback)
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    return parts.slice(0, 3).join(", ");
  }
  return `${city}, ${state}`;
}

async function ensureGooglePlacesServices() {
  const maps = await ensureGoogleMapsApi();
  if (!maps?.places) throw new Error("Google Places library is not available");
  if (!autocompleteService) {
    autocompleteService = new maps.places.AutocompleteService();
  }
  if (!placesService) {
    const el = document.createElement("div");
    placesService = new maps.places.PlacesService(el);
  }
  return { maps, autocomplete: autocompleteService, placesService };
}

function getGooglePredictions(autocomplete, input) {
  return new Promise((resolve) => {
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
}

function getGooglePlaceDetails(svc, placeId) {
  return new Promise((resolve) => {
    svc.getDetails(
      { placeId, fields: ["name", "formatted_address", "address_components", "geometry"] },
      (result, status) => {
        const ok = status === window.google.maps.places.PlacesServiceStatus.OK;
        resolve(ok ? result : null);
      }
    );
  });
}

export async function fetchAddressSuggestions(query) {
  const q = String(query || "").trim();
  if (q.length < 3) return [];
  try {
    const { autocomplete, placesService: svc } = await ensureGooglePlacesServices();
    const predictions = await getGooglePredictions(autocomplete, q);
    const top = predictions.slice(0, 6);
    const detailed = await Promise.all(
      top.map(async (pred) => {
        const details = pred?.place_id ? await getGooglePlaceDetails(svc, pred.place_id) : null;
        const short = shortAddressFromGoogle(
          details?.address_components,
          details?.formatted_address || pred?.description || ""
        );
        const placeName = details?.name || pred?.structured_formatting?.main_text || "";
        const label =
          placeName && !short.toLowerCase().includes(String(placeName).toLowerCase())
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
      })
    );
    const uniq = [];
    const seen = new Set();
    for (const item of detailed) {
      if (!item?.value) continue;
      if (!Number.isFinite(item.lat) || !Number.isFinite(item.lng)) continue;
      const key = `${item.value}|${item.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      uniq.push(item);
    }
    return uniq;
  } catch (err) {
    console.error("Address suggestions failed:", err);
    return [];
  }
}

export async function geocodePlace(place) {
  if (Number.isFinite(Number(place?.lat)) && Number.isFinite(Number(place?.lng))) {
    return { lat: Number(place.lat), lng: Number(place.lng) };
  }
  const { primary, byAddress } = getGeocodeCacheKeys(place || {});
  if (primary && geocodeCache[primary]) return geocodeCache[primary];
  if (byAddress && geocodeCache[byAddress]) return geocodeCache[byAddress];

  // Prefer Google geocoder for better match with Google Maps pins.
  try {
    const maps = await ensureGoogleMapsApi();
    if (maps?.Geocoder) {
      if (!geocoder) geocoder = new maps.Geocoder();
      const q = `${place?.address || place?.name || ""}, Los Angeles County, California`;
      const googleCoords = await new Promise((resolve) => {
        geocoder.geocode({ address: q, region: "us" }, (results, status) => {
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

  // Fallback if Google geocode is unavailable.
  const query = encodeURIComponent(`${place?.address || place?.name || ""}, Los Angeles County, California`);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&addressdetails=1&q=${query}`
    );
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
}

// Exposed for callers that want to seed the cache (e.g. when an autocomplete
// suggestion already comes with lat/lng from Google Places).
export function cacheGeocodeFor(place, coords) {
  saveGeocodeCache(place, coords);
}
