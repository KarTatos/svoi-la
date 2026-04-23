import TipFormModal from "../forms/TipFormModal";
import CommentsBlock from "../components/CommentsBlock";

export default function TipsScreen({
  T,
  TIPS_CATS,
  tips,
  selTC,
  setSelTC,
  onGoHome,
  bk,
  cd,
  user,
  handleLogin,
  openAddTipForm,
  expTip,
  setExpTip,
  trackCardView,
  liked,
  favorites,
  toggleFavorite,
  StarIcon,
  ViewIcon,
  HeartIcon,
  ShareIcon,
  pl,
  twoLineClampStyle,
  limitCardText,
  openPhotoViewer,
  handleToggleLike,
  handleNativeShare,
  comments,
  handleAddComment,
  canManageTip,
  startEditTip,
  handleDeleteTip,
  catTips,
  showAddTip,
  setShowAddTip,
  setNewTipPhotos,
  setEditingTip,
  editingTip,
  newTip,
  setNewTip,
  CARD_TEXT_MAX,
  tipFileRef,
  handleTipPhotos,
  newTipPhotos,
  handleAddTip,
}) {
  const {
    showComments,
    setShowComments,
    newComment,
    setNewComment,
    editingComment,
    setEditingComment,
    editCommentText,
    setEditCommentText,
    saveEditComment,
    deleteCommentFn,
    iS,
  } = comments;

  return (
    <div>
      {!selTC ? (
        <div>
          <button onClick={onGoHome} style={bk}>← Главная</button>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"4px 0 4px" }}>💡 Советы по жизни в LA</h2>
          <p style={{ fontSize:13, color:T.mid, margin:"0 0 16px" }}>Опыт от своих: документы, жильё, банки, врачи</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {TIPS_CATS.map((c) => {
              const cnt = tips.filter((t) => t.cat===c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => { setSelTC(c); }}
                  style={{ ...cd, display:"flex", alignItems:"center", gap:14, padding:"16px", cursor:"pointer", fontFamily:"inherit", color:T.text, textAlign:"left" }}
                  onMouseEnter={(e)=>{e.currentTarget.style.boxShadow=T.shH;}}
                  onMouseLeave={(e)=>{e.currentTarget.style.boxShadow=T.sh;}}
                >
                  <div style={{ width:48, height:48, borderRadius:T.rs, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{c.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>{c.title}</div>
                    <div style={{ fontSize:12, color:T.mid, marginTop:2 }}>{c.desc}</div>
                  </div>
                  {cnt > 0 && <span style={{ fontSize:13, fontWeight:700, color:T.primary }}>{cnt}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => setSelTC(null)} style={bk}>← Все советы</button>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, margin:"4px 0 18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{selTC.icon}</div>
              <div><h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{selTC.title}</h2><p style={{ fontSize:13, color:T.mid, margin:0 }}>{selTC.desc}</p></div>
            </div>
            <button
              onClick={() => { openAddTipForm(); }}
              style={{ width:38, height:38, borderRadius:12, border:`1.5px solid ${T.primary}55`, background:T.primaryLight, color:T.primary, fontSize:28, lineHeight:1, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 }}
              title="Добавить"
            >
              +
            </button>
          </div>
          {catTips.map((tip) => {
            const isE = expTip===tip.id;
            const isL = liked[`tip-${tip.id}`];
            const isF = favorites[`tip-${tip.id}`];
            return (
              <div key={tip.id} style={{ ...cd, marginBottom:12, overflow:"hidden", borderColor:isE?T.primary+"40":T.borderL }}>
                <div onClick={() => { const nextOpen = !isE; setExpTip(nextOpen ? tip.id : null); if (nextOpen) trackCardView("tip", tip); }} style={{ padding:16, cursor:"pointer", background:isE ? T.bg : T.card }}>
                  <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>{tip.title}</div>
                  <div style={{ ...(!isE ? twoLineClampStyle : {}), fontSize:13, lineHeight:1.6, color:T.mid, whiteSpace:isE ? "pre-wrap" : "normal", overflowWrap:"anywhere", wordBreak:"break-word" }}>{limitCardText(tip.text)}</div>
                  {isE && tip.photos?.length > 0 && (
                    <div style={{ display:"flex", gap:8, overflowX:"auto", marginTop:10, paddingBottom:4, scrollSnapType:"x mandatory" }}>
                      {tip.photos.map((ph, pi) => (
                        <img key={pi} src={ph} alt="" style={{ width:86, height:86, objectFit:"cover", borderRadius:10, border:`1px solid ${T.border}`, cursor:"zoom-in", flexShrink:0, scrollSnapAlign:"start" }} onClick={(e)=>{e.stopPropagation(); openPhotoViewer(tip.photos, pi);}} />
                      ))}
                    </div>
                  )}
                  {isE && tip.photos?.length > 1 && <div style={{ fontSize:11, color:T.light, marginTop:2 }}>Листайте фото →</div>}
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
                    <span style={{ fontSize:11, color:T.light }}>от {tip.author}</span>
                    <div style={{ display:"flex", gap:10, fontSize:12, color:T.mid, alignItems:"center" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(tip.id,"tip"); }}
                        style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", color:isF ? "#D68910" : T.light, padding:0, fontSize:14, lineHeight:1 }}
                        title="Избранное"
                      >
                        <StarIcon active={!!isF} size={14} />
                      </button>
                      <span><ViewIcon size={13} /> {tip.views || 0}</span>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:4, color:isL?"#E74C3C":T.mid }}><HeartIcon active={!!isL} size={14} /> {tip.likes||0}</span>
                      <span>💬 {tip.comments.length}</span>
                      <span style={{ color:isE?T.primary:T.light, transform:isE?"rotate(180deg)":"", transition:"0.3s" }}>▼</span>
                    </div>
                  </div>
                </div>
                {isE && (
                  <div style={{ borderTop:`1px solid ${T.borderL}` }}>
                    <div style={{ padding:"14px 16px 10px", display:"flex", gap:14, alignItems:"center" }}>
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(tip.id,"tip"); }} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:isF?"#D68910":T.mid, padding:0 }} title="Избранное"><StarIcon active={!!isF} size={18} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleToggleLike(tip.id,"tip"); }} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:isL?"#E74C3C":T.mid, padding:0 }} title="Нравится"><HeartIcon active={!!isL} /> <span style={{ fontSize:14 }}>{tip.likes||0}</span></button>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:14, color:T.mid }}>👁 {tip.views || 0}</span>
                      <button onClick={(e)=>{e.stopPropagation(); setShowComments(`tip-${tip.id}`);}} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5, fontSize:18, color:T.mid, padding:0 }} title="Комментарии">◌ <span style={{ fontSize:14 }}>{(tip.comments||[]).length}</span></button>
                      <button onClick={(e)=>{e.stopPropagation(); handleNativeShare({ title:tip.title, text:tip.text, url:window.location.href });}} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", color:T.mid, padding:0, display:"inline-flex", alignItems:"center", justifyContent:"center" }} title="Поделиться"><ShareIcon size={18} /></button>
                    </div>
                    <CommentsBlock
                      item={tip}
                      type="tip"
                      addFn={handleAddComment}
                      showComments={showComments}
                      setShowComments={setShowComments}
                      newComment={newComment}
                      setNewComment={setNewComment}
                      editingComment={editingComment}
                      setEditingComment={setEditingComment}
                      editCommentText={editCommentText}
                      setEditCommentText={setEditCommentText}
                      saveEditComment={saveEditComment}
                      deleteCommentFn={deleteCommentFn}
                      user={user}
                      handleLogin={handleLogin}
                      T={T}
                      pl={pl}
                      iS={iS}
                    />
                    {canManageTip(tip) && (
                      <div style={{ padding:"0 16px 16px", display:"flex", gap:8 }}>
                        <button onClick={(e)=>{e.stopPropagation(); startEditTip(tip);}} style={{ ...pl(false), flex:1, padding:10, fontSize:12 }}>✏️ Редактировать</button>
                        <button onClick={(e)=>{e.stopPropagation(); handleDeleteTip(tip.id);}} style={{ ...pl(false), flex:1, padding:10, fontSize:12, border:"1.5px solid #fecaca", color:"#E74C3C", background:"#FFF5F5" }}>🗑 Удалить</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={() => { openAddTipForm(); }} style={{ ...cd, width:"100%", marginTop:4, padding:16, border:`2px dashed ${T.primary}40`, color:T.primary, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"none" }}>＋ Поделиться опытом</button>
        </div>
      )}

      <TipFormModal
        showAddTip={showAddTip}
        selTC={selTC}
        setShowAddTip={setShowAddTip}
        setNewTipPhotos={setNewTipPhotos}
        setEditingTip={setEditingTip}
        cd={cd}
        T={T}
        editingTip={editingTip}
        newTip={newTip}
        setNewTip={setNewTip}
        iS={iS}
        CARD_TEXT_MAX={CARD_TEXT_MAX}
        tipFileRef={tipFileRef}
        handleTipPhotos={handleTipPhotos}
        newTipPhotos={newTipPhotos}
        pl={pl}
        canManageTip={canManageTip}
        handleDeleteTip={handleDeleteTip}
        handleAddTip={handleAddTip}
      />
    </div>
  );
}
