export default function ChatScreen({
  T, cd, bk, pl, iS,
  user, chat, typing, inp, setInp,
  chatEndRef, inpRef, renderChatText,
  onGoHome, onLogin, onSend,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 120px)" }}>
      <button onClick={onGoHome} style={bk}>← Главная</button>

      {!user ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px" }}>Войдите для AI-чата</h3>
          <button onClick={onLogin} style={{ ...pl(true), padding: "14px 28px" }}>Войти через Google</button>
          <div style={{ margin: "10px auto 0", maxWidth: 420, fontSize: 12, color: T.mid, background: T.bg, border: `1px solid ${T.borderL}`, borderRadius: 10, padding: "10px 12px", lineHeight: 1.45 }}>
            Вход через Google безопасен: мы не видим ваш пароль Google. Сохраняются только имя, email и аватар для работы аккаунта.
          </div>
        </div>
      ) : (
        <>
          {/* Сообщения */}
          <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", paddingBottom: 12 }}>
            {chat.map((m, i) => (
              <div
                key={m.id || m.created_at || `${m.role}-${String(m.text || "").slice(0, 40)}-${i}`}
                style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}
              >
                <div style={{
                  maxWidth: "85%", padding: "12px 16px",
                  borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: m.role === "user" ? T.primary : T.card,
                  color: m.role === "user" ? "#fff" : T.text,
                  fontSize: 14, lineHeight: 1.55,
                  boxShadow: m.role === "user" ? "0 2px 10px rgba(244,123,32,0.25)" : T.sh,
                  border: m.role === "user" ? "none" : `1px solid ${T.borderL}`,
                }}>
                  {renderChatText(m.text, m.role === "user")}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", marginBottom: 10 }}>
                <div style={{ ...cd, padding: "14px 20px", display: "flex", gap: 5 }}>
                  {[0, 1, 2].map((j) => (
                    <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: T.primary, opacity: 0.4, animation: `pulse 1.2s ease ${j * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Поле ввода */}
          <div style={{ display: "flex", gap: 8, padding: "10px 0 0", borderTop: `1px solid ${T.borderL}`, flexShrink: 0 }}>
            <input
              ref={inpRef}
              value={inp}
              onChange={(e) => setInp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSend()}
              placeholder="Задайте вопрос..."
              style={{ ...iS, flex: 1, width: "auto" }}
            />
            <button
              onClick={() => onSend()}
              disabled={!inp.trim()}
              style={{ width: 48, height: 48, borderRadius: 14, border: "none", background: inp.trim() ? T.primary : T.bg, color: inp.trim() ? "#fff" : T.light, fontSize: 20, cursor: inp.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >↑</button>
          </div>
        </>
      )}
    </div>
  );
}
