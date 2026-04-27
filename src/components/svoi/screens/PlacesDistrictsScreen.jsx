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
}) {
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

  return (
    <div>
      <button onClick={onGoHome} style={bk}>← Главная</button>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "4px 0 16px" }}>📍 Выбери район</h2>
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
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = T.shH; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.sh; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: T.rs,
                background: T.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, flexShrink: 0,
              }}>
                {d.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: T.mid, marginTop: 2 }}>{d.desc}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{cnt}</div>
                <div style={{ fontSize: 10, color: T.light }}>мест</div>
                {d.dist != null && (
                  <div style={{ fontSize: 10, color: T.light, marginTop: 2 }}>{formatMi(d.dist)}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
