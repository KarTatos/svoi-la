import { useState } from "react";
import CommentsBlock from "../comments/CommentsBlock";

function HeartOutline({ active = false }) {
  const color = active ? "#ff5b6e" : "#d8d8d8";
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function ReplyOutline() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#d8d8d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

function avatarText(name = "U") {
  const parts = String(name || "U").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export default function CommunityScreen({
  T,
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
  const [openMenuId, setOpenMenuId] = useState(null);

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
    <div style={{ background: "#000000", margin: "-16px -16px 0", padding: "16px 16px 0", minHeight: "calc(100dvh - 110px)" }}>
      <div style={{ background: "#111315", borderRadius: 14, overflow: "hidden", border: "1px solid #2a2d32" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 44, margin: 0, padding: "10px 12px", borderBottom: "1px solid #2a2d32" }}>
        <button
          onClick={onGoHome}
          style={{ width: 36, height: 36, borderRadius: 11, border: "1px solid #2a2d32", background: "#1a1d22", color: "#d3d4d6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          title="Назад"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h2 style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 18, fontWeight: 700, margin: 0, whiteSpace: "nowrap", color: "#f4f4f5" }}>Чат</h2>
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
          style={{ width: 36, height: 36, borderRadius: 11, border: `1px solid ${T.primary}55`, background: "#1a1d22", color: T.primary, fontSize: 26, lineHeight: 1, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}
          title="Новый пост"
        >+</button>
      </div>

      {composerOpen && (
        <div style={{ padding: 12, borderBottom: "1px solid #2a2d32", background: "#16191d" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            placeholder="Что у вас нового?"
            style={{ ...iS, minHeight: 94, resize: "vertical", marginBottom: 8, background: "#101215", color: "#f4f4f5", borderColor: "#2a2d32" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{text.length}/500</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setComposerOpen(false); setEditingId(null); setText(""); }} style={{ ...pl(false), padding: "8px 12px", fontSize: 12 }}>Отмена</button>
              <button onClick={submitPost} disabled={!text.trim() || saving} style={{ ...pl(true), padding: "8px 12px", fontSize: 12, opacity: !text.trim() || saving ? 0.5 : 1 }}>{editingId ? "Сохранить" : "Опубликовать"}</button>
            </div>
          </div>
          {errorText && <div style={{ marginTop: 8, fontSize: 12, color: "#f87171", whiteSpace: "pre-wrap" }}>{errorText}</div>}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", paddingBottom: 80, background: "#111315" }}>
        {postsError && (
          <div style={{ padding: 12, fontSize: 12, color: "#f87171", whiteSpace: "pre-wrap", borderBottom: "1px solid #2a2d32" }}>
            Ошибка загрузки постов: {postsError?.message || "неизвестная ошибка"}
          </div>
        )}

        {posts.map((post) => (
          <div key={post.id} style={{ borderBottom: "1px solid #2a2d32", background: "#111315" }}>
            <div style={{ padding: "14px 14px 10px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#2f353d", color: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0, border: "1px solid #434a54" }}>
                  {avatarText(post.author)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, lineHeight: 0.2, color: "#fff", textAlign: "right", paddingRight: 2 }}>
                    {canManagePost(post) ? (
                      <button
                        onClick={() => setOpenMenuId((v) => (v === post.id ? null : post.id))}
                        style={{ background: "none", border: "none", color: "#d8d8d8", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px" }}
                        title="Меню"
                      >
                        ...
                      </button>
                    ) : null}
                  </div>
                  {openMenuId === post.id && canManagePost(post) && (
                    <div style={{ position: "absolute", right: 14, top: 34, background: "#1a1e24", border: "1px solid #353b45", borderRadius: 10, minWidth: 140, zIndex: 5, overflow: "hidden" }}>
                      <button
                        onClick={() => {
                          setComposerOpen(true);
                          setEditingId(post.id);
                          setText(post.text || "");
                          setOpenMenuId(null);
                        }}
                        style={{ width: "100%", textAlign: "left", background: "none", border: "none", color: "#f3f4f6", padding: "10px 12px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          onDeletePost(post.id);
                        }}
                        style={{ width: "100%", textAlign: "left", background: "none", border: "none", color: "#f87171", padding: "10px 12px", cursor: "pointer", fontSize: 13, fontFamily: "inherit", borderTop: "1px solid #2b3038" }}
                      >
                        Удалить
                      </button>
                    </div>
                  )}

                  <div style={{ marginTop: -10, fontSize: 15, lineHeight: 1, color: "#f4f4f5", fontWeight: 700 }}>{post.author || "Пользователь"}</div>
                  <div style={{ fontSize: 16, lineHeight: 1.2, color: "#f4f4f5", whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word", marginTop: 6 }}>
                    {post.text}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
                    <button
                      onClick={() => onToggleLike(post.id, "post")}
                      style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6, color: "#d8d8d8", padding: 0, fontSize: 14 }}
                      title="Нравится"
                    >
                      <HeartOutline active={!!liked[`post-${post.id}`]} /> <span>{post.likes || 0}</span>
                    </button>
                    <span style={{ fontSize: 14, color: "#d8d8d8", display: "inline-flex", alignItems: "center", gap: 6 }}><ReplyOutline /> {(post.comments || []).length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: "#16191d", borderTop: "1px solid #2a2d32" }}>
              <CommentsBlock
                item={post}
                type="post"
                T={{ ...T, bg: "#1a1d22", card: "#16191d", text: "#f4f4f5", mid: "#c5c9d0", light: "#9ca3af", border: "#2f3540", borderL: "#2a2d32", primary: T.primary, primaryLight: "#2c2f35" }}
                iS={{ ...iS, background: "#0f1114", color: "#f4f4f5", border: "1px solid #2f3540" }}
                pl={pl}
                user={user}
                onLogin={onLogin}
                onAddComment={onAddReply}
                onEditComment={onEditReply}
                onDeleteComment={onDeleteReply}
              />
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div style={{ padding: 16, fontSize: 13, color: "#b7bdc7", textAlign: "center" }}>
            Пока нет сообщений. Будьте первым.
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
