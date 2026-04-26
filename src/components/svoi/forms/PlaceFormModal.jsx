export default function PlaceFormModal({
  showAdd,
  selD,
  cd,
  T,
  user,
  handleLogin,
  pl,
  editingPlace,
  np,
  setNp,
  setAddrValidPlace,
  setPlaceCoords,
  setAddrOptionsPlace,
  nameLoadingPlace,
  nameOptionsPlace,
  setNameOptionsPlace,
  onSelectPlaceNameSuggestion,
  onSelectPlaceAddressSuggestion,
  PLACE_CATS,
  DISTRICTS,
  iS,
  addrLoadingPlace,
  addrOptionsPlace,
  addrValidPlace,
  CARD_TEXT_MAX,
  fileRef,
  handlePhotos,
  nPhotos,
  setNPhotos,
  setShowAdd,
  handleDeletePlace,
  handleAddPlace,
  uploading,
}) {
  if (!showAdd || !selD) return null;

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:10000, display:"flex", alignItems:"flex-end", justifyContent:"center", touchAction:"none", pointerEvents:"auto", isolation:"isolate" }}
      onClick={()=>setShowAdd(false)}
      onTouchMove={(e)=>{ if (e.target === e.currentTarget) e.preventDefault(); }}
      onWheel={(e)=>{ if (e.target === e.currentTarget) e.preventDefault(); }}
    >
      <div style={{ ...cd, position:"relative", zIndex:1, width:"100%", maxWidth:480, borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto", overscrollBehavior:"contain", touchAction:"pan-y", WebkitOverflowScrolling:"touch" }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
        {!user ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔐</div>
            <button onClick={handleLogin} style={{ ...pl(true), padding:"14px 28px" }}>Войти через Google</button>
            <div style={{ marginTop:10, fontSize:12, color:T.mid, background:T.bg, border:`1px solid ${T.borderL}`, borderRadius:10, padding:"10px 12px", lineHeight:1.45 }}>
              Вход через Google безопасен: мы не видим ваш пароль Google. Сохраняются только имя, email и аватар для работы аккаунта.
            </div>
          </div>
        ) : (<>
          <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 20px" }}>
            {editingPlace ? "✏️ Редактировать место" : "Новое место"} · {(DISTRICTS.find((d) => d.id === (np.district || selD?.id))?.name || selD.name)}
          </h3>
          <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Название *</label>
          <input
            autoComplete="off"
            value={np.name}
            onChange={e=>{
              const v = e.target.value;
              setNp({...np,name:v});
              setAddrValidPlace(false);
              setPlaceCoords({ lat: null, lng: null });
              setAddrOptionsPlace([]);
            }}
            placeholder="Название"
            style={{ ...iS, marginBottom:6 }}
          />
          {nameLoadingPlace && <div style={{ fontSize:12, color:T.mid, marginBottom:8 }}>Ищем места...</div>}
          {!nameLoadingPlace && nameOptionsPlace.length > 0 && (
            <div style={{ marginBottom:10, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", maxHeight:180, overflowY:"auto", background:T.card }}>
              {nameOptionsPlace.map((opt, i) => (
                <button
                  key={`${opt.value}-${i}`}
                  onClick={() => onSelectPlaceNameSuggestion(opt)}
                  style={{ width:"100%", textAlign:"left", padding:"10px 12px", border:"none", borderBottom:i < nameOptionsPlace.length-1 ? `1px solid ${T.borderL}` : "none", background:T.card, cursor:"pointer", fontFamily:"inherit", fontSize:12, color:T.mid }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Категория *</label>
          <select value={np.cat} onChange={e=>setNp({...np,cat:e.target.value})} style={{ ...iS, marginBottom:14, appearance:"none", color:np.cat?T.text:T.light }}>
            <option value="">Выберите</option>{PLACE_CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
          </select>
          <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Район *</label>
          <select
            value={np.district || selD?.id || ""}
            onChange={e=>setNp((prev)=>({ ...prev, district:e.target.value }))}
            style={{ ...iS, marginBottom:14, appearance:"none", color:(np.district || selD?.id)?T.text:T.light }}
          >
            <option value="">Выберите район</option>
            {DISTRICTS.map((d)=><option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Адрес *</label>
          <input value={np.address} onChange={e=>{setNp({...np,address:e.target.value}); setAddrValidPlace(false); setPlaceCoords({ lat: null, lng: null });}} placeholder="Адрес" style={{ ...iS, marginBottom:6, borderColor:np.address && !addrValidPlace ? "#f5b7b1" : T.border }} />
          {addrLoadingPlace && <div style={{ fontSize:12, color:T.mid, marginBottom:8 }}>Ищем адрес...</div>}
          {!addrLoadingPlace && addrOptionsPlace.length > 0 && !addrValidPlace && (
            <div style={{ marginBottom:10, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", maxHeight:160, overflowY:"auto", background:T.card }}>
              {addrOptionsPlace.map((opt, i) => (
                <button key={`${opt.value}-${i}`} onClick={() => onSelectPlaceAddressSuggestion(opt)} style={{ width:"100%", textAlign:"left", padding:"10px 12px", border:"none", borderBottom:i < addrOptionsPlace.length-1 ? `1px solid ${T.borderL}` : "none", background:T.card, cursor:"pointer", fontFamily:"inherit", fontSize:12, color:T.mid }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          {np.address && !addrValidPlace && <div style={{ fontSize:12, color:"#E74C3C", marginBottom:10 }}>Выберите адрес из подсказок.</div>}
          <label style={{ fontSize:12, fontWeight:600, color:T.mid, marginBottom:6, display:"block" }}>Комментарий *</label>
          <textarea value={np.tip} maxLength={CARD_TEXT_MAX} onChange={e=>setNp({...np,tip:e.target.value.slice(0, CARD_TEXT_MAX)})} placeholder="Ваш отзыв, совет, рекомендация..." style={{ ...iS, minHeight:80, resize:"vertical", marginBottom:6 }} />
          <div style={{ fontSize:11, color:T.light, marginBottom:12, textAlign:"right" }}>{np.tip.length}/{CARD_TEXT_MAX}</div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display:"none" }} />
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
            {nPhotos.map((p,i) => (<div key={`${p.preview || p.name || 'photo'}-${p.file?.lastModified || ''}-${p.file?.size || ''}`} style={{ position:"relative", width:60, height:60, borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, flexShrink:0 }}>{p.preview ? <img src={p.preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /> : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", background:T.bg, fontSize:10, color:T.mid, padding:4 }}>📷</div>}<button onClick={()=>setNPhotos(pr=>pr.filter((_,j)=>j!==i))} style={{ position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.5)", border:"none", color:"#fff", cursor:"pointer", borderRadius:"50%", width:18, height:18, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>✕</button></div>))}
            {nPhotos.length<5 && <button onClick={()=>fileRef.current?.click()} style={{ padding:"6px 14px", background:T.bg, border:`1.5px dashed ${T.border}`, borderRadius:8, color:T.primary, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>＋ Фото</button>}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>{setShowAdd(false);setNPhotos([])}} style={{ ...pl(false), flex:1, padding:14 }}>Отмена</button>
            {editingPlace && <button onClick={()=>handleDeletePlace(editingPlace.id)} style={{ ...pl(false), flex:1, padding:14, border:"1.5px solid #fecaca", color:"#E74C3C", background:"#FFF5F5" }}>Удалить</button>}
            <button onClick={handleAddPlace} disabled={!np.name||!np.cat||!np.tip||uploading} style={{ ...pl(true), flex:2, padding:14, opacity:(!np.name||!np.cat||!np.tip||uploading)?0.5:1 }}>{uploading ? '⏳ Загрузка...' : editingPlace ? 'Сохранить' : 'Опубликовать'}</button>
          </div>
        </>)}
      </div>
    </div>
  );
}
