export default function UscisScreen({
  T,
  cd,
  bk,
  pl,
  iS,
  srch,
  setSrch,
  searchResults,
  uscisCategories,
  onOpenCategory,
  onGoHome,
}) {
  return (
    <div>
      <button onClick={onGoHome} style={bk}>← Главная</button>
      <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 14px" }}>📋 Справочник USCIS</h2>
      <div style={{ ...cd, marginBottom:12, padding:"10px 12px", border:`1px solid #FDE2C7`, background:"#FFF8F1" }}>
        <div style={{ fontSize:12, color:T.mid, lineHeight:1.45 }}>
          Важно: информация в этом разделе только для ознакомления. Обязательно проверяйте актуальные требования на официальном сайте USCIS и при необходимости консультируйтесь с иммиграционным адвокатом.
        </div>
      </div>
      <div style={{ position:"relative", marginBottom:14 }}>
        <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:T.light, pointerEvents:"none" }}>🔎</div>
        <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Поиск формы..." style={{ ...iS, paddingLeft:42, borderColor:srch?T.primary:T.border }} />
      </div>
      {srch.trim().length>=2 ? (<div>{searchResults.map((d,i) => { return (<div key={i} style={{ ...cd, padding:"14px 16px", marginBottom:8 }}>
        <div style={{ display:"flex", gap:8, marginBottom:6, alignItems:"center", flexWrap:"wrap" }}>
          {d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, color:T.primary, background:T.primaryLight, textDecoration:"none" }}>{d.form} ↗</a> : <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, color:T.primary, background:T.primaryLight }}>{d.form}</span>}
          <span style={{ fontSize:11, color:T.mid }}>{d.cI} {d.cT}</span>
        </div>
        <div style={{ fontWeight:600, fontSize:14 }}>{d.name}</div><div style={{ fontSize:12, color:T.mid, marginTop:3 }}>{d.desc}</div>
      </div>); })}{searchResults.length===0 && <p style={{ fontSize:13, color:T.mid }}>Не найдено</p>}</div>) : (<><div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {uscisCategories.map(c => (<button key={c.id} onClick={() => onOpenCategory(c)}
          style={{ ...cd, display:"flex", alignItems:"center", gap:14, padding:"16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left" }}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.shH}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.sh}}>
          <div style={{ width:48, height:48, borderRadius:T.rs, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{c.icon}</div>
          <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{c.title}</div><div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{c.subtitle}</div></div>
          <div style={{ color:T.light }}>›</div>
        </button>))}
      </div>
      <div style={{ ...cd, marginTop:14, padding:"18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}><span style={{ fontSize:20 }}>🔍</span><span style={{ fontWeight:700, fontSize:15 }}>Проверить статус кейса</span></div>
        <p style={{ fontSize:13, color:T.mid, margin:"0 0 12px" }}>Введите receipt number</p>
        <div style={{ display:"flex", gap:8 }}>
          <input placeholder="EAC-XX-XXX-XXXXX" style={{ ...iS, flex:1, width:"auto" }} />
          <a href="https://egov.uscis.gov/casestatussearchwidget" target="_blank" rel="noopener noreferrer" style={{ ...pl(true), textDecoration:"none", display:"flex", alignItems:"center" }}>Проверить</a>
        </div>
      </div>
      </>)}
    </div>
  );
}

