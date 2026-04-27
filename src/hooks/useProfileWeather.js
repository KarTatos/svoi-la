import { useEffect, useState } from "react";

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

        const weatherUrl =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}` +
          `&current=temperature_2m,weather_code` +
          `&temperature_unit=fahrenheit` +
          `&forecast_days=1`;

        const geoUrl =
          `https://nominatim.openstreetmap.org/reverse` +
          `?format=json&lat=${lat}&lon=${lng}&zoom=15&addressdetails=1`;

        const [weatherRes, geoRes] = await Promise.allSettled([
          fetch(weatherUrl),
          fetch(geoUrl, { headers: { "User-Agent": "SvoiLA-App/1.0" } }),
        ]);

        if (canceled) return;

        // — Location name via Nominatim reverse geocoding —
        try {
          if (geoRes.status === "fulfilled" && geoRes.value.ok) {
            const geo = await geoRes.value.json();
            const a = geo?.address || {};
            const label = a.neighbourhood || a.suburb || a.city_district || a.city || "";
            setProfileLocation(label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          } else {
            setProfileLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        } catch {
          if (!canceled) setProfileLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }

        // — Weather —
        try {
          if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
            const data = await weatherRes.value.json();
            const temp = data?.current?.temperature_2m;
            const code = data?.current?.weather_code;
            if (temp == null) throw new Error("no_temp");
            if (!canceled) setProfileWeather({
              temp: `${Math.round(temp)}°F`,
              text: wmoText(code ?? -1),
            });
          } else {
            throw new Error("weather_failed");
          }
        } catch {
          if (!canceled) setProfileWeather({ temp: "--°", text: "Погода недоступна" });
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
