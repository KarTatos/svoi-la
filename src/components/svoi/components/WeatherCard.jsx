function weatherTextToRu(text) {
  const value = String(text || "").toLowerCase();
  if (!value) return "погода";
  if (value.includes("thunder") || value.includes("storm")) return "гроза";
  if (value.includes("snow") || value.includes("sleet") || value.includes("blizzard")) return "снег";
  if (value.includes("rain") || value.includes("shower") || value.includes("drizzle")) return "дождь";
  if (value.includes("fog") || value.includes("mist") || value.includes("haze") || value.includes("smoke")) return "туман";
  if (value.includes("cloudy") || value.includes("overcast")) return "облачно";
  if (value.includes("partly")) return "переменная облачность";
  if (value.includes("clear") || value.includes("sunny")) return "ясно";
  if (value.includes("wind")) return "ветрено";
  return "погода";
}

function weatherIcon(text) {
  const value = String(text || "").toLowerCase();
  if (value.includes("thunder") || value.includes("storm")) return "⛈️";
  if (value.includes("snow") || value.includes("sleet") || value.includes("blizzard")) return "❄️";
  if (value.includes("rain") || value.includes("shower") || value.includes("drizzle")) return "🌧️";
  if (value.includes("fog") || value.includes("mist") || value.includes("haze") || value.includes("smoke")) return "🌫️";
  if (value.includes("cloudy") || value.includes("overcast")) return "☁️";
  if (value.includes("partly") || value.includes("mostly sunny") || value.includes("mostly clear")) return "🌤️";
  if (value.includes("clear") || value.includes("sunny")) return "☀️";
  if (value.includes("wind")) return "💨";
  return "🌤️";
}

function weatherMode(text) {
  const value = String(text || "").toLowerCase();
  if (value.includes("thunder") || value.includes("storm")) return "storm";
  if (value.includes("snow") || value.includes("sleet") || value.includes("blizzard")) return "snow";
  if (value.includes("rain") || value.includes("shower") || value.includes("drizzle")) return "rain";
  if (value.includes("fog") || value.includes("mist") || value.includes("haze") || value.includes("smoke")) return "mist";
  if (value.includes("cloudy") || value.includes("overcast") || value.includes("partly")) return "cloud";
  if (value.includes("clear") || value.includes("sunny")) return "clear";
  if (value.includes("wind")) return "wind";
  return "default";
}

function formatTemp(input) {
  const raw = String(input || "").replace(/В°/g, "°").replace(/\s+/g, " ").trim();
  const match = raw.match(/(-?\d+(?:\.\d+)?).*?([CF])?/i);
  if (!match) return raw || "--°";

  const value = Number(match[1]);
  const unit = String(match[2] || "").toUpperCase();
  if (!Number.isFinite(value)) return raw || "--°";

  if (unit === "F") {
    const c = Math.round(((value - 32) * 5) / 9);
    return `${Math.round(value)}°F (${c}°C)`;
  }
  if (unit === "C") return `${Math.round(value)}°C`;
  return `${Math.round(value)}°`;
}

