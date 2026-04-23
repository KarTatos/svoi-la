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
  const getWeatherAriaLabel = () => {
    const labels = {
      clear: "Ясная погода",
      partly: "Переменная облачность",
      cloud: "Облачная погода",
      rain: "Дождь",
      storm: "Гроза",
      snow: "Снег",
      fog: "Туман",
      wind: "Ветер",
    };
    return labels[weatherKind] || "Погода";
  };

  return (
    <div>
      <div className={`weather-card weather-${weatherKind}`} style={{ ...cd, marginBottom:14, padding:"12px 14px", background:"#FDF0E0", borderColor:"#F4E1CC", display:"flex", alignItems:"center", gap:12 }}>
        <div className={`weather-icon-shell weather-${weatherKind}`} aria-label={getWeatherAriaLabel()} role="img" style={{ width:58, height:58, borderRadius:18, background:"#FFFFFF", border:"1px solid #F3E6D7", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 14px rgba(0,0,0,0.08)", flexShrink:0 }}>
          <span className="weather-sky" />
          <span className="weather-sun-core" />
          <span className="weather-sun-ring" />
          <span className="weather-cloud weather-cloud-a" />
          <span className="weather-cloud weather-cloud-b" />
          <span className="weather-rain weather-rain-1" />
          <span className="weather-rain weather-rain-2" />
          <span className="weather-rain weather-rain-3" />
          <span className="weather-rain weather-rain-4" />
          <span className="weather-snow-dot weather-snow-1" />
          <span className="weather-snow-dot weather-snow-2" />
          <span className="weather-snow-dot weather-snow-3" />
          <span className="weather-fog-line weather-fog-1" />
          <span className="weather-fog-line weather-fog-2" />
          <span className="weather-fog-line weather-fog-3" />
          <span className="weather-wind-line weather-wind-1" />
          <span className="weather-wind-line weather-wind-2" />
          <span className="weather-bolt" />
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
          animation: weatherCardBreathe 7s ease-in-out infinite;
        }
        .weather-card::before,
        .weather-card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .weather-card::before {
          opacity: 0.5;
          background:
            radial-gradient(circle at 18% 20%, rgba(255,255,255,0.58), transparent 26%),
            radial-gradient(circle at 86% 8%, rgba(255,190,118,0.22), transparent 34%);
          animation: weatherGlowDrift 9s ease-in-out infinite;
        }
        .weather-card::after {
          opacity: 0.45;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.35) 45%, transparent 75%);
          transform: translateX(-80%);
          animation: weatherSheen 8s ease-in-out infinite;
        }
        .weather-card.weather-rain,
        .weather-card.weather-storm {
          background: linear-gradient(135deg, #F7EBDE 0%, #EEF2FF 100%) !important;
        }
        .weather-card.weather-cloud,
        .weather-card.weather-fog,
        .weather-card.weather-wind,
        .weather-card.weather-snow {
          background: linear-gradient(135deg, #F9EEE1 0%, #F7F8FC 100%) !important;
        }
        .weather-card.weather-clear,
        .weather-card.weather-partly {
          background: linear-gradient(135deg, #FDF0E0 0%, #FFF5EA 100%) !important;
        }
        .weather-icon-shell {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        .weather-sky,
        .weather-sun-core,
        .weather-sun-ring,
        .weather-cloud,
        .weather-rain,
        .weather-snow-dot,
        .weather-fog-line,
        .weather-wind-line,
        .weather-bolt,
        .weather-flash {
          position: absolute;
          display: block;
          pointer-events: none;
        }
        .weather-sky {
          inset: 0;
          background: linear-gradient(160deg, #FFFFFF 0%, #FFF4E6 100%);
          z-index: 0;
        }
        .weather-rain .weather-sky,
        .weather-storm .weather-sky {
          background: linear-gradient(160deg, #FFFFFF 0%, #EDF3FF 100%);
        }
        .weather-cloud .weather-sky,
        .weather-fog .weather-sky,
        .weather-wind .weather-sky,
        .weather-snow .weather-sky {
          background: linear-gradient(160deg, #FFFFFF 0%, #F4F6FB 100%);
        }
        .weather-sun-core {
          width: 26px;
          height: 26px;
          left: 16px;
          top: 16px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 32%, #FFE58A 0%, #FFC13D 42%, #F47B20 100%);
          box-shadow: 0 0 18px rgba(244,123,32,0.38);
          z-index: 2;
          opacity: 0;
          transform: scale(0.8);
        }
        .weather-sun-ring {
          width: 38px;
          height: 38px;
          left: 10px;
          top: 10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,206,90,0.34), transparent 70%);
          z-index: 1;
          opacity: 0;
        }
        .weather-cloud {
          width: 30px;
          height: 15px;
          border-radius: 999px;
          background: #D8DDE8;
          box-shadow: 0 5px 12px rgba(77,91,124,0.12);
          z-index: 4;
          opacity: 0;
        }
        .weather-cloud::before,
        .weather-cloud::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          background: inherit;
        }
        .weather-cloud::before {
          width: 15px;
          height: 15px;
          left: 5px;
          top: -8px;
        }
        .weather-cloud::after {
          width: 18px;
          height: 18px;
          right: 4px;
          top: -10px;
        }
        .weather-cloud-a {
          left: 17px;
          top: 27px;
        }
        .weather-cloud-b {
          width: 23px;
          height: 12px;
          left: 6px;
          top: 31px;
          background: #EEF1F7;
          z-index: 3;
        }
        .weather-rain {
          width: 2px;
          height: 11px;
          border-radius: 999px;
          background: #4D88FF;
          z-index: 5;
          opacity: 0;
        }
        .weather-rain-1 { left: 18px; top: 33px; animation-delay: 0s; }
        .weather-rain-2 { left: 25px; top: 36px; animation-delay: 0.18s; }
        .weather-rain-3 { left: 33px; top: 33px; animation-delay: 0.35s; }
        .weather-rain-4 { left: 40px; top: 36px; animation-delay: 0.52s; }
        .weather-snow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #86A8FF;
          z-index: 5;
          opacity: 0;
        }
        .weather-snow-1 { left: 18px; top: 32px; animation-delay: 0s; }
        .weather-snow-2 { left: 29px; top: 34px; animation-delay: 0.35s; }
        .weather-snow-3 { left: 39px; top: 31px; animation-delay: 0.7s; }
        .weather-fog-line,
        .weather-wind-line {
          height: 3px;
          border-radius: 999px;
          background: #B7C0D2;
          z-index: 6;
          opacity: 0;
        }
        .weather-fog-1 { width: 35px; left: 12px; top: 22px; animation-delay: 0s; }
        .weather-fog-2 { width: 27px; left: 18px; top: 31px; animation-delay: 0.24s; }
        .weather-fog-3 { width: 32px; left: 12px; top: 40px; animation-delay: 0.48s; }
        .weather-wind-1 { width: 34px; left: 10px; top: 25px; animation-delay: 0s; }
        .weather-wind-2 { width: 24px; left: 20px; top: 36px; animation-delay: 0.3s; }
        .weather-bolt {
          width: 12px;
          height: 22px;
          left: 30px;
          top: 26px;
          background: #F7B733;
          clip-path: polygon(46% 0, 100% 0, 62% 43%, 92% 43%, 28% 100%, 42% 55%, 10% 55%);
          z-index: 7;
          opacity: 0;
        }
        .weather-flash {
          inset: 0;
          background: rgba(255,255,255,0.64);
          opacity: 0;
          z-index: 8;
        }

        .weather-clear .weather-sun-core,
        .weather-partly .weather-sun-core {
          opacity: 1;
          animation: weatherSunPulse 3.2s ease-in-out infinite;
        }
        .weather-clear .weather-sun-ring,
        .weather-partly .weather-sun-ring {
          opacity: 1;
          animation: weatherSunRing 3.2s ease-in-out infinite;
        }
        .weather-partly .weather-sun-core {
          left: 12px;
          top: 13px;
        }
        .weather-partly .weather-sun-ring {
          left: 6px;
          top: 7px;
        }
        .weather-partly .weather-cloud-a,
        .weather-cloud .weather-cloud-a,
        .weather-cloud .weather-cloud-b,
        .weather-rain .weather-cloud-a,
        .weather-rain .weather-cloud-b,
        .weather-storm .weather-cloud-a,
        .weather-storm .weather-cloud-b,
        .weather-snow .weather-cloud-a,
        .weather-snow .weather-cloud-b {
          opacity: 1;
          animation: weatherCloudFloat 4.8s ease-in-out infinite;
        }
        .weather-rain .weather-drop,
        .weather-storm .weather-drop {
          opacity: 0.95;
        }
        .weather-rain .weather-rain,
        .weather-storm .weather-rain {
          opacity: 1;
          animation: weatherRainFall 1.05s linear infinite;
        }
        .weather-snow .weather-snow-dot {
          opacity: 1;
          animation: weatherSnowFall 2.2s ease-in-out infinite;
        }
        .weather-fog .weather-fog-line {
          opacity: 1;
          animation: weatherFogSlide 3.4s ease-in-out infinite;
        }
        .weather-wind .weather-wind-line {
          opacity: 1;
          animation: weatherWindSlide 2.2s ease-in-out infinite;
        }
        .weather-storm .weather-bolt {
          opacity: 1;
          animation: weatherBoltFlicker 4.6s linear infinite;
        }
        .weather-storm .weather-flash {
          animation: weatherFlash 4.6s linear infinite;
        }

        @keyframes weatherCardBreathe {
          0% { transform: translateY(0); }
          50% { transform: translateY(-1px) scale(1.003); }
          100% { transform: translateY(0); }
        }
        @keyframes weatherGlowDrift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
        }
        @keyframes weatherSheen {
          0%, 48%, 100% { transform: translateX(-80%); opacity: 0; }
          62% { transform: translateX(80%); opacity: 0.45; }
        }
        @keyframes weatherSunPulse {
          0%, 100% { transform: scale(0.96); box-shadow: 0 0 14px rgba(244,123,32,0.28); }
          50% { transform: scale(1.04); box-shadow: 0 0 22px rgba(244,123,32,0.45); }
        }
        @keyframes weatherSunRing {
          0%, 100% { transform: scale(0.9); opacity: 0.45; }
          50% { transform: scale(1.14); opacity: 0.75; }
        }
        @keyframes weatherCloudFloat {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(3px) translateY(-1px); }
        }
        @keyframes weatherRainFall {
          0% { transform: translateY(-5px) rotate(12deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(18px) rotate(12deg); opacity: 0; }
        }
        @keyframes weatherSnowFall {
          0% { transform: translateY(-4px) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(18px) translateX(4px); opacity: 0; }
        }
        @keyframes weatherFogSlide {
          0%, 100% { transform: translateX(-3px); opacity: 0.55; }
          50% { transform: translateX(4px); opacity: 1; }
        }
        @keyframes weatherWindSlide {
          0%, 100% { transform: translateX(-6px); opacity: 0.45; }
          50% { transform: translateX(7px); opacity: 1; }
        }
        @keyframes weatherBoltFlicker {
          0%, 42%, 48%, 100% { opacity: 0; }
          43%, 45% { opacity: 1; }
        }
        @keyframes weatherFlash {
          0%, 42%, 48%, 100% { opacity: 0; }
          43% { opacity: 0.55; }
          45% { opacity: 0.28; }
        }
      `}</style>
    </div>
  );
}
