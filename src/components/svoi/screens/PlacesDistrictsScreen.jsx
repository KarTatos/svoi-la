function toRad(v) {
  return (v * Math.PI) / 180;
}

function haversineMi(aLat, aLng, bLat, bLng) {
  const R = 3958.8; // miles
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1 + s2));
}

function formatMi(mi) {
  if (mi < 1) return `${Math.round(mi * 10) / 10} mi`;
  if (mi < 10) return `${Math.round(mi * 10) / 10} mi`;
  return `${Math.round(mi)} mi`;
}

export default function PlacesDistrictsScreen({
  T,
  cd,
  bk,
  mt,
  districts,
  places,
  userCoords,
  onGoHome,
  onSelectDistrict,
  onOpenAdd,
}) {
  const PlacesIcon = () => (
    <svg width="22" height="22" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 6C15.6 6 11 10 11 15.5c0 7.5 9 18.5 9 18.5s9-11 9-18.5C29 10 24.4 6 20 6z" fill="#FF6B4A" stroke="#0E0E0E" strokeWidth="1.4"/>
      <circle cx="20" cy="15.5" r="4" fill="#fff" stroke="#0E0E0E" strokeWidth="1.2"/>
    </svg>
  );
  const hasCoords = userCoords && Number.isFinite(userCoords.lat) && Number.isFinite(userCoords.lng);

  const districtsWithDist = districts.map((d) => {
    const dist =
      hasCoords && Number.isFinite(d.lat) && Number.isFinite(d.lng)
        ? haversineMi(userCoords.lat, userCoords.lng, d.lat, d.lng)
        : null;
    return { ...d, dist };
  });

  const sorted = hasCoords
    ? [...districtsWithDist].sort((a, b) => {
        if (a.dist == null && b.dist == null) return 0;
        if (a.dist == null) return 1;
        if (b.dist == null) return -1;
        return a.dist - b.dist;
      })
    : districtsWithDist;

  const placesTopBarStyle = {
    display: "grid",
    gridTemplateColumns: "48px 48px 48px",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  };

  const placesTopBtnBase = {
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
      <div style={placesTopBarStyle}>
        <button
          onClick={onGoHome}
          style={{ ...placesTopBtnBase, background: "#FFFFFF", color: "#8A8680", fontSize: 22 }}
          title="Назад"
        >
          ‹
        </button>

        <div
          style={{ ...placesTopBtnBase, background: "#F2EADF", color: "#4D4337", fontSize: 18, cursor: "default" }}
          aria-hidden="true"
        >
          <PlacesIcon />
        </div>

        <button
          onClick={onOpenAdd}
          style={{ ...placesTopBtnBase, border: `1.5px solid ${T.primary}55`, background: T.primaryLight, color: T.primary, fontSize: 28, lineHeight: 1 }}
          title="Добавить место"
        >
          +
        </button>
      </div>


      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((d, i) => {
          const cnt = places.filter((p) => p.district === d.id).length;
          return (
            <button
              key={d.id}
              onClick={() => onSelectDistrict(d)}
              style={{
                ...cd,
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px",
                cursor: "pointer",
                fontFamily: "inherit",
                color: T.text,
                textAlign: "left",
                opacity: mt ? 1 : 0,
                transition: `all 0.4s ease ${i * 0.04}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = T.shH;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = T.sh;
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: T.rs,
                  background: T.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                {d.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>{d.desc}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{cnt}</div>
                <div style={{ fontSize: 10, color: T.light }}>мест</div>
                {d.dist != null && <div style={{ fontSize: 10, color: T.light, marginTop: 2 }}>{formatMi(d.dist)}</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

