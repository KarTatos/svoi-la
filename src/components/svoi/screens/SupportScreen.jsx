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
}) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const canSend = text.trim().length >= 5;

  const submit = async () => {
    if (!canSend) return;
    setError("");
    setSent(false);
    const ok = await onSubmit(text.trim());
    if (ok) {
      setSent(true);
      setText("");
      return;
    }
    setError("Не удалось отправить запрос. Попробуйте еще раз.");
  };

  return (
    <div>
      <button onClick={onBack} style={bk}>← Поддержка</button>

      <div style={{ ...cd, padding: 16, marginBottom: 12 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1500))}
          placeholder="Опишите проблему..."
          style={{ ...iS, minHeight: 140, resize: "vertical", marginBottom: 6 }}
        />
        <div style={{ textAlign: "right", fontSize: 11, color: T.light, marginBottom: 12 }}>
          {text.length}/1500
        </div>

        <button
          onClick={submit}
          disabled={!canSend}
          style={{ ...pl(canSend), width: "100%", padding: 12, opacity: canSend ? 1 : 0.5 }}
        >
          Отправить в поддержку
        </button>

        {sent && (
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
