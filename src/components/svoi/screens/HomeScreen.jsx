import WeatherCard from "../layout/WeatherCard";

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
  return (
    <div>
      <WeatherCard T={T} cd={cd} profileLocation={profileLocation} profileWeather={profileWeather} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
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
              background: s.accent ? "linear-gradient(160deg, #FFF8F2 0%, #FFECDC 100%)" : cd.background,
              borderColor: s.accent ? "#F7D8B7" : cd.borderColor,
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
    </div>
  );
}
