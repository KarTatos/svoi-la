export default function PlacesCategoryScreen({
  scr,
  selPC,
  selD,
  setScr,
  setSelPC,
  setSelPlace,
  bk,
  T,
  cPlaces,
  openAddForm,
  cd,
  pl,
  openAllOnMap,
  cPlacesDisplay,
  miniMapLoading,
  miniMapError,
  miniMapPlaces,
  miniMapContainerRef,
  miniSelectedPlace,
  miniRouteLoading,
  miniRouteInfo,
  placeSortField,
  setPlaceSortField,
  placeSortDir,
  setPlaceSortDir,
  HeartIcon,
  StarIcon,
  openAddressInMaps,
  formatPlaceAddressLabel,
  favorites,
  toggleFavorite,
  liked,
  handleToggleLike,
  twoLineClampStyle,
  limitCardText,
  ViewIcon,
}) {
  if (!(scr === "places-cat" && selPC && selD)) return null;

  return (
    <div>
      <button onClick={() => { setScr("district"); setSelPC(null); setSelPlace(null); }} style={bk}>← {selD.name}</button>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, margin:"4px 0 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`${selPC.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{selPC.icon}</div>
          <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selPC.title}</h2><p style={{ fontSize:13, color:T.mid, margin:0 }}>{selD.name} · {cPlaces.length} мест</p></div>
        </div>
        <button
          onClick={() => { openAddForm(); }}
          style={{ width:38, height:38, borderRadius:12, border:`1.5px solid ${T.primary}55`, background:T.primaryLight, color:T.primary, fontSize:28, lineHeight:1, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 }}
          title="Добавить"
        >
          +
        </button>
      </div>
      {cPlaces.length > 0 && (
        <div style={{ ...cd, padding:0, overflow:"hidden", marginBottom:12 }}>
          <div style={{ padding:"8px 12px", borderBottom:`1px solid ${T.borderL}`, display:"flex", justifyContent:"flex-end", alignItems:"center" }}>
            <button onClick={() => openAllOnMap(cPlacesDisplay)} style={{ ...pl(false), padding:"6px 10px", fontSize:12 }}>? Открыть карту</button>
          </div>
          <div style={{ position:"relative", height:220, background:"#ECEFF3" }}>
            {miniMapLoading && <div style={{ position:"absolute", inset:0, zIndex:2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:T.mid, background:"rgba(255,255,255,0.75)" }}>Загружаем мини-карту...</div>}
            {!miniMapLoading && miniMapError && <div style={{ position:"absolute", inset:0, zIndex:2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#C0392B", padding:12, textAlign:"center" }}>{miniMapError}</div>}
            {!miniMapLoading && !miniMapError && miniMapPlaces.length === 0 && <div style={{ position:"absolute", inset:0, zIndex:2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:T.mid, padding:12, textAlign:"center" }}>Для этой категории пока нет точек с координатами.</div>}
            <div ref={miniMapContainerRef} style={{ width:"100%", height:"100%" }} />
          </div>
          {miniSelectedPlace && (
            <div style={{ padding:"8px 12px", borderTop:`1px solid ${T.borderL}`, display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, fontSize:12 }}>
              <span style={{ color:T.text, fontWeight:600 }}>{miniSelectedPlace.name}</span>
              <span style={{ color:T.mid }}>
                {miniRouteLoading ? "Считаем маршрут..." : miniRouteInfo ? `На машине: ${miniRouteInfo.duration} · ${miniRouteInfo.distance}` : "Маршрут недоступен"}
              </span>
            </div>
          )}
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10, gap:8 }}>
        <button
          onClick={() => {
            if (placeSortField === "likes") setPlaceSortDir((d) => (d === "asc" ? "desc" : "asc"));
            else { setPlaceSortField("likes"); setPlaceSortDir("desc"); }
          }}
          style={{ border:"none", cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:4, padding:"4px 8px", borderRadius:999, background:"#FFF1F1", color:"#C0392B", fontWeight:700, fontSize:12, lineHeight:1 }}
          title="Сортировать по лайкам"
        >
          <HeartIcon active={true} size={13} /> {placeSortField === "likes" ? (placeSortDir === "asc" ? "^" : "v") : "¦"}
        </button>
        <button
          onClick={() => {
            if (placeSortField === "favorites") setPlaceSortDir((d) => (d === "asc" ? "desc" : "asc"));
            else { setPlaceSortField("favorites"); setPlaceSortDir("desc"); }
          }}
          style={{ border:"none", cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:4, padding:"4px 8px", borderRadius:999, background:"#FFF8E8", color:"#D68910", fontWeight:700, fontSize:12, lineHeight:1 }}
          title="Сортировать по избранному"
        >
          <StarIcon active={true} size={13} /> {placeSortField === "favorites" ? (placeSortDir === "asc" ? "^" : "v") : "¦"}
        </button>
      </div>

      {cPlacesDisplay.map((p, idx) => (
        <button key={p.id} onClick={() => { setSelPlace(p); setScr("place-item"); }} style={{ ...cd, width:"100%", overflow:"hidden", marginBottom:12, cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left", borderColor:T.borderL }}>
          <div style={{ padding:16 }}>
            <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:16, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:"#D7261E", fontWeight:800 }}>{idx + 1}</span>
                  <span>{p.name}</span>
                </div>
                <button onClick={(e)=>{ e.stopPropagation(); openAddressInMaps(p.address || selD.name); }} style={{ background:"none", border:"none", padding:0, marginTop:3, color:T.mid, fontSize:12, cursor:"pointer", fontFamily:"inherit", textDecoration:"underline", textAlign:"left" }}>
                  {formatPlaceAddressLabel(p.address || selD.name)}
                </button>
              </div>
              <div style={{ minWidth:118, display:"flex", justifyContent:"flex-end", gap:6 }}>
                <button onClick={(e)=>{ e.stopPropagation(); toggleFavorite(p.id,"place"); }} style={{ border:"none", background:favorites[`place-${p.id}`] ? "#FFF8E8" : "#F7F7F8", color:favorites[`place-${p.id}`] ? "#D68910" : T.mid, borderRadius:999, padding:"5px 9px", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:12, lineHeight:1, display:"inline-flex", alignItems:"center", justifyContent:"center" }} title="Избранное"><StarIcon active={!!favorites[`place-${p.id}`]} size={15} /></button>
                <button
                  onClick={(e)=>{ e.stopPropagation(); handleToggleLike(p.id,"place"); }}
                  style={{ border:"none", background:liked[`place-${p.id}`] ? "#FFF1F1" : T.bg, color:liked[`place-${p.id}`] ? "#C0392B" : T.mid, borderRadius:999, padding:"5px 9px", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:12, lineHeight:1, display:"inline-flex", alignItems:"center", gap:4 }}
                  title="Нравится"
                >
                  <HeartIcon active={!!liked[`place-${p.id}`]} size={15} /> {p.likes || 0}
                </button>
              </div>
            </div>
            <div style={{ marginTop:12, padding:12, background:T.bg, borderRadius:10, borderLeft:`3px solid ${selPC.color}` }}><div style={{ ...twoLineClampStyle, fontSize:13, color:T.mid }}>{limitCardText(p.tip)}</div></div>
            {Array.isArray(p.photos) && p.photos.length > 0 && (
              <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:6 }}>
                {p.photos.slice(0, 3).map((ph, pi) => (
                  <img
                    key={pi}
                    src={ph}
                    alt=""
                    style={{ width:"100%", height:105, objectFit:"cover", borderRadius:10, border:`1px solid ${T.borderL}`, display:"block" }}
                  />
                ))}
              </div>
            )}
            <div style={{ marginTop:10, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
              <span style={{ fontSize:11, color:T.light }}>от {p.addedBy}</span>
              <span style={{ display:"inline-flex", alignItems:"center", gap:4, color:T.mid, fontWeight:700, fontSize:12, lineHeight:1 }}>
                <ViewIcon size={13} /> {p.views || 0}
              </span>
            </div>
          </div>
        </button>
      ))}
      <button onClick={() => { openAddForm(); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>+ Добавить</button>
    </div>
  );
}
