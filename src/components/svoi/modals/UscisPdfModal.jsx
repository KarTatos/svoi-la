export default function UscisPdfModal({
  T,
  cd,
  pl,
  viewer,
  onClose,
}) {
  if (!viewer) return null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:320, display:"flex", alignItems:"center", justifyContent:"center", padding:10 }} onClick={onClose}>
      <div style={{ ...cd, width:"100%", maxWidth:980, height:"92vh", borderRadius:16, overflow:"hidden", display:"grid", gridTemplateRows:"auto 1fr auto" }} onClick={(e)=>e.stopPropagation()}>
        <div style={{ padding:"10px 12px", borderBottom:`1px solid ${T.borderL}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <div style={{ fontWeight:700, fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{viewer.title || "USCIS PDF"}</div>
          <button onClick={onClose} style={{ border:`1px solid ${T.border}`, background:T.card, borderRadius:10, padding:"6px 10px", cursor:"pointer", fontFamily:"inherit", color:T.mid }}>Закрыть</button>
        </div>
        <iframe src={viewer.url} title={viewer.title || "USCIS PDF"} style={{ width:"100%", height:"100%", border:"none", background:"#fff" }} />
        <div style={{ padding:"10px 12px", borderTop:`1px solid ${T.borderL}`, display:"flex", justifyContent:"flex-end", gap:8 }}>
          <a href={viewer.url} target="_blank" rel="noopener noreferrer" download style={{ ...pl(false), textDecoration:"none", fontSize:12, display:"inline-flex", alignItems:"center" }}>Скачать PDF</a>
          <a href={viewer.url} target="_blank" rel="noopener noreferrer" style={{ ...pl(true), textDecoration:"none", fontSize:12, display:"inline-flex", alignItems:"center" }}>Открыть в новой вкладке</a>
        </div>
      </div>
    </div>
  );
}

