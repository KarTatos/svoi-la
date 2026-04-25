import { useEffect, useState } from "react";

const LOCATION_CACHE_KEY = "la_profile_location";
const WEATHER_CACHE_KEY = "la_profile_weather";
const LOCATION_FALLBACK = "\u041b\u043e\u043a\u0430\u0446\u0438\u044f";
const WEATHER_FALLBACK = { temp: "--\u00b0", text: "weather" };

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function readCachedWeather() {
  try {
    const raw = safeGet(WEATHER_CACHE_KEY);
    if (!raw) return WEATHER_FALLBACK;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return WEATHER_FALLBACK;
    return {
      temp: String(parsed.temp || WEATHER_FALLBACK.temp),
      text: String(parsed.text || WEATHER_FALLBACK.text),
    };
  } catch {
    return WEATHER_FALLBACK;
  }
}

async function fetchWeatherAndLocation(lat, lng) {
  try {
    const pointsRes = await fetch(`https://api.weather.gov/points/${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`);
    if (!pointsRes.ok) return null;

    const points = await pointsRes.json();
    const rel = points?.properties?.relativeLocation?.properties;
    const city = String(rel?.city || "").trim();
    const state = String(rel?.state || "").trim();
    const locationLabel = city ? (state ? `${city}, ${state}` : city) : LOCATION_FALLBACK;

    const forecastUrl = points?.properties?.forecast;
    if (!forecastUrl) {
      return { locationLabel, weather: WEATHER_FALLBACK };
    }

    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) {
      return { locationLabel, weather: WEATHER_FALLBACK };
    }

    const forecast = await forecastRes.json();
    const period = forecast?.properties?.periods?.[0];
    if (!period) {
      return { locationLabel, weather: WEATHER_FALLBACK };
    }

    return {
      locationLabel,
      weather: {
        temp: `${period.temperature}\u00b0${period.temperatureUnit || ""}`,
        text: period.shortForecast || WEATHER_FALLBACK.text,
      },
    };
  } catch {
    return null;
  }
}

export function useProfileWeather() {
  const [profileLocation, setProfileLocation] = useState(() => {
    if (typeof window === "undefined") return "\u041e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u043c \u043b\u043e\u043a\u0430\u0446\u0438\u044e...";
    return safeGet(LOCATION_CACHE_KEY) || "\u041e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u043c \u043b\u043e\u043a\u0430\u0446\u0438\u044e...";
  });

  const [profileWeather, setProfileWeather] = useState(() => {
    if (typeof window === "undefined") return WEATHER_FALLBACK;
    return readCachedWeather();
  });

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setProfileLocation(LOCATION_FALLBACK);
      return;
    }

    let cancelled = false;

    const saveLocation = (value) => {
      if (cancelled) return;
      const clean = String(value || "").trim() || LOCATION_FALLBACK;
      setProfileLocation(clean);
      safeSet(LOCATION_CACHE_KEY, clean);
    };

    const saveWeather = (weather) => {
      if (cancelled) return;
      const clean = {
        temp: String(weather?.temp || WEATHER_FALLBACK.temp),
        text: String(weather?.text || WEATHER_FALLBACK.text),
      };
      setProfileWeather(clean);
      safeSet(WEATHER_CACHE_KEY, JSON.stringify(clean));
    };

    const loadGeoData = () => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const payload = await fetchWeatherAndLocation(coords.latitude, coords.longitude);
          if (!payload) {
            saveLocation(safeGet(LOCATION_CACHE_KEY) || LOCATION_FALLBACK);
            saveWeather(readCachedWeather());
            return;
          }
          saveLocation(payload.locationLabel);
          saveWeather(payload.weather);
        },
        () => {
          saveLocation(safeGet(LOCATION_CACHE_KEY) || LOCATION_FALLBACK);
          saveWeather(readCachedWeather());
        },
        { enableHighAccuracy: false, timeout: 7000, maximumAge: 5 * 60 * 1000 }
      );
    };

    loadGeoData();
    const onVisible = () => {
      if (document.visibilityState === "visible") loadGeoData();
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return { profileLocation, profileWeather };
}
