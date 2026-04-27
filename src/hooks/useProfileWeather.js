import { useEffect, useState } from "react";
import { DISTRICTS } from "../components/svoi/config";

function toRad(v) {
  return (v * Math.PI) / 180;
}

function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1 + s2));
}

function getNearestDistrictLabel(lat, lng) {
  const nearestDistrict = DISTRICTS.reduce((best, d) => {
    if (!Number.isFinite(d.lat) || !Number.isFinite(d.lng)) return best;
    const dist = haversineKm(lat, lng, Number(d.lat), Number(d.lng));
    if (!best || dist < best.dist) return { name: d.name, dist };
    return best;
  }, null);
  return nearestDistrict && nearestDistrict.dist <= 50 ? nearestDistrict.name : "";
}

export function useProfileWeather() {
  const [profileLocation, setProfileLocation] = useState("Определяем локацию...");
  const [profileWeather, setProfileWeather] = useState({ temp: "--°", text: "Погода загружается..." });
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setProfileLocation("Локация недоступна");
      setProfileWeather({ temp: "--°", text: "Геолокация не поддерживается" });
      return;
    }

    let canceled = false;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = Number(coords.latitude);
        const lng = Number(coords.longitude);
        if (!canceled) setUserCoords({ lat, lng });
        const latLabel = lat.toFixed(4);
        const lngLabel = lng.toFixed(4);

        try {
          const pointsRes = await fetch(`https://api.weather.gov/points/${latLabel},${lngLabel}`);
          if (!pointsRes.ok) throw new Error("points_failed");
          const points = await pointsRes.json();
          if (canceled) return;

          const rel = points?.properties?.relativeLocation?.properties;
          const city = rel?.city || "";
          const state = rel?.state || "";
          const districtLabel = getNearestDistrictLabel(lat, lng);
          setProfileLocation(districtLabel || (city && state ? `${city}, ${state}` : `${latLabel}, ${lngLabel}`));

          const forecastUrl = points?.properties?.forecast;
          if (!forecastUrl) throw new Error("forecast_url_missing");
          const forecastRes = await fetch(forecastUrl);
          if (!forecastRes.ok) throw new Error("forecast_failed");
          const forecast = await forecastRes.json();
          if (canceled) return;
          const period = forecast?.properties?.periods?.[0];
          if (!period) throw new Error("forecast_empty");

          setProfileWeather({
            temp: `${period.temperature}°${period.temperatureUnit || ""}`,
            text: period.shortForecast || "Без описания",
          });
        } catch {
          if (canceled) return;
          setProfileLocation(`${latLabel}, ${lngLabel}`);
          setProfileWeather((prev) => (prev?.temp && prev?.text ? prev : { temp: "--°", text: "Погода недоступна" }));
        }
      },
      () => {
        if (canceled) return;
        setProfileLocation("Локация отключена");
        setProfileWeather((prev) => (prev?.temp && prev?.text ? prev : { temp: "--°", text: "Разрешите геолокацию" }));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
    );

    return () => {
      canceled = true;
    };
  }, []);

  return { profileLocation, profileWeather, userCoords };
}
