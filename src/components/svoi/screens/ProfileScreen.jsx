export default function ProfileScreen({
  T,
  cd,
  bk,
  user,
  profileLocation,
  placesCount,
  savedPlacesCount,
  myPlacesCount,
  myReviewsCount,
  onBack,
  onOpenMyPlaces,
  onLogout,
}) {
  const initials = (() => {
    const parts = String(user?.name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  })();

  const rowStyle = {
    width: "100%",
    border: "none",
    background: "transparent",
    padding: "14px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    fontFamily: "inherit",
    color: T.text,
  };

  return (
    <div>
      <button onClick={onBack} style={bk}>← Профиль</button>

      <div style={{ ...cd, padding: 0, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ padding: "18px 16px", position: "relative" }}>
          <div style={{ position: "absolute", right: -26, top: -28, width: 130, height: 130, borderRadius: "50%", background: T.primaryLight, opacity: 0.6 }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 74, height: 74, borderRadius: "50%", background: T.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800, boxShadow: T.sh }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 35, fontWeight: 800, lineHeight: 1.2, marginBottom: 2 }}>{user?.name || "Пользователь"}</div>
              <div style={{ fontSize: 13, color: T.mid, marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email || ""}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#fff4ea", color: T.primary }}>{profileLocation || "Локация"}</span>
                <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#e8f8ef", color: "#2f855a" }}>LA: {placesCount} мест</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", borderTop: `1px solid ${T.borderL}` }}>
          <div style={{ padding: "14px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 34, fontWeight: 800 }}>{myPlacesCount}</div>
            <div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>Мест</div>
          </div>
          <div style={{ padding: "14px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 34, fontWeight: 800 }}>{savedPlacesCount}</div>
            <div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>Сохранено</div>
          </div>
          <div style={{ padding: "14px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 34, fontWeight: 800 }}>{myReviewsCount}</div>
            <div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>Отзывов</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, letterSpacing: "0.06em", fontWeight: 800, color: T.light, margin: "12px 4px 8px" }}>МОЯ АКТИВНОСТЬ</div>
      <div style={{ ...cd, padding: "0 14px", marginBottom: 12 }}>
        <div style={{ ...rowStyle, cursor: "default" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "#fff8e8", display: "flex", alignItems: "center", justifyContent: "center" }}>★</div>
            <span style={{ fontSize: 22, fontWeight: 600 }}>Сохранённые места</span>
          </div>
          <span style={{ color: T.mid, fontWeight: 600 }}>{savedPlacesCount}</span>
        </div>
        <div style={{ borderTop: `1px solid ${T.borderL}` }} />
        <button onClick={onOpenMyPlaces} style={rowStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "#edf4ff", display: "flex", alignItems: "center", justifyContent: "center" }}>📍</div>
            <span style={{ fontSize: 22, fontWeight: 600 }}>Мои места</span>
          </div>
          <span style={{ color: T.mid, fontWeight: 700 }}>{myPlacesCount}  ›</span>
        </button>
        <div style={{ borderTop: `1px solid ${T.borderL}` }} />
        <div style={{ ...rowStyle, cursor: "default" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "#f3efff", display: "flex", alignItems: "center", justifyContent: "center" }}>📝</div>
            <span style={{ fontSize: 22, fontWeight: 600 }}>Мои отзывы</span>
          </div>
          <span style={{ color: T.mid, fontWeight: 600 }}>{myReviewsCount}</span>
        </div>
      </div>

      <div style={{ ...cd, padding: "14px 16px", textAlign: "center" }}>
        <button onClick={onLogout} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: 24, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Выйти</button>
      </div>
    </div>
  );
}

