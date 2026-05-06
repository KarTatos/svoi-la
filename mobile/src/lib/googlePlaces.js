const GOOGLE_PLACES_BASE = "https://maps.googleapis.com/maps/api/place";
const NON_EN_RE = /[^A-Za-z0-9 .,'\-#/&()]/g;

function toEnglishText(value) {
  return String(value || "")
    .replace(NON_EN_RE, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getKey() {
  return process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
}

function shortAddressFromComponents(components = [], fallback = "") {
  const find = (type, mode = "long") => {
    const v = components.find((c) => Array.isArray(c.types) && c.types.includes(type));
    if (!v) return "";
    return mode === "short" ? v.short_name || "" : v.long_name || "";
  };

  const streetNumber = find("street_number");
  const route = find("route");
  const city = find("locality") || find("sublocality_level_1") || "Los Angeles";
  const state = find("administrative_area_level_1", "short") || "CA";
  const line = [streetNumber, route].filter(Boolean).join(" ").trim();

  if (line) return `${line}, ${city}, ${state}`;
  if (fallback) return String(fallback).split(",").map((x) => x.trim()).filter(Boolean).slice(0, 3).join(", ");
  return `${city}, ${state}`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error_message || `HTTP ${res.status}`);
  return json;
}

async function fetchDetails(placeId, key) {
  const detailsUrl =
    `${GOOGLE_PLACES_BASE}/details/json` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=name,formatted_address,address_component,geometry` +
    `&language=en&key=${encodeURIComponent(key)}`;

  const json = await fetchJson(detailsUrl);
  if (json?.status !== "OK") return null;
  const r = json?.result;
  const lat = Number(r?.geometry?.location?.lat);
  const lng = Number(r?.geometry?.location?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const short = shortAddressFromComponents(r?.address_components || [], r?.formatted_address || "");
  const placeName = r?.name || "";
  const comps = Array.isArray(r?.address_components) ? r.address_components : [];
  const countyObj = comps.find((c) => Array.isArray(c.types) && c.types.includes("administrative_area_level_2"));
  const county = String(countyObj?.long_name || "").toLowerCase();
  if (!county.includes("los angeles")) return null;

  const labelRaw = placeName && !short.toLowerCase().includes(placeName.toLowerCase()) ? `${placeName} - ${short}` : short;
  const label = toEnglishText(labelRaw);
  const value = toEnglishText(short);
  const normalizedPlaceName = toEnglishText(placeName);
  if (!label || !value || !normalizedPlaceName) return null;

  return {
    label,
    value,
    placeName: normalizedPlaceName,
    lat,
    lng,
  };
}

export async function fetchPlaceSuggestions(query) {
  const q = String(query || "").trim();
  if (q.length < 3) return [];
  const key = getKey();
  if (!key) return [];

  const center = "34.0522,-118.2437";
  const autocompleteUrl =
    `${GOOGLE_PLACES_BASE}/autocomplete/json` +
    `?input=${encodeURIComponent(q)}` +
    `&components=country:us` +
    `&location=${encodeURIComponent(center)}` +
    `&radius=90000` +
    `&strictbounds=true` +
    `&language=en` +
    `&key=${encodeURIComponent(key)}`;

  const json = await fetchJson(autocompleteUrl);
  if (json?.status !== "OK" && json?.status !== "ZERO_RESULTS") return [];
  const top = Array.isArray(json?.predictions) ? json.predictions.slice(0, 6) : [];

  const detailed = await Promise.all(
    top.map(async (p) => {
      const details = p?.place_id ? await fetchDetails(p.place_id, key) : null;
      return details;
    })
  );

  const uniq = [];
  const seen = new Set();
  for (const item of detailed) {
    if (!item || !Number.isFinite(item.lat) || !Number.isFinite(item.lng)) continue;
    const k = `${item.value}|${item.placeName}`;
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(item);
  }

  return uniq;
}
