export default function HomeScreen({
  T,
  cd,
  mt,
  profileLocation,
  profileWeather,
  sections,
  HomeIcon,
  CalendarIcon,
  onOpenSection,
  onOpenChat,
}) {
  const chatSection = sections.find((s) => s.id === "chat-sec");
  const mainSections = sections.filter((s) => s.id !== "chat-sec");
  const weatherPlace = (profileLocation || "Los Angeles").split(",")[0].trim().toUpperCase();
  const weatherTextLc = String(profileWeather?.text || "").toLowerCase();

  const formatWeatherTemp = () => {
    const raw = String(profileWeather?.temp || "").trim();
    const normalized = raw
      .replace(/В°/g, "°")
      .replace(/\s+/g, " ")
      .trim();
    const match = normalized.match(/(-?\d+(?:\.\d+)?).*?([CF])?/i);
    if (!match) return normalized || "--°";

    const value = Number(match[1]);
    const unit = String(match[2] || "").toUpperCase();
    if (!Number.isFinite(value)) return normalized || "--°";

    if (unit === "F") {
      const c = Math.round(((value - 32) * 5) / 9);
      return `${Math.round(value)}°F (${c}°C)`;
    }
    if (unit === "C") return `${Math.round(value)}°C`;
    return `${Math.round(value)}°`;
  };

  const formatWeatherTextRu = () => {
    if (!weatherTextLc) return "погода";
    if (weatherTextLc.includes("thunder") || weatherTextLc.includes("storm")) return "гроза";
    if (weatherTextLc.includes("snow") || weatherTextLc.includes("sleet") || weatherTextLc.includes("blizzard")) return "снег";
    if (weatherTextLc.includes("rain") || weatherTextLc.includes("shower") || weatherTextLc.includes("drizzle")) return "дождь";
    if (weatherTextLc.includes("fog") || weatherTextLc.includes("mist") || weatherTextLc.includes("haze") || weatherTextLc.includes("smoke")) return "туман";
    if (weatherTextLc.includes("cloudy") || weatherTextLc.includes("overcast")) return "облачно";
    if (weatherTextLc.includes("partly")) return "переменная облачность";
    if (weatherTextLc.includes("clear") || weatherTextLc.includes("sunny")) return "ясно";
    if (weatherTextLc.includes("wind")) return "ветрено";
    return "погода";
  };

  const getWeatherIcon = () => {
    if (!weatherTextLc) return "🌤️";
    if (weatherTextLc.includes("thunder") || weatherTextLc.includes("storm")) return "⛈️";
    if (weatherTextLc.includes("snow") || weatherTextLc.includes("sleet") || weatherTextLc.includes("blizzard")) return "❄️";
    if (weatherTextLc.includes("rain") || weatherTextLc.includes("shower") || weatherTextLc.includes("drizzle")) return "🌧️";
    if (weatherTextLc.includes("fog") || weatherTextLc.includes("mist") || weatherTextLc.includes("haze") || weatherTextLc.includes("smoke")) return "🌫️";
    if (weatherTextLc.includes("cloudy") || weatherTextLc.includes("overcast")) return "☁️";
    if (weatherTextLc.includes("partly") || weatherTextLc.includes("mostly sunny") || weatherTextLc.includes("mostly clear")) return "🌤️";
    if (weatherTextLc.includes("clear") || weatherTextLc.includes("sunny")) return "☀️";
    if (weatherTextLc.includes("wind")) return "💨";
    return "🌤️";
  };

  const getWeatherMode = () => {
    if (!weatherTextLc) return "default";
    if (weatherTextLc.includes("thunder") || weatherTextLc.includes("storm")) return "storm";
    if (weatherTextLc.includes("snow") || weatherTextLc.includes("sleet") || weatherTextLc.includes("blizzard")) return "snow";
    if (weatherTextLc.includes("rain") || weatherTextLc.includes("shower") || weatherTextLc.includes("drizzle")) return "rain";
    if (weatherTextLc.includes("fog") || weatherTextLc.includes("mist") || weatherTextLc.includes("haze") || weatherTextLc.includes("smoke")) return "mist";
    if (weatherTextLc.includes("cloudy") || weatherTextLc.includes("overcast") || weatherTextLc.includes("partly")) return "cloud";
    if (weatherTextLc.includes("clear") || weatherTextLc.includes("sunny")) return "clear";
    if (weatherTextLc.includes("wind")) return "wind";
    return "default";
  };

  const weatherMode = getWeatherMode();
  const showRain = weatherMode === "rain" || weatherMode === "storm";
  const showClouds = weatherMode === "cloud" || weatherMode === "mist" || weatherMode === "wind";
  const showSun = weatherMode === "clear" || weatherMode === "default";
  const rainDrops = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div>
      <div
        className={`weather-card weather-mode-${weatherMode}`}
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
        <div className="weather-overlay" />
        {showClouds && (
          <div className="weather-cloud-layer" aria-hidden="true">
            <span className="weather-cloud cloud-a" />
            <span className="weather-cloud cloud-b" />
          </div>
        )}
        {showRain && (
          <div className="weather-rain-layer" aria-hidden="true">
            {rainDrops.map((idx) => (
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
          <span className={`weather-icon weather-icon-${weatherMode}`} style={{ fontSize: 31, lineHeight: 1 }}>
            {getWeatherIcon()}
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
            {weatherPlace}
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
            {formatWeatherTemp()} <span style={{ fontSize: 13, fontWeight: 700, color: "#1F2937" }}>• {formatWeatherTextRu()}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {mainSections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              if (s.soon) return;
              onOpenSection(s.id);
            }}
            style={{
              ...cd,
              padding: "20px 10px",
              cursor: s.soon ? "default" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              fontFamily: "inherit",
              color: T.text,
              position: "relative",
              opacity: mt ? 1 : 0,
              transform: mt ? "translateY(0)" : "translateY(12px)",
              transition: `all 0.4s ease ${i * 0.05}s`,
            }}
            onMouseEnter={(e) => {
              if (!s.soon) e.currentTarget.style.boxShadow = T.shH;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = T.sh;
            }}
          >
            {s.soon && (
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  fontSize: 8,
                  fontWeight: 700,
                  color: T.light,
                  background: T.bg,
                  padding: "2px 6px",
                  borderRadius: 4,
                  textTransform: "uppercase",
                }}
              >
                скоро
              </div>
            )}
            <div
              style={{
                fontSize: 28,
                marginBottom: 8,
                filter: s.soon ? "grayscale(0.6) opacity(0.4)" : "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              {s.id === "housing" ? <HomeIcon size={28} /> : s.id === "events" ? <CalendarIcon size={28} /> : s.icon}
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, opacity: s.soon ? 0.4 : 1 }}>{s.title}</div>
            <div style={{ fontSize: 11, color: T.mid, marginTop: 3, opacity: s.soon ? 0.3 : 0.7 }}>{s.desc}</div>
          </button>
        ))}
      </div>

      {chatSection && (
        <button
          onClick={onOpenChat}
          style={{
            ...cd,
            marginTop: 12,
            width: "100%",
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            color: T.text,
            textAlign: "left",
            opacity: mt ? 1 : 0,
            transform: mt ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.4s ease 0.35s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = T.shH;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = T.sh;
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: T.primaryLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {chatSection.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>AI Чат</div>
            <div style={{ fontSize: 11, color: T.mid, marginTop: 3, opacity: 0.7 }}>{chatSection.desc}</div>
          </div>
        </button>
      )}

      <style jsx>{`
        .weather-card {
          position: relative;
          overflow: hidden;
          animation: weatherCardFloat 5.8s ease-in-out infinite;
        }
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
        .cloud-a {
          width: 120px;
          height: 34px;
          top: 8px;
          left: -32px;
          animation: weatherCloudMoveA 14s linear infinite;
        }
        .cloud-b {
          width: 90px;
          height: 28px;
          top: 44px;
          left: -26px;
          animation: weatherCloudMoveB 11s linear infinite;
        }
        .weather-rain-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
        }
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
        .weather-icon {
          display: inline-block;
          transform-origin: 50% 50%;
        }
        .weather-icon-clear,
        .weather-icon-default {
          animation: weatherIconSunny 4s ease-in-out infinite;
        }
        .weather-icon-rain,
        .weather-icon-storm {
          animation: weatherIconRain 1.4s ease-in-out infinite;
        }
        .weather-icon-cloud,
        .weather-icon-mist,
        .weather-icon-wind {
          animation: weatherIconCloud 3.2s ease-in-out infinite;
        }
        .weather-icon-snow {
          animation: weatherIconSnow 2.4s ease-in-out infinite;
        }
        @keyframes weatherCardFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-1px);
          }
        }
        @keyframes weatherOverlayPulse {
          0%,
          100% {
            opacity: 0.45;
          }
          50% {
            opacity: 0.75;
          }
        }
        @keyframes weatherCloudMoveA {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(150%);
          }
        }
        @keyframes weatherCloudMoveB {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(170%);
          }
        }
        @keyframes weatherRainDrop {
          from {
            transform: translateY(0);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
          }
          to {
            transform: translateY(95px);
            opacity: 0;
          }
        }
        @keyframes weatherSunGlow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.8;
          }
        }
        @keyframes weatherIconSunny {
          0%,
          100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(8deg) scale(1.06);
          }
        }
        @keyframes weatherIconRain {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(2px);
          }
        }
        @keyframes weatherIconCloud {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(2px);
          }
        }
        @keyframes weatherIconSnow {
          0%,
          100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-8deg) scale(1.04);
          }
        }
      `}</style>
    </div>
  );
}
