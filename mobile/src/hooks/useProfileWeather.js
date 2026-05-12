import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";

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

function normalizeWeatherLocation(address = {}, lat, lng) {
  const a = address || {};
  const city = a.city || a.town || a.village || a.municipality || "";
  const neighbourhood = a.neighbourhood || a.suburb || a.quarter || "";
  const district = a.city_district || a.borough || "";
  const county = a.county || "";

  const isAdministrativeDistrict = (value) => {
    const s = String(value || "").trim().toLowerCase();
    if (!s) return true;
    return (
      /^district\s*\d+$/i.test(s) ||
      /^dist\.?\s*\d+$/i.test(s) ||
      /^ward\s*\d+$/i.test(s) ||
      /^zone\s*\d+$/i.test(s) ||
      s.includes("council district") ||
      s.includes("administrative") ||
      s.includes("municipal district")
    );
  };

  if (neighbourhood && !isAdministrativeDistrict(neighbourhood)) return neighbourhood;
  if (district && !isAdministrativeDistrict(district)) return district;
  if (city) return city;
  if (county) return county;
  return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
}

export function useProfileWeather() {
  const [profileLocation, setProfileLocation] = useState("Определяем локацию...");
  const [profileWeather, setProfileWeather] = useState({ temp: "--°", text: "Погода загружается..." });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [permissionGranted, setPermissionGranted] = useState(false);

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionGranted(false);
        setProfileLocation("Локация отключена");
        setProfileWeather({ temp: "--°", text: "Разрешите геолокацию" });
        setLoading(false);
        return;
      }

      setPermissionGranted(true);
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = Number(pos.coords.latitude);
      const lng = Number(pos.coords.longitude);

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
        fetch(geoUrl, { headers: { "User-Agent": "SvoiLA-Mobile/1.0" } }),
      ]);

      try {
        if (geoRes.status === "fulfilled" && geoRes.value.ok) {
          const geo = await geoRes.value.json();
          setProfileLocation(normalizeWeatherLocation(geo?.address || {}, lat, lng));
        } else {
          setProfileLocation(`${lat.toFixed(3)}, ${lng.toFixed(3)}`);
        }
      } catch {
        setProfileLocation(`${lat.toFixed(3)}, ${lng.toFixed(3)}`);
      }

      try {
        if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
          const data = await weatherRes.value.json();
          const temp = data?.current?.temperature_2m;
          const code = data?.current?.weather_code;
          if (temp == null) throw new Error("no_temp");
          setProfileWeather({
            temp: `${Math.round(temp)}°F`,
            text: wmoText(code ?? -1),
          });
        } else {
          throw new Error("weather_failed");
        }
      } catch {
        setProfileWeather({ temp: "--°", text: "Погода недоступна" });
      }
    } catch (e) {
      setError(e?.message || "weather_error");
      setProfileLocation("Локация недоступна");
      setProfileWeather({ temp: "--°", text: "Ошибка доступа к погоде" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  return {
    profileLocation,
    profileWeather,
    loading,
    error,
    permissionGranted,
    requestPermission: loadWeather,
  };
}
