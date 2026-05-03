import { useRef } from "react";
import Image from "next/image";
import { EVENT_CATS, CalendarIcon, StarIcon, HeartIcon, ShareIcon, limitCardText } from "../config";

// в”Ђв”Ђв”Ђ Pure helpers (events-only) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

function fmtDate(d) {
  try {
    const dt = new Date(d);
    return (
      dt.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) +
      ", " +
      dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
    );
  } catch { return d; }
}

function getEventDateBadge(value) {
  try {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return { dow: "вЂ”", day: "--", month: "вЂ”" };
    const dow   = dt.toLocaleDateString("ru-RU", { weekday: "short" }).replace(".", "");
    const month = dt.toLocaleDateString("ru-RU", { month: "short" }).replace(".", "");
    return { dow: dow.toUpperCase(), day: String(dt.getDate()), month };
  } catch {
    return { dow: "вЂ”", day: "--", month: "вЂ”" };
  }
}

function getEventTimeLabel(value) {
  try {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

function renderEventIcon(icon, size = 30) {
  if (typeof icon === "string" && icon.startsWith("/")) {
    return <Image src={icon} alt="" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />;
  }
  return icon;
}

const EVENT_CARD_PALETTES = [
  { bg: "#FDF1DB", text: "#17324D" },
  { bg: "#EAF6EE", text: "#17324D" },
  { bg: "#EEF2FC", text: "#17324D" },
  { bg: "#FCEAEA", text: "#17324D" },
];

// в”Ђв”Ђв”Ђ Main component в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

export default function EventsScreen({
  T, cd, bk, pl,
  user,
  events,
  selEC,
  setSelEC,
  seenEventIds,
  filterDate,
  setFilterDate,
  exp,
  setExp,
  favorites,
  liked,
  catEvents,
  onGoHome,
  onRequireAuth,
  onToggleFavorite,
  onToggleLike,
  onTrackView,
  onOpenEventMap,
  onNativeShare,
  onOpenPhotoViewer,
  onAddEvent,
  renderComments,
  canManageEvent,
  onEditEvent,
  normalizeExternalUrl,
}) {
  const datePickerRef = useRef(null);
  const eventsTopBarStyle = {
    display: "grid",
    gridTemplateColumns: "48px 48px 48px",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  };

  const eventsTopBtnBase = {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    flexShrink: 0,
  };

  // в”Ђв”Ђв”Ђ Category list в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  // Design tokens вЂ” С‚РѕС‡РЅРѕРµ СЃРѕРІРїР°РґРµРЅРёРµ СЃ HomeScreen
  const D = {
    card:  '#FFFFFF',
    ink:   '#0E0E0E',
    sub:   '#8A8680',
    lime:  '#D4F84A',
    font:  '"Inter", system-ui, sans-serif',
    mono:  '"JetBrains Mono", ui-monospace, monospace',
    sh:    '0 1px 0 rgba(255,255,255,0.7) inset, 0 24px 40px -20px rgba(14,14,14,0.18), 0 2px 8px -2px rgba(14,14,14,0.08)',
    r:     24,
  };

  if (!selEC) {
    return (
      <div style={{ fontFamily: D.font }}>
        <div style={eventsTopBarStyle}>
          <button
            onClick={onGoHome}
            style={{ ...eventsTopBtnBase, background: "#FFFFFF", color: "#8A8680", fontSize: 22 }}
            title="Назад"
          >
            ‹
          </button>

          <div
            style={{ ...eventsTopBtnBase, background: "#F2EADF", color: "#4D4337", fontSize: 18, cursor: "default" }}
            aria-hidden="true"
          >
            <CalendarIcon size={16} />
          </div>

          <button
            onClick={() => { if (!user) { onRequireAuth(); return; } onAddEvent(); }}
            style={{ ...eventsTopBtnBase, border: `1.5px solid ${T.primary}55`, background: T.primaryLight, color: T.primary, fontSize: 28, lineHeight: 1 }}
            title="Добавить событие"
          >
            +
          </button>
        </div>

        {/* 3-column grid вЂ” РєР°Рє РЅР° HomeScreen */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          {EVENT_CATS.map((c, i) => {
            const today      = new Date().toISOString().slice(0, 10);
            const catEventsC = events.filter((e) => e.cat === c.id);
            const upcoming   = catEventsC.filter((e) => !e.date || e.date >= today);
            const hasNew     = catEventsC.some(
              (e) =>
                !seenEventIds.current.has(String(e.id)) &&
                e.created_at &&
                Date.now() - new Date(e.created_at).getTime() < 14 * 24 * 60 * 60 * 1000
            );
            const desc = upcoming.length > 0
              ? `${upcoming.length} ${upcoming.length === 1 ? "событие" : upcoming.length < 5 ? "события" : "событий"}`
              : "мероприятия";

            return (
              <button
                key={c.id}
                onClick={() => setSelEC(c)}
                style={{
                  background:     D.card,
                  border:         "none",
                  borderRadius:   D.r,
                  boxShadow:      D.sh,
                  padding:        "14px 14px 16px",
                  cursor:         "pointer",
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
                }}
              >
                {/* NEW badge */}
                {hasNew && (
                  <div style={{
                    position:      "absolute",
                    top:           9,
                    right:         9,
                    fontSize:      8,
                    fontWeight:    700,
                    color:         D.lime,
                    background:    D.ink,
                    padding:       "3px 7px",
                    borderRadius:  10,
                    fontFamily:    D.mono,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    new
                  </div>
                )}

                {/* Icon */}
                <div style={{ fontSize: 30, lineHeight: 1 }}>
                  {renderEventIcon(c.icon, 30)}
                </div>

                {/* Title + desc */}
                <div>
                  <div style={{
                    fontWeight:    700,
                    fontSize:      "clamp(11px, 4vw, 15px)",
                    lineHeight:    1.2,
                    letterSpacing: "-0.3px",
                    color:         D.ink,
                    fontFamily:    D.font,
                  }}>
                    {c.title}
                  </div>
                  <div style={{
                    fontSize:   10.5,
                    color:      D.sub,
                    marginTop:  3,
                    lineHeight: 1.3,
                    fontFamily: D.font,
                  }}>
                    {desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // в”Ђв”Ђв”Ђ Event list in category в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

  return (
    <div>
      <button onClick={() => { setSelEC(null); setFilterDate(null); }} style={bk}>← Все события</button>

      {/* Category header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "4px 0 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${selEC.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
            {renderEventIcon(selEC.icon, 26)}
          </div>
          <div><h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{selEC.title}</h2></div>
        </div>
        <button
          onClick={() => { if (!user) { onRequireAuth(); return; } onAddEvent(); }}
          style={{ width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${T.primary}55`, background: T.primaryLight, color: T.primary, fontSize: 28, lineHeight: 1, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
          title="Добавить событие"
        >
          +
        </button>
      </div>

      {/* Date filter bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(9, minmax(0, 1fr))", gap: 6, alignItems: "stretch" }}>
          <button
            onClick={() => setFilterDate(null)}
            style={{ padding: "6px 6px", borderRadius: 12, border: `1.5px solid ${!filterDate ? T.primary : T.border}`, background: !filterDate ? T.primary : T.card, color: !filterDate ? "#fff" : T.mid, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", minWidth: 0 }}
          >
            Все
          </button>
          {Array.from({ length: 7 }, (_, i) => {
            const d        = new Date(); d.setDate(d.getDate() + i);
            const isActive = filterDate && new Date(filterDate).toDateString() === d.toDateString();
            const isToday  = i === 0;
            const todayAccent = isToday && !isActive;
            return (
              <button
                key={d.toISOString().slice(0, 10)}
                onClick={() => setFilterDate(isActive ? null : d.toISOString())}
                style={{ padding: "5px 4px", borderRadius: 12, border: `1.5px solid ${isActive ? T.primary : (todayAccent ? "#E74C3C" : T.border)}`, background: isActive ? T.primary : (todayAccent ? "#FFF5F5" : T.card), color: isActive ? "#fff" : (todayAccent ? "#C0392B" : T.text), fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", minWidth: 0, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, justifyContent: "center" }}
              >
                <span style={{ fontSize: 9, color: isActive ? "#fff" : (todayAccent ? "#C0392B" : T.light), fontWeight: 400, lineHeight: 1 }}>{isToday ? "Сегодня" : dayNames[d.getDay()]}</span>
                <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>{d.getDate()}</span>
              </button>
            );
          })}
          {/* Calendar picker */}
          <div style={{ position: "relative", minWidth: 0 }}>
            <button style={{ padding: "5px 4px", borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.card, color: T.mid, fontSize: 15, cursor: "pointer", fontFamily: "inherit", width: "100%", height: "100%", minHeight: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CalendarIcon size={16} />
            </button>
            <input
              ref={datePickerRef}
              type="date"
              onChange={(e) => { if (e.target.value) setFilterDate(e.target.value + "T00:00"); }}
              style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", WebkitAppearance: "none", appearance: "none" }}
            />
          </div>
        </div>
        {filterDate && (
          <div style={{ fontSize: 12, color: T.mid, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <CalendarIcon size={14} /> {fmtDate(filterDate).split(",").slice(0, 2).join(",")}
            <button onClick={() => setFilterDate(null)} style={{ background: "none", border: "none", color: T.primary, cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600, padding: 0 }}>✕ Сбросить</button>
          </div>
        )}
      </div>

      {/* Event cards */}
      {catEvents.map((ev, i) => {
        const isEvExp    = exp === `ev-${ev.id}`;
        const isF        = favorites[`event-${ev.id}`];
        const eventWebsite = normalizeExternalUrl(ev.website);
        const dateBadge  = getEventDateBadge(ev.date);
        const eventTime  = getEventTimeLabel(ev.date);
        const palette    = EVENT_CARD_PALETTES[i % EVENT_CARD_PALETTES.length];
        const goingCount = Math.max(Number(ev.likes) || 0, 0);

        return (
          <div key={ev.id} style={{ ...cd, marginBottom: 12, overflow: "hidden", borderColor: isEvExp ? T.primary + "40" : T.borderL, padding: 0 }}>
            <div
              onClick={() => { const nextOpen = !isEvExp; setExp(nextOpen ? `ev-${ev.id}` : null); if (nextOpen) onTrackView("event", ev); }}
              style={{ padding: "14px 14px 12px", cursor: "pointer", background: T.card }}
            >
              <div style={{ display: "flex", alignItems: "stretch", gap: 12 }}>
                {/* Date badge */}
                <div style={{ width: 72, minWidth: 72, borderRadius: 18, background: palette.bg, color: palette.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 6px", textAlign: "center", boxSizing: "border-box" }}>
                  <div style={{ fontSize: 14, lineHeight: 1, fontWeight: 700, color: "#8D97AC", marginBottom: 4 }}>{dateBadge.dow}</div>
                  <div style={{ fontSize: 24, lineHeight: 1, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>{dateBadge.day}</div>
                  <div style={{ fontSize: 14, lineHeight: 1, fontWeight: 700, color: "#8D97AC" }}>{dateBadge.month}</div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.22, color: T.text, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</div>
                      <div style={{ fontSize: 13, color: "#8D97AC", display: "flex", alignItems: "center", gap: 6, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <span style={{ color: "#F26AA0", fontSize: 12, lineHeight: 1 }}>📍</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{ev.location || "Локация уточняется"}{eventTime ? ` В· ${eventTime}` : ""}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, marginTop: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.primary }}>{goingCount} человек идет</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(ev.id, "event"); }}
                        style={{ width: 28, height: 28, borderRadius: 999, border: "none", background: "#F6F7FB", cursor: "pointer", fontFamily: "inherit", color: isF ? "#D68910" : "#A7AFBF", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Избранное"
                      >
                        <StarIcon active={!!isF} size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleLike(ev.id, "event"); }}
                        style={{ minWidth: 38, height: 28, borderRadius: 999, border: "none", background: "#FFF2F0", cursor: "pointer", fontFamily: "inherit", color: liked[`event-${ev.id}`] ? "#E74C3C" : "#D37A7A", padding: "0 9px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 12, fontWeight: 700 }}
                        title="Лайк"
                      >
                        <HeartIcon active={!!liked[`event-${ev.id}`]} size={13} /> {ev.likes}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded section */}
              {isEvExp && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.borderL}` }}>
                  {ev.location && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                      <button onClick={(e) => { e.stopPropagation(); onOpenEventMap(ev.location, "google"); }} style={{ ...pl(false), padding: "8px 10px", fontSize: 12 }}>Google Maps</button>
                      <button onClick={(e) => { e.stopPropagation(); onOpenEventMap(ev.location, "apple"); }} style={{ ...pl(false), padding: "8px 10px", fontSize: 12 }}>Apple Maps</button>
                    </div>
                  )}
                  {eventWebsite && (
                    <a href={eventWebsite} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: "inline-block", fontSize: 13, color: T.primary, textDecoration: "none", marginBottom: 10 }}>
                      Сайт мероприятия
                    </a>
                  )}
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: T.mid, marginBottom: 10, whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word" }}>{limitCardText(ev.desc)}</div>
                  {ev.photos?.length > 0 && (
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 10, paddingBottom: 4, scrollSnapType: "x mandatory" }}>
                      {ev.photos.map((ph, pi) => (
                        <Image key={pi} src={ph} alt="" width={86} height={86} unoptimized style={{ width: 86, height: 86, objectFit: "cover", borderRadius: 10, border: `1px solid ${T.border}`, cursor: "zoom-in", flexShrink: 0, scrollSnapAlign: "start" }} onClick={(e) => { e.stopPropagation(); onOpenPhotoViewer(ev.photos, pi); }} />
                      ))}
                    </div>
                  )}
                  {ev.photos?.length > 1 && <div style={{ fontSize: 11, color: T.light, marginTop: -6, marginBottom: 8 }}>Листайте фото →</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: T.light }}>от {ev.author}</span>
                    <span style={{ fontSize: 10, color: isEvExp ? T.primary : T.light, transform: isEvExp ? "rotate(180deg)" : "", transition: "0.3s" }}>▾</span>
                  </div>
                </div>
              )}
            </div>

            {isEvExp && (
              <div style={{ borderTop: `1px solid ${T.borderL}` }}>
                <div style={{ padding: "14px 16px 10px", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onNativeShare({ title: ev.title, text: ev.desc, url: window.location.href }); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", color: T.mid, padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                    title="Поделиться"
                  >
                    <ShareIcon size={18} />
                  </button>
                </div>
                {renderComments(ev, "event")}
                {canManageEvent(ev) && (
                  <div style={{ padding: "0 16px 16px" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditEvent(ev); }}
                      style={{ width: "100%", padding: "11px 0", borderRadius: 24, border: `1.5px solid ${T.primary}55`, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, background: T.primaryLight, color: T.primary }}
                    >
                      ✏️ Редактировать событие
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {catEvents.length === 0 && (
        <p style={{ fontSize: 13, color: T.mid, textAlign: "center", padding: 20 }}>Пока нет событий в этой категории</p>
      )}

      <button
        onClick={() => { if (!user) { onRequireAuth(); return; } onAddEvent(); }}
        style={{ ...cd, width: "100%", marginTop: 4, padding: 16, border: `2px dashed ${T.primary}40`, color: T.primary, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "none" }}
      >
        ＋ Добавить событие
      </button>
    </div>
  );
}



