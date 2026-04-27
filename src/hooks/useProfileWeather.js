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
  const nearest = DISTRICTS.reduce((best, d) => {
    if (!Number.isFinite(d.lat) || !Number.isFinite(d.lng)) return best;
    const dist = haversineKm(lat, lng, Number(d.lat), Number(d.lng));
    if (!best || dist < best.dist) return { name: d.name, dist };
    return best;
  }, null);
  return nearest && nearest.dist <= 50 ? nearest.name : "";
}

// WMO weather code → short description
function wmoText(code) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 49) return "Foggy";
  if (code <= 55) return "Drizzle";
  if (code <= 57) return "Freezing drizzle";
  if (code <= 65) return "Rain";
  if (code <= 67) return "Freezing rain";
  if (code <= 75) return "Snow";
  if (code === 77) return "Snow grains";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code === 95) return "Thunderstorm";
  if (code <= 99) return "Thunderstorm w/ hail";
  return "Unknown";
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

        const districtLabel = getNearestDistrictLabel(lat, lng);
        if (!canceled) setProfileLocation(districtLabel || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);

        try {
          const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}` +
            `&current=temperature_2m,weather_code` +
            `&temperature_unit=fahrenheit` +
            `&forecast_days=1`;

          const res = await fetch(url);
          if (!res.ok) throw new Error("open_meteo_failed");
          const data = await res.json();
          if (canceled) return;

          const temp = data?.current?.temperature_2m;
          const code = data?.current?.weather_code;

          if (temp == null) throw new Error("no_temp");

          setProfileWeather({
            temp: `${Math.round(temp)}°F`,
            text: wmoText(code ?? -1),
          });
        } catch {
          if (canceled) return;
          setProfileWeather({ temp: "--°", text: "Погода недоступна" });
        }
      },
      () => {
        if (canceled) return;
        setProfileLocation("Локация отключена");
        setProfileWeather({ temp: "--°", text: "Разрешите геолокацию" });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
    );

    return () => {
      canceled = true;
    };
  }, []);

  return { profileLocation, profileWeather, userCoords };
}
