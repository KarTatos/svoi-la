import { useEffect, useState } from "react";

export function useProfileWeather(districts = []) {
  const [profileLocation, setProfileLocation] = useState("Определяем локацию...");
  const [profileWeather, setProfileWeather] = useState({ temp: "--°", text: "Погода загружается..." });

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setProfileLocation("Локация недоступна");
      setProfileWeather({ temp: "--°", text: "Геолокация не поддерживается" });
      return;
    }

    let canceled = false;
    const loadGeoWeather = () => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const lat = Number(coords.latitude).toFixed(4);
          const lng = Number(coords.longitude).toFixed(4);
          try {
            const pointsRes = await fetch(`https://api.weather.gov/points/${lat},${lng}`);
            if (!pointsRes.ok) throw new Error("points_failed");
            const points = await pointsRes.json();
            if (canceled) return;
            const rel = points?.properties?.relativeLocation?.properties;
            const city = rel?.city || "";
            const state = rel?.state || "";
            const latNum = Number(coords.latitude);
            const lngNum = Number(coords.longitude);
            const toRad = (v) => (v * Math.PI) / 180;
            const haversineKm = (aLat, aLng, bLat, bLng) => {
              const R = 6371;
              const dLat = toRad(bLat - aLat);
              const dLng = toRad(bLng - aLng);
              const s1 = Math.sin(dLat / 2) ** 2;
              const s2 = Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
              return 2 * R * Math.asin(Math.sqrt(s1 + s2));
            };
            const nearestDistrict = (districts || []).reduce((best, d) => {
              if (!Number.isFinite(d.lat) || !Number.isFinite(d.lng)) return best;
              const dist = haversineKm(latNum, lngNum, Number(d.lat), Number(d.lng));
              if (!best || dist < best.dist) return { name: d.name, dist };
              return best;
            }, null);
            const districtLabel = nearestDistrict && nearestDistrict.dist <= 50 ? nearestDistrict.name : "";
            setProfileLocation(districtLabel || (city && state ? `${city}, ${state}` : `${lat}, ${lng}`));

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
            setProfileLocation(`${lat}, ${lng}`);
            setProfileWeather({ temp: "--°", text: "Погода недоступна" });
          }
        },
        () => {
          if (canceled) return;
          setProfileLocation("Локация отключена");
          setProfileWeather({ temp: "--°", text: "Разрешите геолокацию" });
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    };

    loadGeoWeather();
    const onVisible = () => {
      if (document.visibilityState === "visible") loadGeoWeather();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      canceled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [districts]);

  return { profileLocation, profileWeather };
}

