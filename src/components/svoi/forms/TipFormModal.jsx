export default function TipFormModal({
  showAddTip,
  selTC,
  setShowAddTip,
  setNewTipPhotos,
  setEditingTip,
  cd,
  T,
  editingTip,
  newTip,
  setNewTip,
  iS,
  CARD_TEXT_MAX,
  tipFileRef,
  handleTipPhotos,
  newTipPhotos,
  pl,
  canManageTip,
  handleDeleteTip,
  handleAddTip,
}) {
  if (!showAddTip || !selTC) return null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>{setShowAddTip(false); setNewTipPhotos([]); setEditingTip(null);}}>
      <div style={{ ...cd, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
        <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>{selTC.icon} {editingTip ? "Редактировать совет" : "Новый совет"} · {selTC.title}</h3>
        <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Заголовок *</label>
        <input value={newTip.title} onChange={e=>setNewTip({...newTip,title:e.target.value})} placeholder="О чём совет?" style={{ ...iS, marginBottom:14 }} />
        <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Текст *</label>
        <textarea value={newTip.text} maxLength={CARD_TEXT_MAX} onChange={e=>setNewTip({...newTip,text:e.target.value.slice(0, CARD_TEXT_MAX)})} placeholder="Поделитесь опытом..." style={{ ...iS, minHeight:120, resize:"vertical", marginBottom:6 }} />
        <div style={{ fontSize:11, color:T.light, marginBottom:14, textAlign:"right" }}>{newTip.text.length}/{CARD_TEXT_MAX}</div>
        <input ref={tipFileRef} type="file" accept="image/*" multiple onChange={handleTipPhotos} style={{ display:"none" }} />
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
          {newTipPhotos.map((p,i) => (
            <div key={i} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>
              <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              <button onClick={()=>setNewTipPhotos(pr=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>✕</button>
            </div>
          ))}
          {newTipPhotos.length < 3 && <button onClick={()=>tipFileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>＋ Фото (до 3)</button>}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>{setShowAddTip(false); setNewTipPhotos([]); setEditingTip(null);}} style={{ ...pl(false), flex:1, padding:14 }}>Отмена</button>
          {editingTip && canManageTip(editingTip) && <button onClick={()=>handleDeleteTip(editingTip.id)} style={{ ...pl(false), flex:1, padding:14, border:"1.5px solid #fecaca", color:"#E74C3C", background:"#FFF5F5" }}>Удалить</button>}
          <button onClick={handleAddTip} disabled={!newTip.title||!newTip.text} style={{ ...pl(true), flex:2, padding:14, opacity:(!newTip.title||!newTip.text)?0.5:1 }}>{editingTip ? "Сохранить" : "Опубликовать"}</button>
        </div>
      </div>
    </div>
  );
}
