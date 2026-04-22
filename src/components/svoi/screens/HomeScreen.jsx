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
  const chatSection = sections.find((s) => s.id === "chat-sec");
  const mainSections = sections.filter((s) => s.id !== "chat-sec");
  const weatherPlace = (profileLocation || "Los Angeles").split(",")[0].trim().toUpperCase();

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
  const getWeatherIcon = () => {
    const text = String(profileWeather?.text || "").toLowerCase();
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
      <div style={{ ...cd, marginBottom:14, padding:"12px 14px", background:"#FDF0E0", borderColor:"#F4E1CC", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:58, height:58, borderRadius:18, background:"#FFFFFF", border:"1px solid #F3E6D7", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 14px rgba(0,0,0,0.08)", flexShrink:0 }}>
          <span style={{ fontSize:31, lineHeight:1 }}>{getWeatherIcon()}</span>
        </div>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:11, letterSpacing:"0.06em", fontWeight:800, color:"#4B5563", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {weatherPlace}
          </div>
          <div style={{ fontSize:19, lineHeight:1.1, fontWeight:700, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {formatWeatherTemp()} <span style={{ fontSize:13, fontWeight:700, color:"#1F2937" }}>• {profileWeather?.text || "Погода..."}</span>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {mainSections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              if (s.soon) return;
              onOpenSection(s.id);
            }}
            style={{ ...cd, padding:"20px 10px", cursor:s.soon?"default":"pointer", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", fontFamily:"inherit", color:T.text, position:"relative", opacity:mt?1:0, transform:mt?"translateY(0)":"translateY(12px)", transition:`all 0.4s ease ${i * 0.05}s` }}
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

      {chatSection && (
        <button
          onClick={onOpenChat}
          style={{ ...cd, marginTop:12, width:"100%", padding:"16px 18px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left", opacity:mt?1:0, transform:mt?"translateY(0)":"translateY(12px)", transition:"all 0.4s ease 0.35s" }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = T.shH; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.sh; }}
        >
          <div style={{ width:36, height:36, borderRadius:12, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{chatSection.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:13, lineHeight:1.2 }}>AI Чат</div>
            <div style={{ fontSize:11, color:T.mid, marginTop:3, opacity:0.7 }}>{chatSection.desc}</div>
          </div>
        </button>
      )}
    </div>
  );
}
