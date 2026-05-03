import { useState } from "react";
import CommentsBlock from "../comments/CommentsBlock";
import { HeartIcon } from "../config";

export default function CommunityScreen({
  T,
  cd,
  pl,
  iS,
  user,
  posts,
  postsError,
  liked,
  onGoHome,
  onLogin,
  onToggleLike,
  onCreatePost,
  onUpdatePost,
  onDeletePost,
  canManagePost,
  onAddReply,
  onEditReply,
  onDeleteReply,
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  const submitPost = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!user) {
      onLogin();
      return;
    }
    setErrorText("");
    setSaving(true);
    try {
      if (editingId) {
        await onUpdatePost(editingId, { text: trimmed });
      } else {
        await onCreatePost(trimmed);
      }
      setText("");
      setEditingId(null);
      setComposerOpen(false);
    } catch (err) {
      const msg = err?.message || "Не удалось опубликовать пост";
      setErrorText(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 40, margin: "4px 0 14px" }}>
        <button
          onClick={onGoHome}
          style={{ width: 40, height: 40, borderRadius: 13, border: "none", background: "#FFFFFF", color: "#8E8E93", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          title="Назад"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h2 style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 20, fontWeight: 700, margin: 0, whiteSpace: "nowrap" }}>Чат сообщества</h2>
        <button
          onClick={() => {
            if (!user) {
              onLogin();
              return;
            }
            setComposerOpen((v) => !v);
            setEditingId(null);
            setText("");
          }}
          style={{ width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${T.primary}55`, background: T.primaryLight, color: T.primary, fontSize: 28, lineHeight: 1, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
          title="Новый пост"
        >+</button>
      </div>

      {composerOpen && (
        <div style={{ ...cd, padding: 12, marginBottom: 12 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            placeholder="Что у вас нового?"
            style={{ ...iS, minHeight: 94, resize: "vertical", marginBottom: 8 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: T.light }}>{text.length}/500</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setComposerOpen(false); setEditingId(null); setText(""); }} style={{ ...pl(false), padding: "8px 12px", fontSize: 12 }}>Отмена</button>
              <button onClick={submitPost} disabled={!text.trim() || saving} style={{ ...pl(true), padding: "8px 12px", fontSize: 12, opacity: !text.trim() || saving ? 0.5 : 1 }}>{editingId ? "Сохранить" : "Опубликовать"}</button>
            </div>
          </div>
          {errorText && <div style={{ marginTop: 8, fontSize: 12, color: "#C0392B", whiteSpace: "pre-wrap" }}>{errorText}</div>}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 80 }}>
        {postsError && (
          <div style={{ ...cd, padding: 12, fontSize: 12, color: "#C0392B", whiteSpace: "pre-wrap" }}>
            Ошибка загрузки постов: {postsError?.message || "неизвестная ошибка"}
          </div>
        )}
        {posts.map((post) => (
          <div key={post.id} style={{ ...cd, overflow: "hidden", borderColor: T.borderL }}>
            <div style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{post.author || "Пользователь"}</div>
                <div style={{ fontSize: 11, color: T.light }}>{post.created_at ? new Date(post.created_at).toLocaleString() : ""}</div>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.45, color: T.text, whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word", marginBottom: 10 }}>{post.text}</div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => onToggleLike(post.id, "post")}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5, color: liked[`post-${post.id}`] ? "#C0392B" : T.mid, padding: 0 }}
                  title="Нравится"
                >
                  <HeartIcon active={!!liked[`post-${post.id}`]} size={16} /> {post.likes || 0}
                </button>
                <span style={{ fontSize: 13, color: T.mid }}>💬 {(post.comments || []).length}</span>
                {canManagePost(post) && (
                  <>
                    <button
                      onClick={() => {
                        setComposerOpen(true);
                        setEditingId(post.id);
                        setText(post.text || "");
                      }}
                      style={{ marginLeft: "auto", background: "none", border: "none", color: T.light, cursor: "pointer", fontSize: 12, padding: 0 }}
                    >
                      ✏️ Ред.
                    </button>
                    <button
                      onClick={() => onDeletePost(post.id)}
                      style={{ background: "none", border: "none", color: "#E74C3C", cursor: "pointer", fontSize: 12, padding: 0 }}
                    >
                      🗑 Удалить
                    </button>
                  </>
                )}
              </div>
            </div>

            <CommentsBlock
              item={post}
              type="post"
              T={T}
              iS={iS}
              pl={pl}
              user={user}
              onLogin={onLogin}
              onAddComment={onAddReply}
              onEditComment={onEditReply}
              onDeleteComment={onDeleteReply}
            />
          </div>
        ))}

        {posts.length === 0 && (
          <div style={{ ...cd, padding: 16, fontSize: 13, color: T.mid, textAlign: "center" }}>
            Пока нет сообщений. Будьте первым.
          </div>
        )}
      </div>
    </div>
  );
}
