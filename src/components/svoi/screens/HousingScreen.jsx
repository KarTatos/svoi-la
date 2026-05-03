import { HomeIcon, StarIcon } from "../config";
import Image from "next/image";

export default function HousingScreen({
  T,
  cd,
  pl,
  user,
  favorites,
  housingBedsFilter,
  setHousingBedsFilter,
  housingSortByFavorites,
  setHousingSortByFavorites,
  housingSorted,
  goHome,
  handleLogin,
  toggleFavorite,
  setHousingTextCollapsed,
  setSelHousing,
  setScr,
  formatHousingPrice,
  formatHousingType,
  onOpenAddHousing,
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, margin: "4px 0 12px" }}>
        <button
          onClick={goHome}
          style={{
            width: 40,
            height: 40,
            borderRadius: 13,
            border: "none",
            background: "#FFFFFF",
            color: "#8E8E93",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            flexShrink: 0,
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
          title="Назад"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: `${T.primary}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <HomeIcon size={18} />
          </div>
        </div>
        <button
          onClick={() => { if (!user) { handleLogin(); return; } onOpenAddHousing(); }}
          style={{ width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${T.primary}55`, background: T.primaryLight, color: T.primary, fontSize: 28, lineHeight: 1, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
          title="Добавить жильё"
        >
          +
        </button>
      </div>
      <div style={{ ...cd, padding: 12, marginBottom: 10, boxShadow: "none", border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 12, color: T.mid, marginBottom: 8 }}>Фильтр по спальням</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1 }}>
            {[
              { id: "all", label: "Все" },
              { id: "studio", label: "Studio" },
              { id: "1", label: "1+ bd" },
              { id: "2", label: "2+ bds" },
              { id: "room", label: "Комната" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setHousingBedsFilter(opt.id)}
                style={{ ...pl(housingBedsFilter === opt.id), padding: "7px 10px", fontSize: 11 }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setHousingSortByFavorites((v) => !v)}
            title="Сортировка по избранным"
            style={{
              width: 34,
              height: 34,
              marginLeft: 2,
              borderRadius: "50%",
              border: "none",
              background: housingSortByFavorites ? "#FFF6E8" : "#FFFFFF",
              color: housingSortByFavorites ? "#D68910" : "#1E4D97",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <StarIcon active={housingSortByFavorites} size={15} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 70 }}>
        {housingSorted.map((h) => {
          const isFav = !!favorites[`housing-${h.id}`];
          return (
            <button
              key={h.id}
              onClick={() => { setHousingTextCollapsed(false); setSelHousing({ id: h.id }); setScr("housing-item"); }}
              style={{ ...cd, width: "100%", overflow: "hidden", border: `1px solid ${T.border}`, boxShadow: "0 3px 14px rgba(0,0,0,0.08)", padding: 0, cursor: "pointer", fontFamily: "inherit", color: T.text, textAlign: "left", background: T.card }}
            >
              <div style={{ position: "relative", height: 188, background: "#E9EDF2" }}>
                {h.photo ? (
                  <Image src={h.photo} alt={h.title || h.address} fill sizes="(max-width: 480px) 100vw, 480px" unoptimized style={{ objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: T.light, fontSize: 12 }}>Нет фото</div>
                )}
                {!!h.updatedLabel && (
                  <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.55)", color: "#fff", borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "6px 10px" }}>
                    {h.updatedLabel}
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(h.id, "housing"); }}
                  style={{ position: "absolute", top: 10, right: 10, width: 42, height: 42, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.9)", color: isFav ? "#D68910" : "#1E4D97", fontSize: 22, lineHeight: 1, cursor: "pointer", fontFamily: "inherit" }}
                  title="Избранное"
                >
                  <StarIcon active={!!isFav} size={20} />
                </button>
              </div>
              <div style={{ padding: "10px 12px 12px" }}>
                <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.05, marginBottom: 6, letterSpacing: "-0.2px", fontFamily: "inherit" }}>${formatHousingPrice(h.minPrice)}</div>
                <div style={{ fontSize: 15, lineHeight: 1.35, color: "#2E2E3A", marginBottom: 4 }}>{h.address}</div>
                <div style={{ fontSize: 12, color: T.mid }}>{formatHousingType(h.type)} · {h.district || "LA"}</div>
                {!!h.comment && <div style={{ fontSize: 12, lineHeight: 1.45, color: T.mid, marginTop: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{h.comment}</div>}
              </div>
            </button>
          );
        })}
        {housingSorted.length === 0 && (
          <div style={{ ...cd, padding: 16, fontSize: 13, color: T.mid, textAlign: "center" }}>Ничего не найдено. Попробуйте другой запрос или фильтры.</div>
        )}
      </div>

      <button onClick={() => { if (!user) { handleLogin(); return; } onOpenAddHousing(); }} style={{ ...cd, width: "100%", marginTop: 4, padding: 16, border: `2px dashed ${T.primary}40`, color: T.primary, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "none" }}>＋ Добавить жильё</button>
    </div>
  );
}
