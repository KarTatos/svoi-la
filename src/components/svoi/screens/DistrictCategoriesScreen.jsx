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
  return (
    <div>
      <button onClick={onBack} style={bk}>← Районы</button>
      <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 18px" }}>
        <div style={{ width:48, height:48, borderRadius:14, background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{selectedDistrict.emoji}</div>
        <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selectedDistrict.name}</h2><p style={{ fontSize:13, color:T.mid, margin:0 }}>{districtPlaces.length} мест</p></div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {placeCategories.map(c => {
          const cnt = districtPlaces.filter((p) => p.cat === c.id).length;
          if (!cnt) return null;
          return (
            <button key={c.id} onClick={() => onSelectCategory(c)}
              style={{ ...cd, padding:"18px 14px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
              <div style={{ width:40, height:40, borderRadius:10, background:`${c.color}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{c.icon}</div>
              <div><div style={{ fontWeight:700, fontSize:14 }}>{c.title}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{cnt} мест</div></div>
            </button>
          );
        })}
      </div>
      <button onClick={onOpenAdd} style={{ ...cd, width:"100%", marginTop:14, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Добавить место</button>
    </div>
  );
}

