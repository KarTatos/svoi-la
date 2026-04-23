export default function HomeScreen({
  T,
  cd,
  mt,
  user,
  profileLocation,
  profileWeather,
  sections,
  HomeIcon,
  CalendarIcon,
  onOpenSection,
  onOpenChat,
}) {
  const weatherPlace = (profileLocation || "Los Angeles").split(",")[0].trim().toUpperCase();
  const weatherTextRaw = String(profileWeather?.text || "").toLowerCase();

  const getWeatherKind = () => {
    const text = weatherTextRaw;
    if (!text) return "partly";
    if (text.includes("thunder") || text.includes("storm")) return "storm";
    if (text.includes("snow") || text.includes("sleet") || text.includes("blizzard")) return "snow";
    if (text.includes("rain") || text.includes("shower") || text.includes("drizzle")) return "rain";
    if (text.includes("fog") || text.includes("mist") || text.includes("haze") || text.includes("smoke")) return "fog";
    if (text.includes("cloudy") || text.includes("overcast")) return "cloud";
    if (text.includes("partly") || text.includes("mostly sunny") || text.includes("mostly clear")) return "partly";
    if (text.includes("clear") || text.includes("sunny")) return "clear";
    if (text.includes("wind")) return "wind";
    return "partly";
  };

  const weatherKind = getWeatherKind();

  const formatWeatherTemp = () => {
    const raw = String(profileWeather?.temp || "").trim();
    const match = raw.match(/(-?\d+(?:\.\d+)?)\s*°?\s*([CF])?/i);
    if (!match) return raw || "--°";

    const value = Number(match[1]);
    const unit = String(match[2] || "").toUpperCase();
    if (!Number.isFinite(value)) return raw || "--°";

    if (unit === "F") {
      const c = Math.round((value - 32) * 5 / 9);
      return `${Math.round(value)}°F (${c}°C)`;
    }
    if (unit === "C") return `${Math.round(value)}°C`;
    return `${Math.round(value)}°`;
  };
  const formatWeatherTextRu = () => {
    const text = weatherTextRaw;
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
  };
  const getWeatherIcon = () => {
    const text = weatherTextRaw;
    if (!text) return "🌤️";
    if (text.includes("thunder") || text.includes("storm")) return "⛈️";
    if (text.includes("snow") || text.includes("sleet") || text.includes("blizzard")) return "❄️";
    if (text.includes("rain") || text.includes("shower") || text.includes("drizzle")) return "🌧️";
    if (text.includes("fog") || text.includes("mist") || text.includes("haze") || text.includes("smoke")) return "🌫️";
    if (text.includes("cloudy") || text.includes("overcast")) return "☁️";
    if (text.includes("partly") || text.includes("mostly sunny") || text.includes("mostly clear")) return "🌤️";
    if (text.includes("clear") || text.includes("sunny")) return "☀️";
    if (text.includes("wind")) return "💨";
    return "🌤️";
  };

  return (
    <div>
      <div className={`weather-card weather-${weatherKind}`} style={{ ...cd, marginBottom:14, padding:"12px 14px", background:"#FDF0E0", borderColor:"#F4E1CC", display:"flex", alignItems:"center", gap:12 }}>
        <div className={`weather-icon-shell weather-${weatherKind}`} style={{ width:58, height:58, borderRadius:18, background:"#FFFFFF", border:"1px solid #F3E6D7", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 14px rgba(0,0,0,0.08)", flexShrink:0 }}>
          <span className="weather-main-icon" style={{ fontSize:31, lineHeight:1 }}>{getWeatherIcon()}</span>
          <span className="weather-aura" />
          <span className="weather-cloud-fx">☁️</span>
          <span className="weather-drop weather-drop-1" />
          <span className="weather-drop weather-drop-2" />
          <span className="weather-drop weather-drop-3" />
          <span className="weather-snow weather-snow-1">•</span>
          <span className="weather-snow weather-snow-2">•</span>
          <span className="weather-flash" />
        </div>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:11, letterSpacing:"0.06em", fontWeight:800, color:"#4B5563", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {weatherPlace}
          </div>
          <div style={{ fontSize:19, lineHeight:1.1, fontWeight:700, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {formatWeatherTemp()} <span style={{ fontSize:13, fontWeight:700, color:"#1F2937" }}>• {formatWeatherTextRu()}</span>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              if (s.id === "chat-sec") {
                onOpenChat();
                return;
              }
              if (s.soon) return;
              onOpenSection(s.id);
            }}
            style={{
              ...cd,
              padding:"20px 10px",
              cursor:s.soon?"default":"pointer",
              display:"flex",
              flexDirection:"column",
              alignItems:"center",
              textAlign:"center",
              fontFamily:"inherit",
              color:T.text,
              position:"relative",
              opacity:mt?1:0,
              transform:mt?"translateY(0)":"translateY(12px)",
              transition:`all 0.4s ease ${i * 0.05}s`,
              background:s.accent ? "linear-gradient(160deg, #FFF8F2 0%, #FFECDC 100%)" : cd.background,
              borderColor:s.accent ? "#F7D8B7" : cd.borderColor,
            }}
            onMouseEnter={(e) => { if (!s.soon) e.currentTarget.style.boxShadow = T.shH; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.sh; }}
          >
            {s.soon && <div style={{ position:"absolute", top:6, right:6, fontSize:8, fontWeight:700, color:T.light, background:T.bg, padding:"2px 6px", borderRadius:4, textTransform:"uppercase" }}>скоро</div>}
            <div style={{ fontSize:28, marginBottom:8, filter:s.soon?"grayscale(0.6) opacity(0.4)":"none", display:"inline-flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
              {s.id === "housing" ? <HomeIcon size={28} /> : s.id === "events" ? <CalendarIcon size={28} /> : s.icon}
            </div>
            <div style={{ fontWeight:700, fontSize:13, opacity:s.soon?0.4:1 }}>{s.title}</div>
            <div style={{ fontSize:11, color:T.mid, marginTop:3, opacity:s.soon?0.3:0.7 }}>{s.desc}</div>
          </button>
        ))}
      </div>

      <style>{`
        .weather-card {
          position: relative;
          overflow: hidden;
          animation: weatherCardFloat 5.8s ease-in-out infinite;
        }
        .weather-card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.45;
          background: linear-gradient(115deg, rgba(255,255,255,0.20), rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.16));
          animation: weatherCardSheen 7s ease-in-out infinite;
        }
        .weather-card.weather-rain,
        .weather-card.weather-storm,
        .weather-card.weather-cloud,
        .weather-card.weather-fog {
          background: #F8EDDF !important;
        }
        .weather-card.weather-clear,
        .weather-card.weather-partly {
          background: #FDF0E0 !important;
        }
        .weather-icon-shell {
          position: relative;
          overflow: hidden;
        }
        .weather-main-icon {
          position: relative;
          z-index: 3;
          animation: weatherIconBounce 3.2s ease-in-out infinite;
        }
        .weather-aura {
          position: absolute;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255, 201, 92, 0.55) 0%, rgba(255, 201, 92, 0) 72%);
          opacity: 0;
          z-index: 1;
        }
        .weather-cloud-fx {
          position: absolute;
          top: 15px;
          left: -22px;
          font-size: 15px;
          opacity: 0;
          z-index: 2;
        }
        .weather-drop {
          position: absolute;
          width: 2.5px;
          height: 8px;
          border-radius: 4px;
          background: #4C7CF3;
          opacity: 0;
          z-index: 2;
        }
        .weather-drop-1 { left: 18px; top: 14px; animation-delay: 0.1s; }
        .weather-drop-2 { left: 27px; top: 10px; animation-delay: 0.45s; }
        .weather-drop-3 { left: 36px; top: 12px; animation-delay: 0.8s; }
        .weather-snow {
          position: absolute;
          font-size: 9px;
          line-height: 1;
          color: #8AA7FF;
          opacity: 0;
          z-index: 2;
        }
        .weather-snow-1 { left: 20px; top: 10px; animation-delay: 0.15s; }
        .weather-snow-2 { left: 35px; top: 12px; animation-delay: 0.6s; }
        .weather-flash {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.52);
          opacity: 0;
          z-index: 4;
          pointer-events: none;
        }

        .weather-clear .weather-aura,
        .weather-partly .weather-aura {
          opacity: 1;
          animation: weatherSunAura 2.5s ease-in-out infinite;
        }
        .weather-cloud .weather-cloud-fx,
        .weather-rain .weather-cloud-fx,
        .weather-storm .weather-cloud-fx,
        .weather-fog .weather-cloud-fx,
        .weather-wind .weather-cloud-fx,
        .weather-partly .weather-cloud-fx {
          opacity: 0.78;
          animation: weatherCloudDrift 3.8s linear infinite;
        }
        .weather-rain .weather-drop,
        .weather-storm .weather-drop {
          opacity: 0.95;
          animation: weatherRainFall 1.25s ease-in infinite;
        }
        .weather-snow .weather-snow {
          opacity: 0.9;
          animation: weatherSnowFall 2.1s linear infinite;
        }
        .weather-storm .weather-flash {
          animation: weatherStormFlash 4.6s linear infinite;
        }

        @keyframes weatherCardFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
          100% { transform: translateY(0); }
        }
        @keyframes weatherCardSheen {
          0% { transform: translateX(-24%); }
          50% { transform: translateX(6%); }
          100% { transform: translateX(-24%); }
        }
        @keyframes weatherIconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        @keyframes weatherSunAura {
          0%, 100% { transform: scale(0.92); opacity: 0.55; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        @keyframes weatherCloudDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(35px); }
        }
        @keyframes weatherRainFall {
          0% { transform: translateY(-2px); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translateY(28px); opacity: 0; }
        }
        @keyframes weatherSnowFall {
          0% { transform: translateY(-2px) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(26px) translateX(4px); opacity: 0; }
        }
        @keyframes weatherStormFlash {
          0%, 40%, 100% { opacity: 0; }
          42% { opacity: 0.58; }
          43% { opacity: 0; }
          45% { opacity: 0.4; }
          46% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
