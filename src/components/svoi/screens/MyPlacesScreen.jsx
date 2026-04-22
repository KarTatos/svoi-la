export default function MyPlacesScreen({
  T,
  cd,
  bk,
  myPlaces,
  onBack,
  onOpenPlace,
}) {
  return (
    <div>
      <button onClick={onBack} style={bk}>← Профиль</button>
      <h3 style={{ fontSize: 26, margin: "2px 0 10px", fontWeight: 800 }}>Мои места</h3>
      <p style={{ margin: "0 0 14px", color: T.mid, fontSize: 13 }}>Здесь только места, которые вы добавили.</p>

      {myPlaces.length === 0 ? (
        <div style={{ ...cd, padding: 16, fontSize: 14, color: T.mid, textAlign: "center" }}>Вы пока не добавили ни одного места.</div>
      ) : (
        myPlaces.map((place) => (
          <button
            key={place.id}
            onClick={() => onOpenPlace(place)}
            style={{ ...cd, width: "100%", marginBottom: 10, padding: 14, textAlign: "left", borderColor: T.borderL, cursor: "pointer", fontFamily: "inherit", color: T.text }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
              <div style={{ fontWeight: 800, fontSize: 22, lineHeight: 1.2 }}>{place.name}</div>
              <span style={{ fontSize: 12, color: T.light }}>{place.districtLabel}</span>
            </div>
            <div style={{ fontSize: 14, color: T.mid, textDecoration: "underline", marginBottom: 6 }}>{place.address || "Адрес не указан"}</div>
            {!!place.tip && <div style={{ fontSize: 13, color: T.mid, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{place.tip}</div>}
          </button>
        ))
      )}
    </div>
  );
}
