import { useState } from "react";

export default function SupportScreen({
  T,
  cd,
  bk,
  pl,
  iS,
  user,
  onBack,
  onSubmit,
  sending,
  done,
  error,
  onClearStatus,
}) {
  const [text, setText] = useState("");

  const canSend = text.trim().length >= 5;

  const submit = async () => {
    if (!canSend || sending) return;
    onClearStatus?.();
    const ok = await onSubmit(text.trim());
    if (ok) {
      setText("");
    }
  };

  return (
    <div>
      <button onClick={onBack} style={bk}>← Поддержка</button>

      <div style={{ ...cd, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Написать в поддержку</div>
        <div style={{ fontSize: 13, color: T.mid, marginBottom: 10 }}>
          Опишите проблему или вопрос. Запрос отправляется напрямую в поддержку из приложения.
        </div>

        <div style={{ fontSize: 12, color: T.light, marginBottom: 6 }}>Ваш аккаунт</div>
        <div style={{ ...iS, padding: "10px 12px", marginBottom: 10, fontSize: 13, color: T.mid }}>
          {user?.name || "Пользователь"} {user?.email ? `(${user.email})` : ""}
        </div>

        <div style={{ fontSize: 12, color: T.light, marginBottom: 6 }}>Текст запроса</div>
        <textarea
          value={text}
          onChange={(e) => {
            onClearStatus?.();
            setText(e.target.value.slice(0, 1500));
          }}
          placeholder="Например: не могу войти через Google на iPhone..."
          style={{ ...iS, minHeight: 140, resize: "vertical", marginBottom: 6 }}
        />
        <div style={{ textAlign: "right", fontSize: 11, color: T.light, marginBottom: 12 }}>
          {text.length}/1500
        </div>

        <button
          onClick={submit}
          disabled={!canSend || sending}
          style={{ ...pl(canSend && !sending), width: "100%", padding: 12, opacity: canSend && !sending ? 1 : 0.5 }}
        >
          {sending ? "Отправка..." : "Отправить в поддержку"}
        </button>

        {done && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#2f855a" }}>
            Запрос отправлен в поддержку.
          </div>
        )}
        {!!error && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#E74C3C" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
