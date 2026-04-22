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

  return (
    <div>
      <div style={{ ...cd, marginBottom:12, padding:"12px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>👤</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name || "Гость"}</div>
            <div style={{ fontSize:11, color:T.mid, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{profileLocation || "Определяем локацию..."}</div>
          </div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{profileWeather?.temp || "--°"}</div>
          <div style={{ fontSize:11, color:T.mid, maxWidth:130, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{profileWeather?.text || "Погода..."}</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {mainSections.map((s,i) => (
          <button
            key={s.id}
            onClick={() => { if (s.soon) return; onOpenSection(s.id); }}
            style={{ ...cd, padding:"20px 10px", cursor:s.soon?"default":"pointer", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", fontFamily:"inherit", color:T.text, position:"relative", opacity:mt?1:0, transform:mt?"translateY(0)":"translateY(12px)", transition:`all 0.4s ease ${i*0.05}s` }}
            onMouseEnter={e=>{if(!s.soon)e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}
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
          onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}
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
