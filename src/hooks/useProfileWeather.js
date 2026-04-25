import { useEffect, useState } from "react";

const LOCATION_CACHE_KEY = "la_profile_location";
const WEATHER_CACHE_KEY = "la_profile_weather";
const LOCATION_FALLBACK = "Локация";
const WEATHER_FALLBACK = { temp: "--°", text: "погода" };

function readCachedWeather() {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
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

export function useProfileWeather() {
  const [profileLocation, setProfileLocation] = useState(() => {
    if (typeof window === "undefined") return "Определяем локацию...";
    return localStorage.getItem(LOCATION_CACHE_KEY) || "Определяем локацию...";
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

    let canceled = false;

    const saveLocation = (value) => {
      if (canceled) return;
      const clean = String(value || "").trim() || LOCATION_FALLBACK;
      setProfileLocation(clean);
      try {
        localStorage.setItem(LOCATION_CACHE_KEY, clean);
      } catch {}
    };

    const saveWeather = (weather) => {
      if (canceled) return;
      const clean = {
        temp: String(weather?.temp || WEATHER_FALLBACK.temp),
        text: String(weather?.text || WEATHER_FALLBACK.text),
      };
      setProfileWeather(clean);
      try {
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(clean));
      } catch {}
    };

    const fetchWeatherAndLocation = async (lat, lng) => {
      try {
        const pointsRes = await fetch(`https://api.weather.gov/points/${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`);
        if (!pointsRes.ok) throw new Error("points_failed");

        const points = await pointsRes.json();
        const rel = points?.properties?.relativeLocation?.properties;
        const city = String(rel?.city || "").trim();
        const state = String(rel?.state || "").trim();
        const locationLabel = city
          ? (state ? `${city}, ${state}` : city)
          : `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;

        const forecastUrl = points?.properties?.forecast;
        if (!forecastUrl) throw new Error("forecast_url_missing");

        const forecastRes = await fetch(forecastUrl);
        if (!forecastRes.ok) throw new Error("forecast_failed");

        const forecast = await forecastRes.json();
        const period = forecast?.properties?.periods?.[0];
        if (!period) throw new Error("forecast_empty");

        return {
          locationLabel,
          weather: {
            temp: `${period.temperature}°${period.temperatureUnit || ""}`,
            text: period.shortForecast || WEATHER_FALLBACK.text,
          },
        };
      } catch {
        return null;
      }
    };

    const loadGeoData = () => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const payload = await fetchWeatherAndLocation(coords.latitude, coords.longitude);
          if (payload?.locationLabel) saveLocation(payload.locationLabel);
          if (payload?.weather) saveWeather(payload.weather);
        },
        () => {
          saveLocation(localStorage.getItem(LOCATION_CACHE_KEY) || LOCATION_FALLBACK);
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 5 * 60 * 1000 }
      );
    };

    loadGeoData();
    const onVisible = () => {
      if (document.visibilityState === "visible") loadGeoData();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      canceled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return { profileLocation, profileWeather };
}
