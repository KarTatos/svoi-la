export default function CommentsBlock({
  item,
  type,
  addFn,
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
  T,
  pl,
  iS,
}) {
  const comments = item.comments || [];
  const isOpen = showComments === `${type}-${item.id}`;

  return (
    <div style={{ padding:"0 16px 16px" }}>
      <button
        onClick={e=>{e.stopPropagation(); setShowComments(isOpen ? null : `${type}-${item.id}`); setNewComment(""); setEditingComment(null);}}
        style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, color:T.mid, padding:"4px 0", display:"flex", alignItems:"center", gap:6 }}
      >
        💬 Комментарии ({comments.length}) <span style={{ fontSize:10, color:T.light, transition:"0.3s", transform:isOpen?"rotate(180deg)":"" }}>▼</span>
      </button>
      {isOpen && (<div style={{ marginTop:8 }}>
        {comments.map((c) => (
          <div key={c.id||Math.random()} style={{ padding:"10px 12px", background:T.bg, borderRadius:10, marginBottom:6, fontSize:13 }}>
            {editingComment === c.id ? (
              <div style={{ display:"flex", gap:6 }}>
                <input value={editCommentText} onChange={e=>setEditCommentText(e.target.value)} style={{ ...iS, flex:1, padding:"8px 12px", fontSize:13 }} />
                <button onClick={()=>saveEditComment(item.id, c.id, type)} style={{ ...pl(true), padding:"8px 14px", fontSize:12 }}>✓</button>
                <button onClick={()=>{setEditingComment(null);setEditCommentText("")}} style={{ ...pl(false), padding:"8px 14px", fontSize:12 }}>✕</button>
              </div>
            ) : (<div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontWeight:600, color:T.text }}>{c.author}</span>
                {user && (user.id === c.userId || user.name === c.author) && (
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={()=>{setEditingComment(c.id);setEditCommentText(c.text)}} style={{ background:"none", border:"none", color:T.light, cursor:"pointer", fontSize:11, padding:2 }}>✏️</button>
                    <button onClick={()=>deleteCommentFn(item.id, c.id, type)} style={{ background:"none", border:"none", color:"#E74C3C", cursor:"pointer", fontSize:11, padding:2 }}>🗑</button>
                  </div>
                )}
              </div>
              <div style={{ color:T.mid, marginTop:4 }}>{c.text}</div>
            </div>)}
          </div>
        ))}
        {user ? (
          <div style={{ display:"flex", gap:8, marginTop:6 }}>
            <input value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addFn(item.id)} placeholder="Написать комментарий..." style={{ ...iS, flex:1, padding:"10px 14px" }} />
            <button onClick={()=>addFn(item.id)} disabled={!newComment.trim()} style={{ ...pl(!!newComment.trim()), padding:"10px 16px", opacity:newComment.trim()?1:0.5 }}>→</button>
          </div>
        ) : (<button onClick={handleLogin} style={{ ...pl(false), width:"100%", fontSize:12, marginTop:4 }}>Войдите чтобы комментировать</button>)}
      </div>)}
    </div>
  );
}

