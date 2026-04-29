import WeatherCard from "../layout/WeatherCard";

// ─── Design tokens (home screen only) ───────────────────────────────────────
const D = {
  card:  '#FFFFFF',
  ink:   '#0E0E0E',
  sub:   '#8A8680',
  lime:  '#D4F84A',
  coral: '#FF6B4A',
  orange:'#FF8A3D',
  cream: '#F5EFE0',
  font:  '"Inter", system-ui, sans-serif',
  mono:  '"JetBrains Mono", ui-monospace, monospace',
  sh:    '0 1px 0 rgba(255,255,255,0.7) inset, 0 24px 40px -20px rgba(14,14,14,0.18), 0 2px 8px -2px rgba(14,14,14,0.08)',
  r:     24,
};

// ─── Colored sticker-style icons ────────────────────────────────────────────
function IconUscis({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="10" y="7" width="20" height="26" rx="3" fill="#fff" stroke="#0E0E0E" strokeWidth="1.4"/>
      <rect x="10" y="7" width="20" height="9" rx="3" fill="#FF8A3D"/>
      <rect x="10" y="13" width="20" height="3" fill="#FF8A3D"/>
      <path d="M15 22h10M15 27h7" stroke="#0E0E0E" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconPin({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 6C15.6 6 11 10 11 15.5c0 7.5 9 18.5 9 18.5s9-11 9-18.5C29 10 24.4 6 20 6z" fill="#FF6B4A" stroke="#0E0E0E" strokeWidth="1.4"/>
      <circle cx="20" cy="15.5" r="4" fill="#fff" stroke="#0E0E0E" strokeWidth="1.2"/>
    </svg>
  );
}

function IconLightbulb({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 7a9 9 0 0 1 7 14.8V26H13v-4.2A9 9 0 0 1 20 7z" fill="#F5C242" stroke="#0E0E0E" strokeWidth="1.4"/>
      <path d="M15.5 29h9M16.5 32.5h7" stroke="#0E0E0E" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconCalendar({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="7" y="10" width="26" height="24" rx="4" fill="#fff" stroke="#0E0E0E" strokeWidth="1.4"/>
      <rect x="7" y="10" width="26" height="9" rx="4" fill="#3B5FFF"/>
      <rect x="7" y="15" width="26" height="4" fill="#3B5FFF"/>
      <path d="M14 8v5M26 8v5" stroke="#0E0E0E" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="20" cy="25" r="3" fill="#FF6B4A"/>
    </svg>
  );
}

function IconBriefcase({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="7" y="15" width="26" height="19" rx="4" fill="#fff" stroke="#0E0E0E" strokeWidth="1.4"/>
      <path d="M15 15v-3a2.5 2.5 0 0 1 2.5-2.5h5A2.5 2.5 0 0 1 25 12v3" stroke="#0E0E0E" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M7 24h26" stroke="#0E0E0E" strokeWidth="1.4"/>
      <path d="M20 20v8" stroke="#0E0E0E" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconHome({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M7 20L20 9l13 11v14H7V20z" fill="#fff" stroke="#0E0E0E" strokeWidth="1.4" strokeLinejoin="round"/>
      <rect x="15" y="27" width="10" height="8" rx="2.5" fill="#A8D89A" stroke="#0E0E0E" strokeWidth="1.2"/>
    </svg>
  );
}

function IconTag({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M23 8H13a2 2 0 0 0-2 2v10l11 11 13-13L23 8z" fill="#fff" stroke="#0E0E0E" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="16" cy="15" r="2.5" fill="#FF8A3D" stroke="#0E0E0E" strokeWidth="1.1"/>
    </svg>
  );
}

function IconChat({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M33 12a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-3l-7 6v-6H10a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3h23z" fill="#fff" stroke="#0E0E0E" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M14 22h12M14 26.5h8" stroke="#8A8680" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const SECTION_ICONS = {
  uscis:            IconUscis,
  places:           IconPin,
  tips:             IconLightbulb,
  events:           IconCalendar,
  jobs:             IconBriefcase,
  housing:          IconHome,
  sell:             IconTag,
  "community-chat": IconChat,
};

function SectionIcon({ id, size = 36 }) {
  const Icon = SECTION_ICONS[id];
  if (!Icon) return <span style={{ fontSize: size * 0.7, lineHeight: 1 }}>✦</span>;
  return <Icon size={size} />;
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function HomeScreen({
  T, cd, mt,
  profileLocation, profileWeather,
  sections,
  onOpenSection, onOpenChat,
}) {
  const gridSections = sections.filter((s) => s.id !== "chat-sec");
  const chatSection  = sections.find((s) => s.id === "chat-sec");

  return (
    <div style={{ fontFamily: D.font }}>
      <WeatherCard T={T} cd={cd} profileLocation={profileLocation} profileWeather={profileWeather} />

      {/* 3-column sections grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
        {gridSections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { if (s.soon) return; onOpenSection(s.id); }}
            style={{
              background:     s.soon ? D.cream : D.card,
              border:         "none",
              borderRadius:   D.r,
              boxShadow:      D.sh,
              padding:        "14px 14px 16px",
              cursor:         s.soon ? "default" : "pointer",
              display:        "flex",
              flexDirection:  "column",
              justifyContent: "space-between",
              alignItems:     "flex-start",
              textAlign:      "left",
              fontFamily:     D.font,
              color:          D.ink,
              position:       "relative",
              minHeight:      120,
              overflow:       "hidden",
              opacity:        mt ? 1 : 0,
              transform:      mt ? "translateY(0)" : "translateY(14px)",
              transition:     `opacity 0.35s ease ${i * 0.04}s, transform 0.35s ease ${i * 0.04}s`,
            }}
          >
            {/* "СКОРО" badge */}
            {s.soon && (
              <div style={{
                position:      "absolute",
                top:           9, right: 9,
                fontSize:      8, fontWeight: 700,
                color:         D.lime, background: D.ink,
                padding:       "3px 7px", borderRadius: 10,
                fontFamily:    D.mono,
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                скоро
              </div>
            )}

            {/* Icon */}
            <div style={{ opacity: s.soon ? 0.3 : 1 }}>
              <SectionIcon id={s.id} size={34} />
            </div>

            {/* Label + desc */}
            <div style={{ opacity: s.soon ? 0.4 : 1 }}>
              <div style={{
                fontWeight: 700, fontSize: 22,
                lineHeight: 1.1, letterSpacing: "-0.5px",
                color: D.ink, fontFamily: D.font,
                wordBreak: "break-word",
              }}>
                {s.title}
              </div>
              <div style={{
                fontSize: 10.5, color: D.sub,
                marginTop: 3, lineHeight: 1.3, fontFamily: D.font,
              }}>
                {s.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* AI Chat full-width card */}
      {chatSection && (
        <button
          onClick={onOpenChat}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 14,
            background: D.ink, border: "none", borderRadius: D.r,
            padding: "14px 16px", cursor: "pointer",
            fontFamily: D.font, boxShadow: D.sh,
            opacity: mt ? 1 : 0,
            transform: mt ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.4s ease 0.32s, transform 0.4s ease 0.32s",
            marginTop: 2,
          }}
        >
          {/* Orange gradient icon */}
          <div style={{
            width: 48, height: 48, borderRadius: 16, flexShrink: 0,
            background: `linear-gradient(135deg, ${D.orange}, ${D.coral})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px -6px rgba(255,107,74,0.55)",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.09 6.26H21l-5.47 3.97 2.09 6.27L12 14.53l-5.62 3.97 2.09-6.27L3 8.26h6.91L12 2z" fill="#fff"/>
            </svg>
          </div>

          {/* Text */}
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{
                fontSize: 18, fontWeight: 700, color: "#fff",
                letterSpacing: "-0.4px", fontFamily: D.font,
              }}>AI</span>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: D.lime, display: "inline-block",
                boxShadow: `0 0 8px ${D.lime}`, flexShrink: 0,
              }} />
            </div>
            <div style={{
              fontSize: 12, color: "rgba(255,255,255,0.55)",
              marginTop: 3, fontWeight: 500, fontFamily: D.font,
            }}>
              Помощник · спросите про что угодно
            </div>
          </div>

          {/* Arrow */}
          <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: "rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}
