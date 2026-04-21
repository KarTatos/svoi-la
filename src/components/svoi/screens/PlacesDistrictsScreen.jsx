export default function PlacesDistrictsScreen({
  T,
  cd,
  bk,
  mt,
  districts,
  places,
  onGoHome,
  onSelectDistrict,
}) {
  return (
    <div>
      <button onClick={onGoHome} style={bk}>← Главная</button>
      <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 16px" }}>📍 Выбери район</h2>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {districts.map((d, i) => {
          const cnt = places.filter((p) => p.district === d.id).length;
          return (
            <button key={d.id} onClick={() => onSelectDistrict(d)}
              style={{ ...cd, display:"flex", alignItems:"center", gap:14, padding:"16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left", opacity:mt?1:0, transition:`all 0.4s ease ${i*0.04}s` }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
              <div style={{ width:48, height:48, borderRadius:T.rs, background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{d.emoji}</div>
              <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{d.name}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{d.desc}</div></div>
              <div style={{ textAlign:"right" }}><span style={{ fontSize:13, fontWeight:700, color:T.primary }}>{cnt}</span><br/><span style={{ fontSize:10, color:T.light }}>мест</span></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

