export default function HousingListScreen({
  scr,
  goHome,
  bk,
  T,
  HomeIcon,
  openAddHousingForm,
  cd,
  housingBedsFilter,
  setHousingBedsFilter,
  pl,
  housingSorted,
  favorites,
  setHousingTextCollapsed,
  setSelHousing,
  setScr,
  toggleFavorite,
  StarIcon,
  formatHousingPrice,
  formatHousingType,
}) {
  return (
    <>
      {scr==="housing" && (<div>
        <button onClick={goHome} style={bk}>← Главная</button>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, margin:"4px 0 12px" }}>
          <h2 style={{ fontSize:20, fontWeight:700, margin:0, display:"inline-flex", alignItems:"center", gap:8 }}><HomeIcon size={18} /> Жильё в LA</h2>
          <button
            onClick={() => { openAddHousingForm(); }}
            style={{ width:38, height:38, borderRadius:12, border:`1.5px solid ${T.primary}55`, background:T.primaryLight, color:T.primary, fontSize:28, lineHeight:1, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 }}
            title="Добавить жильё"
          >
            +
          </button>
        </div>
        <div style={{ ...cd, padding:12, marginBottom:10, boxShadow:"none", border:`1px solid ${T.border}` }}>
          <div style={{ fontSize:12, color:T.mid, marginBottom:8 }}>Фильтр по спальням</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {[
              { id:"all", label:"Все" },
              { id:"studio", label:"Studio" },
              { id:"1", label:"1+ bd" },
              { id:"2", label:"2+ bds" },
              { id:"room", label:"Комната" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={()=>setHousingBedsFilter(opt.id)}
                style={{ ...pl(housingBedsFilter===opt.id), padding:"8px 12px", fontSize:12 }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12, paddingBottom:70 }}>
          {housingSorted.map((h) => {
            const isFav = !!favorites[`housing-${h.id}`];
            return (
              <button
                key={h.id}
                onClick={() => { setHousingTextCollapsed(false); setSelHousing({ id: h.id }); setScr("housing-item"); }}
                style={{ ...cd, width:"100%", overflow:"hidden", border:`1px solid ${T.border}`, boxShadow:"0 3px 14px rgba(0,0,0,0.08)", padding:0, cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left", background:T.card }}
              >
                <div style={{ position:"relative", height:188, background:"#E9EDF2" }}>
                  {h.photo ? (
                    <img src={h.photo} alt={h.title || h.address} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  ) : (
                    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:T.light, fontSize:12 }}>Нет фото</div>
                  )}
                  {!!h.updatedLabel && (
                    <div style={{ position:"absolute", top:10, left:10, background:"rgba(0,0,0,0.55)", color:"#fff", borderRadius:999, fontSize:11, fontWeight:700, padding:"6px 10px" }}>
                      {h.updatedLabel}
                    </div>
                  )}
                  <button
                    onClick={(e)=>{ e.stopPropagation(); toggleFavorite(h.id, "housing"); }}
                    style={{ position:"absolute", top:10, right:10, width:42, height:42, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.9)", color:isFav ? "#D68910" : "#1E4D97", fontSize:22, lineHeight:1, cursor:"pointer", fontFamily:"inherit" }}
                    title="Избранное"
                  >
                    <StarIcon active={!!isFav} size={20} />
                  </button>
                </div>
                <div style={{ padding:"10px 12px 12px" }}>
                  <div style={{ fontSize:24, fontWeight:900, lineHeight:1.05, marginBottom:6, letterSpacing:"-0.2px", fontFamily:"inherit" }}>${formatHousingPrice(h.minPrice)}</div>
                  <div style={{ fontSize:15, lineHeight:1.35, color:"#2E2E3A", marginBottom:4 }}>{h.address}</div>
                  <div style={{ fontSize:12, color:T.mid }}>{formatHousingType(h.type)} · {h.district || "LA"}</div>
                  {!!h.comment && <div style={{ fontSize:12, lineHeight:1.45, color:T.mid, marginTop:6, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{h.comment}</div>}
                </div>
              </button>
            );
          })}
          {housingSorted.length===0 && (
            <div style={{ ...cd, padding:16, fontSize:13, color:T.mid, textAlign:"center" }}>Ничего не найдено. Попробуйте другой запрос или фильтры.</div>
          )}
        </div>

        <button onClick={() => { openAddHousingForm(); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>+ Добавить жильё</button>

      </div>)}
    </>
  );
}
