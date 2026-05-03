import { useState } from "react";

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
  onOpenSavedPlaces,
  onOpenMyReviews,
  onOpenHelp,
  onLogout,
  onUpdateDisplayName,
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  const initials = (() => {
    const parts = String(user?.name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  })();

  const saveName = async () => {
    const nextName = String(nameInput || "").trim();
    if (!nextName) {
      setNameError("Введите имя");
      return;
    }
    setNameError("");
    setSavingName(true);
    try {
      await onUpdateDisplayName(nextName);
      setEditingName(false);
    } catch (err) {
      setNameError(err?.message || "Не удалось сохранить имя");
    } finally {
      setSavingName(false);
    }
  };

  const row = (icon, label, value, onClick) => (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        border: "none",
        background: "transparent",
        padding: "14px 2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        fontFamily: "inherit",
        color: T.text,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
          {icon}
        </div>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{label}</span>
      </div>
      <span style={{ color: T.mid, fontWeight: 600, fontSize: 14 }}>
        {value !== "" ? value : ""}
        <span style={{ marginLeft: 4 }}>›</span>
      </span>
    </button>
  );

  return (
    <div>
      <button onClick={onBack} style={bk}>← Профиль</button>

      <div style={{ ...cd, padding: 0, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ padding: "16px 14px 12px", position: "relative" }}>
          <div style={{ position: "absolute", right: -28, top: -30, width: 118, height: 118, borderRadius: "50%", background: T.primaryLight, opacity: 0.6 }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 74, height: 74, borderRadius: "50%", background: T.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, boxShadow: T.sh }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              {!editingName ? (
                <>
                  <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.name || "Пользователь"}
                  </div>
                  <button
                    onClick={() => {
                      setEditingName(true);
                      setNameInput(user?.name || "");
                      setNameError("");
                    }}
                    style={{ border: "none", background: "transparent", color: T.primary, fontSize: 12, padding: 0, cursor: "pointer", fontFamily: "inherit", marginBottom: 6 }}
                  >
                    Изменить имя
                  </button>
                </>
              ) : (
                <div style={{ marginBottom: 6 }}>
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value.slice(0, 40))}
                    placeholder="Имя в приложении"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "inherit", marginBottom: 6 }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={saveName} disabled={savingName || !nameInput.trim()} style={{ border: "none", background: T.primary, color: "#fff", borderRadius: 999, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", opacity: savingName || !nameInput.trim() ? 0.6 : 1 }}>
                      Сохранить
                    </button>
                    <button onClick={() => { setEditingName(false); setNameError(""); }} style={{ border: `1px solid ${T.border}`, background: "#fff", color: T.mid, borderRadius: 999, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      Отмена
                    </button>
                  </div>
                  {nameError && <div style={{ marginTop: 6, fontSize: 12, color: "#dc2626" }}>{nameError}</div>}
                </div>
              )}

              <div style={{ fontSize: 12, color: T.mid, marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.email || ""}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, padding: "4px 9px", borderRadius: 999, background: "#fff4ea", color: T.primary }}>📍 {profileLocation || "Локация"}</span>
                <span style={{ fontSize: 12, padding: "4px 9px", borderRadius: 999, background: "#e8f8ef", color: "#2f855a" }}>В LA: {placesCount} мест</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", borderTop: `1px solid ${T.borderL}` }}>
          <div style={{ padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 37, fontWeight: 800, lineHeight: 1.1 }}>{myPlacesCount}</div>
            <div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>Мест</div>
          </div>
          <div style={{ padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 37, fontWeight: 800, lineHeight: 1.1 }}>{savedPlacesCount}</div>
            <div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>Сохранено</div>
          </div>
          <div style={{ padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 37, fontWeight: 800, lineHeight: 1.1 }}>{myReviewsCount}</div>
            <div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>Отзывы</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, letterSpacing: "0.06em", fontWeight: 800, color: T.light, margin: "10px 4px 8px" }}>МОЯ АКТИВНОСТЬ</div>
      <div style={{ ...cd, padding: "0 12px", marginBottom: 12 }}>
        {row("⭐", "Сохранённые места", savedPlacesCount, onOpenSavedPlaces)}
        <div style={{ borderTop: `1px solid ${T.borderL}` }} />
        {row("📝", "Мои отзывы", myReviewsCount, onOpenMyReviews)}
        <div style={{ borderTop: `1px solid ${T.borderL}` }} />
        {row("📍", "Мои места", myPlacesCount, onOpenMyPlaces)}
      </div>

      <div style={{ fontSize: 12, letterSpacing: "0.06em", fontWeight: 800, color: T.light, margin: "10px 4px 8px" }}>ПОДДЕРЖКА</div>
      <div style={{ ...cd, padding: "0 12px", marginBottom: 14 }}>
        {row("💬", "Помощь", "", onOpenHelp)}
      </div>

      <div style={{ textAlign: "center", fontSize: 12, color: T.light, marginBottom: 10 }}>LA guide · v1.4.2</div>
      <div style={{ textAlign: "center" }}>
        <button onClick={onLogout} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: 18, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Выйти</button>
      </div>
    </div>
  );
}
