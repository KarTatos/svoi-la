import { useCallback, useMemo, useState } from "react";
import { sendChatMessage } from "../lib/aiChat";

const INITIAL_ASSISTANT_MESSAGE =
  "Здравствуйте. Задайте вопрос по USCIS, местам, событиям, советам или жилью.";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAiChat() {
  const [messages, setMessages] = useState([
    { id: makeId(), role: "assistant", text: INITIAL_ASSISTANT_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");

  const history = useMemo(
    () =>
      messages
        .filter((m) => m.role === "assistant" || m.role === "user")
        .slice(-10)
        .map((m) => ({ role: m.role, text: m.text })),
    [messages]
  );

  const sendMessage = useCallback(async () => {
    const message = String(input || "").trim();
    if (!message || typing) return;

    const userMsg = { id: makeId(), role: "user", text: message };
    setInput("");
    setError("");
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      const nextHistory = [...history, { role: "user", text: message }].slice(-10);
      const result = await sendChatMessage({ message, history: nextHistory });
      setMessages((prev) => [...prev, { id: makeId(), role: "assistant", text: result.text || "" }]);
    } catch (cause) {
      const msg = cause?.message || "Ошибка сервера";
      setError(msg);
      setMessages((prev) => [...prev, { id: makeId(), role: "assistant", text: msg }]);
    } finally {
      setTyping(false);
    }
  }, [history, input, typing]);

  const resetError = useCallback(() => setError(""), []);

  return {
    messages,
    input,
    setInput,
    typing,
    error,
    sendMessage,
    resetError,
    initialAssistantMessage: INITIAL_ASSISTANT_MESSAGE,
  };
}
