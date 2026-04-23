import CommentsBlock from "../components/CommentsBlock";

export default function PlaceDetailScreen({
  scr,
  activePlace,
  selPC,
  selD,
  setScr,
  setExp,
  bk,
  cd,
  T,
  openAddressInMaps,
  formatPlaceAddressLabel,
  favorites,
  toggleFavorite,
  StarIcon,
  liked,
  handleToggleLike,
  HeartIcon,
  limitCardText,
  openPhotoViewer,
  handleNativeShare,
  ShareIcon,
  addPlaceComment,
  comments,
  canManagePlace,
  startEditPlace,
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
    user,
    handleLogin,
    pl,
    iS,
  } = comments;

  if (!(scr==="place-item" && activePlace && selPC && selD)) return null;

  return (
    <div>
      <button onClick={() => { setScr("places-cat"); setExp(null); }} style={bk}>← {selPC.title}</button>
      <div style={{ ...cd, overflow:"hidden", borderColor:T.borderL }}>
        <div style={{ padding:16 }}>
          <div style={{ display:"flex", gap:14, marginBottom:12, alignItems:"flex-start" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:20, lineHeight:1.2 }}>{activePlace.name}</div>
              <button onClick={() => openAddressInMaps(activePlace.address || selD.name)} style={{ background:"none", border:"none", padding:0, marginTop:5, color:T.mid, fontSize:13, cursor:"pointer", fontFamily:"inherit", textDecoration:"underline", textAlign:"left" }}>
                {formatPlaceAddressLabel(activePlace.address || selD.name)}
              </button>
              <div style={{ marginTop:5, fontSize:12, color:T.light }}>от {activePlace.addedBy}</div>
            </div>
            <div style={{ minWidth:118, display:"flex", justifyContent:"flex-end", gap:6 }}>
              <button onClick={() => toggleFavorite(activePlace.id,"place")} style={{ border:"none", background:favorites[`place-${activePlace.id}`] ? "#FFF8E8" : "#F7F7F8", color:favorites[`place-${activePlace.id}`] ? "#D68910" : T.mid, borderRadius:999, padding:"5px 9px", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:12, lineHeight:1, display:"inline-flex", alignItems:"center", justifyContent:"center" }} title="Избранное"><StarIcon active={!!favorites[`place-${activePlace.id}`]} size={15} /></button>
              <button
                onClick={() => handleToggleLike(activePlace.id,"place")}
                style={{ border:"none", borderRadius:999, padding:"5px 9px", background:liked[`place-${activePlace.id}`] ? "#FFF1F1" : T.bg, color:liked[`place-${activePlace.id}`] ? "#C0392B" : T.mid, fontWeight:700, fontSize:12, lineHeight:1, display:"inline-flex", alignItems:"center", gap:4, cursor:"pointer", fontFamily:"inherit" }}
                title="Нравится"
              >
                <HeartIcon active={!!liked[`place-${activePlace.id}`]} size={15} /> {activePlace.likes || 0}
              </button>
            </div>
          </div>
          <div style={{ marginBottom:12, padding:12, background:T.bg, borderRadius:10, borderLeft:`3px solid ${selPC.color}` }}><div style={{ fontSize:14, color:T.mid, lineHeight:1.6, whiteSpace:"pre-wrap", overflowWrap:"anywhere", wordBreak:"break-word" }}>{limitCardText(activePlace.tip)}</div></div>

          {activePlace.photos?.length > 0 && (
            <div style={{ display:"flex", gap:8, overflowX:"auto", marginBottom:10, paddingBottom:4, scrollSnapType:"x mandatory" }}>
              {activePlace.photos.map((ph, pi) => (
                <img key={pi} src={ph} alt="" style={{ width:120, height:120, objectFit:"cover", borderRadius:12, border:`1px solid ${T.border}`, cursor:"zoom-in", flexShrink:0, scrollSnapAlign:"start" }} onClick={() => openPhotoViewer(activePlace.photos, pi)} />
              ))}
            </div>
          )}
          {activePlace.photos?.length > 1 && <div style={{ fontSize:11, color:T.light, marginBottom:10 }}>Листайте фото →</div>}

          <div style={{ padding:"8px 0 10px", display:"flex", gap:14, alignItems:"center" }}>
            <button onClick={()=> handleNativeShare({title:activePlace.name,text:activePlace.tip,url:window.location.href})} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", color:T.mid, padding:0, display:"inline-flex", alignItems:"center", justifyContent:"center" }} title="Поделиться"><ShareIcon size={18} /></button>
          </div>

          <CommentsBlock
            item={activePlace}
            type="place"
            addFn={addPlaceComment}
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

          {canManagePlace(activePlace) && (
            <div style={{ paddingTop:4, display:"flex", gap:8 }}>
              <button onClick={()=>startEditPlace(activePlace)} style={{ flex:1, padding:"10px 0", borderRadius:24, border:`1.5px solid ${T.border}`, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:4, fontSize:12, fontWeight:600, background:T.card, color:T.mid }}>?? Редактировать</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
