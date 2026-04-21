export default function PlacesMapModal({
  T,
  cd,
  pl,
  selPC,
  selD,
  mapLoading,
  mapError,
  mapPlaces,
  mapContainerRef,
  selectedMapPlace,
  routeLoading,
  routeInfo,
  onClose,
  onOpenRoute,
}) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:280, display:"flex", alignItems:"center", justifyContent:"center", padding:12 }} onClick={onClose}>
      <div style={{ ...cd, width:"100%", maxWidth:980, height:"90vh", borderRadius:18, overflow:"hidden", display:"grid", gridTemplateRows:"auto 1fr auto" }} onClick={(e)=>e.stopPropagation()}>
        <div style={{ padding:"12px 14px", borderBottom:`1px solid ${T.borderL}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Карта мест · {selPC?.title || "Категория"}</div>
          <button onClick={onClose} style={{ border:`1px solid ${T.border}`, background:T.card, borderRadius:10, padding:"6px 10px", cursor:"pointer", fontFamily:"inherit", color:T.mid }}>Закрыть</button>
        </div>

        <div style={{ position:"relative", background:"#ECEFF3" }}>
          {mapLoading && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:2, background:"rgba(255,255,255,0.65)", color:T.mid, fontSize:14 }}>
              Загружаем карту и точки...
            </div>
          )}
          {!mapLoading && mapError && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:2, color:"#C0392B", fontSize:14, padding:16, textAlign:"center", background:"rgba(255,255,255,0.8)" }}>
              {mapError}
            </div>
          )}
          {!mapLoading && mapPlaces.length === 0 && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:2, color:T.mid, fontSize:14 }}>
              Не удалось найти координаты для точек в этой категории.
            </div>
          )}
          <div ref={mapContainerRef} style={{ width:"100%", height:"100%" }} />
        </div>

        <div style={{ borderTop:`1px solid ${T.borderL}`, padding:12, background:T.card }}>
          {selectedMapPlace ? (
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8 }}>
              <div style={{ flex:"1 1 280px" }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{selectedMapPlace.name}</div>
                <div style={{ fontSize:12, color:T.mid }}>{selectedMapPlace.address || selD?.name}</div>
                {routeLoading && <div style={{ fontSize:12, color:T.mid, marginTop:4 }}>Считаем маршрут...</div>}
                {!routeLoading && routeInfo && <div style={{ fontSize:12, color:T.mid, marginTop:4 }}>На машине: {routeInfo.duration} · {routeInfo.distance}</div>}
              </div>
              <button onClick={() => onOpenRoute(selectedMapPlace, "google")} style={{ ...pl(false), padding:"10px 12px" }}>Google маршрут</button>
              <button onClick={() => onOpenRoute(selectedMapPlace, "apple")} style={{ ...pl(false), padding:"10px 12px" }}>Apple маршрут</button>
            </div>
          ) : (
            <div style={{ fontSize:12, color:T.mid }}>Нажмите на точку на карте, чтобы построить маршрут.</div>
          )}
        </div>
      </div>
    </div>
  );
}

