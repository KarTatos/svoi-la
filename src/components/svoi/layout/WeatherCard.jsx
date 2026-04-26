function normalizeWeatherText(rawText = "") {
  const text = String(rawText || "").toLowerCase();
  if (!text) return "погода";
  if (text.includes("thunder") || text.includes("storm")) return "гроза";
  if (text.includes("snow") || text.includes("sleet") || text.includes("blizzard")) return "снег";
  if (text.includes("rain") || text.includes("shower") || text.includes("drizzle")) return "дождь";
  if (text.includes("fog") || text.includes("mist") || text.includes("haze") || text.includes("smoke")) return "туман";
  if (text.includes("cloudy") || text.includes("overcast")) return "облачно";
  if (text.includes("partly")) return "переменная облачность";
  if (text.includes("clear") || text.includes("sunny")) return "ясно";
  if (text.includes("wind")) return "ветрено";
  return "погода";
}

function selectWeatherIcon(rawText = "") {
  const text = String(rawText || "").toLowerCase();
  if (text.includes("thunder") || text.includes("storm")) return "⛈️";
  if (text.includes("snow") || text.includes("sleet") || text.includes("blizzard")) return "🌨️";
  if (text.includes("rain") || text.includes("shower") || text.includes("drizzle")) return "🌧️";
  if (text.includes("fog") || text.includes("mist") || text.includes("haze") || text.includes("smoke")) return "🌫️";
  if (text.includes("cloudy") || text.includes("overcast")) return "☁️";
  if (text.includes("partly")) return "⛅";
  if (text.includes("clear") || text.includes("sunny")) return "☀️";
  if (text.includes("wind")) return "💨";
  return "☀️";
}

function formatWeatherTemp(raw = "") {
  const value = String(raw || "").trim();
  const match = value.match(/(-?\d+(?:\.\d+)?)\s*°?\s*([CF])?/i);
  if (!match) return value || "--°";

  const n = Number(match[1]);
  const unit = String(match[2] || "").toUpperCase();
  if (!Number.isFinite(n)) return value || "--°";

  if (unit === "F") {
    const c = Math.round((n - 32) * 5 / 9);
    return `${Math.round(n)}°F (${c}°C)`;
  }
  if (unit === "C") return `${Math.round(n)}°C`;
  return `${Math.round(n)}°`;
}

export default function WeatherCard({ T, cd, profileLocation, profileWeather }) {
  const place = (profileLocation || "Локация").split(",")[0].trim().toUpperCase();
  const weatherRaw = String(profileWeather?.text || "");
  const weatherText = normalizeWeatherText(weatherRaw);
  const weatherIcon = selectWeatherIcon(weatherRaw);
  const weatherTemp = formatWeatherTemp(profileWeather?.temp || "");

  return (
    <div
      style={{
        ...cd,
        marginBottom: 14,
        padding: "12px 14px",
        background: "#FDF0E0",
        borderColor: "#F4E1CC",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        aria-label="Погода"
        role="img"
        style={{
          width: 58,
          height: 58,
          borderRadius: 16,
          background: "#FFFFFF",
          border: "1px solid #F3E6D7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
          flexShrink: 0,
          fontSize: 30,
          lineHeight: 1,
        }}
      >
        <span>{weatherIcon}</span>
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.06em",
            fontWeight: 800,
            color: "#4B5563",
            marginBottom: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {place}
        </div>
        <div
          style={{
            fontSize: 19,
            lineHeight: 1.1,
            fontWeight: 700,
            color: "#111827",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {weatherTemp}{" "}
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1F2937" }}>• {weatherText}</span>
        </div>
      </div>
    </div>
  );
}
