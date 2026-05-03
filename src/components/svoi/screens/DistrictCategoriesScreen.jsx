export default function DistrictCategoriesScreen({
  T,
  cd,
  bk,
  selectedDistrict,
  districtPlaces,
  placeCategories,
  onBack,
  onSelectCategory,
  onOpenAdd,
}) {
  const PlacesIcon = () => (
    <svg width="22" height="22" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 6C15.6 6 11 10 11 15.5c0 7.5 9 18.5 9 18.5s9-11 9-18.5C29 10 24.4 6 20 6z" fill="#FF6B4A" stroke="#0E0E0E" strokeWidth="1.4"/>
      <circle cx="20" cy="15.5" r="4" fill="#fff" stroke="#0E0E0E" strokeWidth="1.2"/>
    </svg>
  );

  const topBarStyle = {
    display: "grid",
    gridTemplateColumns: "48px 48px 48px",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  };

  const topBtnBase = {
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

  return (
    <div>
      <div style={topBarStyle}>
        <button
          onClick={onBack}
          style={{ ...topBtnBase, background: "#FFFFFF", color: "#8A8680", fontSize: 22 }}
          title="Назад"
        >
          ‹
        </button>

        <div
          style={{ ...topBtnBase, background: "#F2EADF", color: "#4D4337", fontSize: 18, cursor: "default" }}
          aria-hidden="true"
        >
          <PlacesIcon />
        </div>

        <button
          onClick={onOpenAdd}
          style={{ ...topBtnBase, border: `1.5px solid ${T.primary}55`, background: T.primaryLight, color: T.primary, fontSize: 28, lineHeight: 1 }}
          title="Добавить место"
        >
          +
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "4px 0 18px" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{selectedDistrict.name}</h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {placeCategories.map((c) => {
          const cnt = districtPlaces.filter((p) => p.cat === c.id).length;
          if (!cnt) return null;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c)}
              style={{ ...cd, padding: "18px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: "inherit", color: T.text, textAlign: "left" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = T.shH; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.sh; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>{cnt} мест</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
