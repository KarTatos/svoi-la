export function getChatApiUrl() {
  const base = String(process.env.EXPO_PUBLIC_WEB_API_BASE_URL || "").trim().replace(/\/$/, "");
  if (!base) return "";
  return `${base}/api/chat`;
}

export async function sendChatMessage({ message, history }) {
  const url = getChatApiUrl();
  if (!url) {
    throw new Error("Не задан EXPO_PUBLIC_WEB_API_BASE_URL");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    if (res.status === 429) throw new Error(payload?.error || "Слишком много запросов...");
    if (res.status === 400) throw new Error(payload?.error || "Пустое сообщение");
    if (res.status === 500) throw new Error(payload?.error || "Ошибка сервера");
    throw new Error(payload?.error || `Ошибка ${res.status}`);
  }

  return {
    text: String(payload?.text || ""),
  };
}
