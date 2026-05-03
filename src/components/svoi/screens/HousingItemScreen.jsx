import { HeartIcon, ShareIcon, StarIcon } from "../config";
import Image from "next/image";

export default function HousingItemScreen({
  T,
  pl,
  favorites,
  liked,
  activeHousing,
  housingTextCollapsed,
  setHousingTextCollapsed,
  setScr,
  openPhotoViewer,
  openAddressInMaps,
  openTelegramContact,
  openMessageContact,
  canManageActiveHousing,
  startEditHousing,
  toggleFavorite,
  handleToggleLike,
  handleNativeShare,
  formatHousingPrice,
  formatHousingType,
}) {
  if (!activeHousing) return null;
  const galleryPhotos = Array.isArray(activeHousing.photos) && activeHousing.photos.length
    ? activeHousing.photos
    : (activeHousing.photo ? [activeHousing.photo] : []);

  return (
    <div>
      <div style={{ position: "relative", height: "calc(var(--app-vh, 100vh) - 122px)", overflowY: "auto", borderRadius: 18, border: `1px solid ${T.border}`, background: "transparent", boxShadow: T.sh }}>
        <button onClick={() => setScr("housing")} style={{ position: "sticky", top: 10, left: 10, zIndex: 4, margin: 10, width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.92)", color: "#222", fontSize: 28, lineHeight: 1, cursor: "pointer", fontFamily: "inherit" }} title="Закрыть">×</button>
        {galleryPhotos.length ? (
          <div style={{ marginTop: -64 }}>
            {galleryPhotos.map((src, i) => (
              <button
                key={`${src}-${i}`}
                onClick={() => openPhotoViewer(galleryPhotos, i)}
                style={{ display: "block", width: "100%", padding: 0, margin: 0, border: "none", background: "transparent", cursor: "zoom-in" }}
              >
                <Image src={src} alt="" width={1200} height={560} unoptimized style={{ width: "100%", minHeight: 240, maxHeight: 560, objectFit: "cover", display: "block", borderBottom: `1px solid rgba(255,255,255,0.1)` }} />
              </button>
            ))}
          </div>
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14 }}>Нет фото</div>
        )}

        <div style={{ position: "sticky", bottom: 0, zIndex: 3, background: T.card, borderTop: `1px solid ${T.border}`, borderRadius: "18px 18px 0 0", padding: "14px 14px calc(14px + env(safe-area-inset-bottom))" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.2px" }}>${formatHousingPrice(activeHousing.minPrice)}</div>
            {!!activeHousing.comment && (
              <button
                onClick={() => setHousingTextCollapsed((v) => !v)}
                style={{ ...pl(false), padding: "6px 10px", fontSize: 11, whiteSpace: "nowrap" }}
              >
                {housingTextCollapsed ? "Развернуть текст" : "Свернуть текст"}
              </button>
            )}
          </div>
          <button
            onClick={() => openAddressInMaps(activeHousing.address)}
            style={{ background: "none", border: "none", padding: 0, marginBottom: 6, fontWeight: 700, fontSize: 16, color: T.text, textAlign: "left", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}
          >
            {activeHousing.address}
          </button>
          {!!activeHousing.comment && !housingTextCollapsed && <div style={{ fontSize: 13, lineHeight: 1.55, color: T.mid, marginBottom: 8 }}>{activeHousing.comment}</div>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {Number(activeHousing.beds || 0) > 0 && <span style={{ fontSize: 12, padding: "5px 9px", borderRadius: 999, background: T.bg, color: T.mid }}>{activeHousing.beds} beds</span>}
            {Number(activeHousing.baths || 0) > 0 && <span style={{ fontSize: 12, padding: "5px 9px", borderRadius: 999, background: T.bg, color: T.mid }}>{activeHousing.baths} baths</span>}
            <span style={{ fontSize: 12, padding: "5px 9px", borderRadius: 999, background: T.bg, color: T.mid }}>{activeHousing.district || "LA"}</span>
            <span style={{ fontSize: 12, padding: "5px 9px", borderRadius: 999, background: T.bg, color: T.mid }}>{formatHousingType(activeHousing.type)}</span>
          </div>
          {(!!activeHousing.telegram || !!activeHousing.messageContact) && (
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {!!activeHousing.telegram && <button onClick={() => openTelegramContact(activeHousing.telegram)} style={{ ...pl(false), flex: 1, padding: "8px 10px", fontSize: 12 }}>Telegram</button>}
              {!!activeHousing.messageContact && <button onClick={() => openMessageContact(activeHousing.messageContact)} style={{ ...pl(false), flex: 1, padding: "8px 10px", fontSize: 12 }}>Сообщение</button>}
            </div>
          )}
          {canManageActiveHousing && (
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button onClick={() => startEditHousing(activeHousing)} style={{ ...pl(false), width: "100%", padding: "8px 10px", fontSize: 12 }}>Редактировать</button>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => toggleFavorite(activeHousing.id, "housing")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, fontSize: 18, color: favorites[`housing-${activeHousing.id}`] ? "#D68910" : T.mid, padding: 0 }} title="Избранное"><StarIcon active={!!favorites[`housing-${activeHousing.id}`]} size={18} /></button>
            <button onClick={() => handleToggleLike(activeHousing.id, "housing")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, fontSize: 18, color: liked[`housing-${activeHousing.id}`] ? "#E74C3C" : T.mid, padding: 0 }} title="Нравится"><HeartIcon active={!!liked[`housing-${activeHousing.id}`]} /> <span style={{ fontSize: 14 }}>{activeHousing.likes || 0}</span></button>
            <button onClick={() => handleNativeShare({ title: activeHousing.title, text: `${activeHousing.address} · $${formatHousingPrice(activeHousing.minPrice)}`, url: window.location.href })} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", color: T.mid, padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }} title="Поделиться"><ShareIcon size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