export default function WeatherCard({ T, cd, profileLocation, profileWeather }) {
  const place = String(profileLocation || "Локация").split(",")[0].trim().toUpperCase();
  const text = String(profileWeather?.text || "");
  const mode = weatherMode(text);
  const showRain = mode === "rain" || mode === "storm";
  const showClouds = mode === "cloud" || mode === "mist" || mode === "wind";
  const showSun = mode === "clear" || mode === "default";

  return (
    <div
      className={`weather-card weather-mode-${mode}`}
      style={{
        ...cd,
        marginBottom: 14,
        padding: "12px 14px",
        background: "#FDF0E0",
        borderColor: "#F4E1CC",
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="weather-overlay" />
      {showClouds && (
        <div className="weather-cloud-layer" aria-hidden="true">
          <span className="weather-cloud cloud-a" />
          <span className="weather-cloud cloud-b" />
        </div>
      )}
      {showRain && (
        <div className="weather-rain-layer" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => i).map((idx) => (
            <span
              key={`rain-drop-${idx}`}
              className="weather-raindrop"
              style={{
                left: `${12 + idx * 9}%`,
                animationDelay: `${(idx % 5) * 0.22}s`,
                animationDuration: `${1.05 + (idx % 3) * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}
      {showSun && <div className="weather-sun-glow" aria-hidden="true" />}

      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 18,
          background: "#FFFFFF",
          border: "1px solid #F3E6D7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        <span className={`weather-icon weather-icon-${mode}`} style={{ fontSize: 31, lineHeight: 1 }}>
          {weatherIcon(text)}
        </span>
      </div>

      <div style={{ minWidth: 0, flex: 1, position: "relative", zIndex: 2 }}>
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
          {formatTemp(profileWeather?.temp)}{" "}
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1F2937" }}>• {weatherTextToRu(text)}</span>
        </div>
      </div>

      <style jsx>{`
        .weather-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(120px 80px at 85% 20%, rgba(255, 255, 255, 0.35), transparent 60%);
          opacity: 0.55;
          pointer-events: none;
          z-index: 0;
          animation: weatherOverlayPulse 6s ease-in-out infinite;
        }
        .weather-cloud-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
        .weather-cloud {
          position: absolute;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.22);
          filter: blur(0.4px);
        }
        .cloud-a { width: 120px; height: 34px; top: 8px; left: -32px; animation: weatherCloudMoveA 14s linear infinite; }
        .cloud-b { width: 90px; height: 28px; top: 44px; left: -26px; animation: weatherCloudMoveB 11s linear infinite; }
        .weather-rain-layer { position: absolute; inset: 0; pointer-events: none; z-index: 1; opacity: 0.6; }
        .weather-raindrop {
          position: absolute;
          top: -14px;
          width: 2px;
          height: 12px;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(123, 176, 255, 0.1), rgba(60, 130, 255, 0.9));
          animation-name: weatherRainDrop;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .weather-sun-glow {
          position: absolute;
          right: -18px;
          top: -18px;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 199, 84, 0.35) 0%, rgba(255, 199, 84, 0) 70%);
          pointer-events: none;
          z-index: 1;
          animation: weatherSunGlow 4.8s ease-in-out infinite;
        }
        .weather-icon { display: inline-block; transform-origin: 50% 50%; }
        .weather-icon-clear, .weather-icon-default { animation: weatherIconSunny 4s ease-in-out infinite; }
        .weather-icon-rain, .weather-icon-storm { animation: weatherIconRain 1.4s ease-in-out infinite; }
        .weather-icon-cloud, .weather-icon-mist, .weather-icon-wind { animation: weatherIconCloud 3.2s ease-in-out infinite; }
        .weather-icon-snow { animation: weatherIconSnow 2.4s ease-in-out infinite; }

        @keyframes weatherOverlayPulse { 0%,100% { opacity: 0.45; } 50% { opacity: 0.75; } }
        @keyframes weatherCloudMoveA { from { transform: translateX(0); } to { transform: translateX(150%); } }
        @keyframes weatherCloudMoveB { from { transform: translateX(0); } to { transform: translateX(170%); } }
        @keyframes weatherRainDrop { from { transform: translateY(0); opacity: 0; } 15% { opacity: 0.95; } to { transform: translateY(95px); opacity: 0; } }
        @keyframes weatherSunGlow { 0%,100% { transform: scale(1); opacity: 0.55; } 50% { transform: scale(1.08); opacity: 0.8; } }
        @keyframes weatherIconSunny { 0%,100% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(8deg) scale(1.06); } }
        @keyframes weatherIconRain { 0%,100% { transform: translateY(0); } 50% { transform: translateY(2px); } }
        @keyframes weatherIconCloud { 0%,100% { transform: translateX(0); } 50% { transform: translateX(2px); } }
        @keyframes weatherIconSnow { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-8deg) scale(1.04); } }
      `}</style>
    </div>
  );
}
