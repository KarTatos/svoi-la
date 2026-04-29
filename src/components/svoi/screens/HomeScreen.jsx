import WeatherCard from "../layout/WeatherCard";

function IconUscis({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

function IconPin({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function IconLightbulb({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.4-1.4 4.5-3.5 5.5V17H9.5v-2.5C7.4 13.5 6 11.4 6 9a6 6 0 0 1 6-6z" />
    </svg>
  );
}

function IconCalendar({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <circle cx="8" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconBriefcase({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="3" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M12 12v3M2 12h20" />
    </svg>
  );
}

function IconHome({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3.8l9 6.7" />
      <path d="M5 9.5v9.5h14V9.5" />
      <path d="M9.5 19V14h5v5" />
    </svg>
  );
}

function IconTag({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconChat({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const SECTION_ICONS = {
  uscis: IconUscis,
  places: IconPin,
  tips: IconLightbulb,
  events: IconCalendar,
  jobs: IconBriefcase,
  housing: IconHome,
  sell: IconTag,
  "community-chat": IconChat,
};

function SectionIcon({ id, size = 26, color }) {
  const Icon = SECTION_ICONS[id];
  if (!Icon) return <span style={{ fontSize: size * 0.9, lineHeight: 1 }}>✦</span>;
  return <span style={{ color, display: "inline-flex" }}><Icon size={size} /></span>;
}

export default function HomeScreen({
  T, cd, mt,
  profileLocation, profileWeather,
  sections,
  onOpenSection, onOpenChat,
}) {
  const gridSections = sections.filter((s) => s.id !== "chat-sec");
  const chatSection = sections.find((s) => s.id === "chat-sec");

  return (
    <div>
      <WeatherCard T={T} cd={cd} profileLocation={profileLocation} profileWeather={profileWeather} />

      {/* Main sections grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
        {gridSections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              if (s.soon) return;
              onOpenSection(s.id);
            }}
            style={{
              background: T.card,
              border: `1px solid ${T.borderL}`,
              borderRadius: T.r,
              boxShadow: T.sh,
              padding: "18px 8px 14px",
              cursor: s.soon ? "default" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              fontFamily: "inherit",
              color: T.text,
              position: "relative",
              opacity: mt ? 1 : 0,
              transform: mt ? "translateY(0)" : "translateY(14px)",
              transition: `opacity 0.35s ease ${i * 0.04}s, transform 0.35s ease ${i * 0.04}s`,
            }}
            onMouseEnter={(e) => { if (!s.soon) e.currentTarget.style.boxShadow = T.shH; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.sh; }}
          >
            {s.soon && (
              <div style={{
                position: "absolute", top: 6, right: 6,
                fontSize: 8, fontWeight: 800,
                color: "#fff",
                background: T.mid,
                padding: "2px 5px", borderRadius: 4,
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                скоро
              </div>
            )}

            {/* Icon container */}
            <div style={{
              width: 46, height: 46, borderRadius: 13,
              background: s.soon ? T.bg : `${T.primary}12`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 9,
              color: s.soon ? T.light : T.primary,
              filter: s.soon ? "grayscale(1) opacity(0.4)" : "none",
            }}>
              <SectionIcon id={s.id} size={22} color={s.soon ? T.light : T.primary} />
            </div>

            <div style={{
              fontWeight: 700, fontSize: 13, lineHeight: 1.2,
              opacity: s.soon ? 0.4 : 1,
            }}>
              {s.title}
            </div>
            <div style={{
              fontSize: 10.5, color: T.mid, marginTop: 3,
              opacity: s.soon ? 0.3 : 0.8, lineHeight: 1.3,
            }}>
              {s.desc}
            </div>
          </button>
        ))}
      </div>

      {/* AI Chat banner */}
      {chatSection && (
        <button
          onClick={onOpenChat}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 14,
            background: "#111827",
            border: "none",
            borderRadius: 18,
            padding: "14px 16px",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
            opacity: mt ? 1 : 0,
            transform: mt ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.4s ease 0.32s, transform 0.4s ease 0.32s",
            marginTop: 2,
          }}
        >
          {/* Orange icon */}
          <div style={{
            width: 46, height: 46, borderRadius: 13, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.primary}, #E8630A)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 10px rgba(244,123,32,0.4)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Text */}
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>AI Чат</span>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
              Помощник · спросите про что угодно
            </div>
          </div>

          {/* Arrow */}
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: "rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}
