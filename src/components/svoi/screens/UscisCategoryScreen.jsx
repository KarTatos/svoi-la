export default function UscisCategoryScreen({
  T,
  cd,
  bk,
  pl,
  selectedCategory,
  expandedIndex,
  onExpand,
  onBack,
  onStartTest,
  getPdfUrl,
}) {
  return (
    <div>
      <button onClick={onBack} style={bk}>← Справочник</button>
      <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 20px" }}>
        <div style={{ width:48, height:48, borderRadius:14, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>{selectedCategory.icon}</div>
        <div><h2 style={{ fontSize:22, fontWeight:700, margin:0 }}>{selectedCategory.title}</h2></div>
      </div>
      {selectedCategory.docs.map((d, i) => {
        const isExpanded = expandedIndex === i;
        const pdfUrl = getPdfUrl(d);
        return (
          <div key={`${selectedCategory.id}-${d.form || d.name}`} style={{ ...cd, marginBottom:10, overflow:"hidden", borderColor:isExpanded?T.primary+"40":T.borderL }}>
            <div onClick={() => onExpand(isExpanded ? null : i)} style={{ padding:"16px", cursor:"pointer" }} onMouseEnter={e=>{e.currentTarget.style.background=T.bg}} onMouseLeave={e=>{e.currentTarget.style.background=T.card}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  {d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:6, color:T.primary, background:T.primaryLight, textDecoration:"none" }}>{d.form} ↗</a> : <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:6, color:T.primary, background:T.primaryLight }}>{d.form}</span>}
                </div>
                <span style={{ fontSize:11, color:isExpanded?T.primary:T.light, transform:isExpanded?"rotate(180deg)":"", transition:"0.3s" }}>▼</span>
              </div>
              <div style={{ fontWeight:600, fontSize:14, marginTop:10 }}>{d.name}</div>
              <div style={{ fontSize:12, color:T.mid, marginTop:4 }}>{d.desc}</div>
            </div>
            {isExpanded && (
              <div style={{ padding:"0 16px 16px", borderTop:`1px solid ${T.borderL}` }}>
                <div style={{ padding:14, background:T.bg, borderRadius:10, marginTop:12, fontSize:13, lineHeight:1.65, color:T.mid }}>{d.detail}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:12 }}>
                  {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", ...pl(true), textDecoration:"none", fontSize:12 }}>uscis.gov ↗</a>}
                  {pdfUrl && <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download style={{ ...pl(false), textDecoration:"none", fontSize:12, display:"inline-flex", alignItems:"center" }}>Открыть PDF</a>}
                </div>
                {d.isTest && <button onClick={onStartTest} style={{ ...pl(true), marginTop:12, width:"100%" }}>🇺🇸 Start Civics Test</button>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
