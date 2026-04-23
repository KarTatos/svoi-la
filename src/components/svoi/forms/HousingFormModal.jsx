import { HomeIcon } from "../config";

export default function HousingFormModal({
  showAddHousing,
  setShowAddHousing,
  setEditingHousing,
  setAddrOptionsHousing,
  setAddrValidHousing,
  cd,
  T,
  editingHousing,
  newHousing,
  setNewHousing,
  iS,
  addrLoadingHousing,
  addrOptionsHousing,
  onSelectHousingAddressSuggestion,
  housingFileRef,
  setNewHousingPhotos,
  newHousingPhotos,
  pl,
  canManageHousing,
  handleDeleteHousing,
  handleAddHousing,
}) {
  if (!showAddHousing) return null;

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center", touchAction:"none" }}
      onClick={()=>{ setShowAddHousing(false); setEditingHousing(null); setAddrOptionsHousing([]); setAddrValidHousing(false); }}
      onTouchMove={(e)=>{ if (e.target === e.currentTarget) e.preventDefault(); }}
      onWheel={(e)=>{ if (e.target === e.currentTarget) e.preventDefault(); }}
    >
      <div style={{ ...cd, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto", overscrollBehavior:"contain", touchAction:"pan-y", WebkitOverflowScrolling:"touch" }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
        <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 16px", display:"inline-flex", alignItems:"center", gap:8 }}><HomeIcon size={18} /> {editingHousing ? "Редактировать жильё" : "Новое жильё"}</h3>

        <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Адрес *</label>
        <input value={newHousing.address} onChange={(e)=>{ setNewHousing((s)=>({ ...s, address:e.target.value })); setAddrValidHousing(false); }} placeholder="1457 N Main St, Los Angeles, CA" style={{ ...iS, marginBottom:6, borderColor:newHousing.address && !addrValidHousing ? "#f5b7b1" : T.border }} />
        {addrLoadingHousing && <div style={{ fontSize:12, color:T.mid, marginBottom:8 }}>Ищем место...</div>}
        {!addrLoadingHousing && addrOptionsHousing.length > 0 && !addrValidHousing && (
          <div style={{ marginBottom:10, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", maxHeight:160, overflowY:"auto", background:T.card }}>
            {addrOptionsHousing.map((opt, i) => (
              <button key={`${opt.value}-${i}`} onClick={() => onSelectHousingAddressSuggestion(opt)} style={{ width:"100%", textAlign:"left", padding:"10px 12px", border:"none", borderBottom:i < addrOptionsHousing.length-1 ? `1px solid ${T.borderL}` : "none", background:T.card, cursor:"pointer", fontFamily:"inherit", fontSize:12, color:T.mid }}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Район</label>
            <input value={newHousing.district} onChange={(e)=>setNewHousing((s)=>({ ...s, district:e.target.value }))} placeholder="Downtown LA" style={{ ...iS, marginBottom:0 }} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Тип</label>
            <select value={newHousing.type} onChange={(e)=>setNewHousing((s)=>({ ...s, type:e.target.value }))} style={{ ...iS, marginBottom:0 }}>
              <option value="room">Комната</option>
              <option value="studio">Студия</option>
              <option value="1bd">1 bd</option>
              <option value="2bd">2 bd</option>
            </select>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10, marginBottom:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Цена от *</label>
            <input type="number" value={newHousing.minPrice} onChange={(e)=>setNewHousing((s)=>({ ...s, minPrice:e.target.value }))} placeholder="1850" style={{ ...iS, marginBottom:0 }} />
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Комментарий</label>
          <textarea value={newHousing.comment || ""} maxLength={1000} onChange={(e)=>setNewHousing((s)=>({ ...s, comment:e.target.value.slice(0, 1000) }))} placeholder="Описание жилья, условия, детали..." style={{ ...iS, minHeight:92, resize:"vertical", marginBottom:6 }} />
          <div style={{ fontSize:11, color:T.light, textAlign:"right" }}>{(newHousing.comment || "").length}/1000</div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Telegram</label>
            <input value={newHousing.telegram} onChange={(e)=>setNewHousing((s)=>({ ...s, telegram:e.target.value }))} placeholder="@username" style={{ ...iS, marginBottom:0 }} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Номер телефона</label>
            <input value={newHousing.messageContact} onChange={(e)=>setNewHousing((s)=>({ ...s, messageContact:e.target.value }))} placeholder="+1 213 555 12 34" style={{ ...iS, marginBottom:0 }} />
          </div>
        </div>

        <input
          ref={housingFileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []).map((file) => ({ file, name:file.name, preview: URL.createObjectURL(file) }));
            setNewHousingPhotos((prev) => [...prev, ...files].slice(0, 10));
          }}
          style={{ display:"none" }}
        />
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 }}>
          {newHousingPhotos.map((p, i) => (
            <div key={i} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>
              <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              <button onClick={()=>setNewHousingPhotos((pr)=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>✕</button>
            </div>
          ))}
          {newHousingPhotos.length < 10 && <button onClick={()=>housingFileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>＋ Фото (до 10)</button>}
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>{ setShowAddHousing(false); setEditingHousing(null); setAddrOptionsHousing([]); setAddrValidHousing(false); }} style={{ ...pl(false), flex:1, padding:14 }}>Отмена</button>
          {editingHousing && canManageHousing(editingHousing) && <button onClick={() => handleDeleteHousing(editingHousing.id)} style={{ ...pl(false), flex:1, padding:14, border:"1.5px solid #fecaca", color:"#E74C3C", background:"#FFF5F5" }}>Удалить</button>}
          <button onClick={handleAddHousing} disabled={!newHousing.address.trim() || !newHousing.minPrice} style={{ ...pl(true), flex:2, padding:14, opacity:(!newHousing.address.trim() || !newHousing.minPrice) ? 0.5 : 1 }}>{editingHousing ? "Сохранить" : "Опубликовать"}</button>
        </div>
      </div>
    </div>
  );
}
