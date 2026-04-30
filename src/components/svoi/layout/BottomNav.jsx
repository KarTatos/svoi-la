// SVG icons — clean line style, matching screenshot
function IconHome({ active }) {
  const c = active ? "#0E0E0E" : "rgba(255,255,255,0.55)";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  );
}

function IconPin({ active }) {
  const c = active ? "#0E0E0E" : "rgba(255,255,255,0.55)";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6z"/>
      <circle cx="12" cy="8" r="2"/>
    </svg>
  );
}

function IconList({ active }) {
  const c = active ? "#0E0E0E" : "rgba(255,255,255,0.55)";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2"/>
      <line x1="8" y1="8" x2="16" y2="8"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="8" y1="16" x2="13" y2="16"/>
    </svg>
  );
}

function IconPerson({ active }) {
  const c = active ? "#0E0E0E" : "rgba(255,255,255,0.55)";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7"/>
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z"/>
      <path d="M19 2 L19.8 5.2 L23 6 L19.8 6.8 L19 10 L18.2 6.8 L15 6 L18.2 5.2 Z" opacity="0.7"/>
    </svg>
  );
}

// Which root tab is active for a given scr value
function getActiveTab(scr) {
  if (!scr || scr === "home") return "home";
  if (["places", "district", "place-item", "places-cat"].includes(scr)) return "places";
  if (["uscis", "uscis-cat", "test"].includes(scr)) return "uscis";
  if (["profile", "my-places", "support"].includes(scr)) return "profile";
  return "home";
}

const TABS = [
  { id: "home",    label: "Главная",  Icon: IconHome    },
  { id: "places",  label: "Места",    Icon: IconPin     },
  { id: "uscis",   label: "USCIS",    Icon: IconList    },
  { id: "profile", label: "Профиль",  Icon: IconPerson  },
];

export default function BottomNav({ scr, setScr, user, onLogin }) {
  const active = getActiveTab(scr);

  function handleTab(id) {
    if (id === "profile" && !user) { onLogin(); return; }
    setScr(id);
  }

  function handleFAB() {
    if (!user) { onLogin(); return; }
    setScr("chat");
  }

  return (
    <div style={{
      position:        "var(--bottom-nav-position, fixed)",
      bottom:          "var(--bottom-nav-bottom, 0px)",
      left:            "var(--bottom-nav-left, 0px)",
      right:           "var(--bottom-nav-right, 0px)",
      width:           "var(--bottom-nav-width, auto)",
      maxWidth:        "var(--bottom-nav-max-width, 480px)",
      margin:          "var(--bottom-nav-margin, 0 auto)",
      transform:       "var(--bottom-nav-transform, none)",
      padding:         "0 14px",
      paddingBottom:   "calc(14px + env(safe-area-inset-bottom))",
      display:         "flex",
      alignItems:      "center",
      gap:             10,
      zIndex:          200,
      pointerEvents:   "none",   // clicks fall through the gap between pill and FAB
    }}>

      {/* ── Dark pill ── */}
      <div style={{
        flex:         1,
        background:   "#1C1C1E",
        borderRadius: 100,
        padding:      "6px",
        display:      "flex",
        alignItems:   "center",
        boxShadow:    "0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)",
        pointerEvents:"auto",
      }}>
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => handleTab(id)}
              style={{
                flex:            isActive ? "0 0 auto" : 1,
                background:      isActive ? "#FFFFFF" : "transparent",
                border:          "none",
                borderRadius:    100,
                padding:         isActive ? "8px 14px" : "8px 0",
                cursor:          "pointer",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                gap:             6,
                color:           isActive ? "#0E0E0E" : "rgba(255,255,255,0.55)",
                fontFamily:      "inherit",
                fontSize:        13,
                fontWeight:      600,
                whiteSpace:      "nowrap",
                transition:      "background 0.18s ease, padding 0.18s ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <Icon active={isActive} />
              {isActive && (
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0E0E0E", letterSpacing: "-0.1px" }}>
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── FAB ── */}
      <button
        onClick={handleFAB}
        style={{
          width:           52,
          height:          52,
          borderRadius:    "50%",
          background:      "#F47B20",
          border:          "none",
          cursor:          "pointer",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          flexShrink:      0,
          boxShadow:       "0 4px 20px rgba(244,123,32,0.45), 0 2px 8px rgba(244,123,32,0.2)",
          pointerEvents:   "auto",
          WebkitTapHighlightColor: "transparent",
          transition:      "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.93)"}
        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        onTouchStart={e => e.currentTarget.style.transform = "scale(0.93)"}
        onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <IconSparkle />
      </button>
    </div>
  );
}
