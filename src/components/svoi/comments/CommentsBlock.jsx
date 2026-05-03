import { useState } from "react";

export default function CommentsBlock({
  item,
  type,
  T,
  iS,
  pl,
  user,
  onLogin,
  onAddComment,
  onEditComment,
  onDeleteComment,
  isOpen: isOpenProp,
  showHeader = true,
  showInput = true,
  inputPlaceholder = "Ответ...",
}) {
  const comments = item.comments || [];
  const [internalOpen, setInternalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);
  const isOpen = typeof isOpenProp === "boolean" ? isOpenProp : internalOpen;

  const submitAdd = async () => {
    const text = newComment.trim();
    if (!text) return;
    await onAddComment(item.id, text);
    setNewComment("");
  };

  const saveEdit = async (commentId) => {
    const text = editCommentText.trim();
    if (!text) return;
    await onEditComment(item.id, commentId, type, text);
    setEditingComment(null);
    setEditCommentText("");
  };

  const toggleOpen = (e) => {
    e?.stopPropagation?.();
    setInternalOpen((v) => !v);
    setNewComment("");
    setEditingComment(null);
    setEditCommentText("");
  };

  return (
    <div style={{ padding: "0 16px 16px" }}>
      {showHeader && (
        <button
          onClick={toggleOpen}
          style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: T.mid, padding: "4px 0", display: "flex", alignItems: "center", gap: 6 }}
        >
          Комментарии ({comments.length})
          <span style={{ fontSize: 10, color: T.light, transition: "0.3s", transform: isOpen ? "rotate(180deg)" : "" }}>▼</span>
        </button>
      )}

      {isOpen && (
        <div style={{ marginTop: 8 }}>
          {comments.map((c) => (
            <div key={c.id || Math.random()} style={{ padding: "10px 12px", background: T.bg, borderRadius: 10, marginBottom: 6, fontSize: 13 }}>
              {editingComment === c.id ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} style={{ ...iS, flex: 1, padding: "8px 12px", fontSize: 13 }} />
                  <button onClick={() => saveEdit(c.id)} style={{ ...pl(true), padding: "8px 14px", fontSize: 12 }}>✓</button>
                  <button onClick={() => { setEditingComment(null); setEditCommentText(""); }} style={{ ...pl(false), padding: "8px 14px", fontSize: 12 }}>✕</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: T.text }}>{c.author}</span>
                    {user && (user.id === c.userId || user.name === c.author) && (
                      <div style={{ position: "relative" }}>
                        <button
                          onClick={() => setOpenCommentMenuId((v) => (v === c.id ? null : c.id))}
                          style={{ background: "none", border: "none", color: T.light, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 4px" }}
                          title="Меню"
                        >
                          ...
                        </button>
                        {openCommentMenuId === c.id && (
                          <div style={{ position: "absolute", right: 0, top: 18, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, minWidth: 130, zIndex: 8, overflow: "hidden", boxShadow: "0 8px 20px rgba(0,0,0,0.18)" }}>
                            <button
                              onClick={() => { setOpenCommentMenuId(null); setEditingComment(c.id); setEditCommentText(c.text); }}
                              style={{ width: "100%", textAlign: "left", background: "none", border: "none", color: T.text, padding: "9px 10px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}
                            >
                              Редактировать
                            </button>
                            <button
                              onClick={() => { setOpenCommentMenuId(null); onDeleteComment(item.id, c.id, type); }}
                              style={{ width: "100%", textAlign: "left", background: "none", border: "none", color: "#E74C3C", padding: "9px 10px", cursor: "pointer", fontSize: 13, fontFamily: "inherit", borderTop: `1px solid ${T.borderL}` }}
                            >
                              Удалить
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ color: T.mid, marginTop: 4 }}>{c.text}</div>
                </div>
              )}
            </div>
          ))}

          {user && showInput ? (
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitAdd()}
                placeholder={inputPlaceholder}
                style={{ ...iS, flex: 1, padding: "10px 14px" }}
              />
              <button onClick={submitAdd} disabled={!newComment.trim()} style={{ ...pl(!!newComment.trim()), padding: "10px 16px", opacity: newComment.trim() ? 1 : 0.5 }}>{"->"}</button>
            </div>
          ) : !user ? (
            <button onClick={onLogin} style={{ ...pl(false), width: "100%", fontSize: 12, marginTop: 4 }}>Войдите чтобы комментировать</button>
          ) : null}
        </div>
      )}
    </div>
  );
}
