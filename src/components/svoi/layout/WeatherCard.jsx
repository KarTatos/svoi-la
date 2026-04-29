function normalizeWeatherText(rawText = "") {
  const text = String(rawText || "").toLowerCase();
  if (!text) return "погода";
  if (text.includes("thunder") || text.includes("storm")) return "гроза";
  if (text.includes("snow") || text.includes("sleet") || text.includes("blizzard")) return "снег";
  if (text.includes("rain") || text.includes("shower") || text.includes("drizzle")) return "дождь";
  if (text.includes("fog") || text.includes("mist") || text.includes("haze") || text.includes("smoke")) return "туман";
  if (text.includes("cloudy") || text.includes("overcast")) return "облачно";
  if (text.includes("partly")) return "переменная облачность";
  if (text.includes("clear") || text.includes("sunny")) return "ясно · идеально для прогулки";
  if (text.includes("wind")) return "ветрено";
  return "погода";
}

function formatWeatherTemp(raw = "") {
  const value = String(raw || "").trim();
  const match = value.match(/(-?\d+(?:\.\d+)?)\s*°?\s*([CF])?/i);
  if (!match) return "--°";
  const n = Number(match[1]);
  const unit = String(match[2] || "").toUpperCase();
  if (!Number.isFinite(n)) return "--°";
  if (unit === "F") return `${Math.round(n)}°`;
  if (unit === "C") return `${Math.round(n)}°`;
  return `${Math.round(n)}°`;
}

export default function WeatherCard({ T, cd, profileLocation, profileWeather }) {
  const place = (profileLocation || "Los Angeles").split(",")[0].trim().toUpperCase();
  const weatherText = normalizeWeatherText(String(profileWeather?.text || ""));
  const weatherTemp = formatWeatherTemp(profileWeather?.temp || "");

  return (
    <div style={{
      borderRadius: 18,
      background: `linear-gradient(135deg, ${T.primary} 0%, #E8630A 100%)`,
      padding: "16px 18px",
      marginBottom: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 4px 20px rgba(244,123,32,0.35)",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Decorative circle */}
      <div style={{
        position: "absolute", right: -20, top: -20,
        width: 110, height: 110, borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
      }} />
      <div style={{ zIndex: 1 }}>
        <div style={{
          fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.75)", marginBottom: 4,
          textTransform: "uppercase",
        }}>
          Сегодня в LA
        </div>
        <div style={{
          fontSize: 15, fontWeight: 600, color: "#fff",
          lineHeight: 1.3, maxWidth: 200,
        }}>
          {weatherText}
        </div>
      </div>
      <div style={{
        fontSize: 52, fontWeight: 800, color: "#fff",
        lineHeight: 1, letterSpacing: -2, zIndex: 1, flexShrink: 0,
      }}>
        {weatherTemp}
      </div>
    </div>
  );
}
