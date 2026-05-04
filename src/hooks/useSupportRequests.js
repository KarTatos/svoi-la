import { useCallback, useState } from "react";

export function useSupportRequests({ user }) {
  const [sendingSupport, setSendingSupport] = useState(false);
  const [supportDone, setSupportDone] = useState(false);
  const [supportError, setSupportError] = useState("");

  const clearSupportStatus = useCallback(() => {
    setSupportDone(false);
    setSupportError("");
  }, []);

  const sendSupportRequest = useCallback(async (message) => {
    const text = String(message || "").trim();
    if (!text) return false;

    setSendingSupport(true);
    setSupportDone(false);
    setSupportError("");

    let error = null;
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || null,
          user_name: user?.name || null,
          user_email: user?.email || null,
          message: text,
          screen: "support",
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        error = new Error(payload?.error || "Не удалось отправить запрос.");
      }
    } catch (e) {
      error = e;
    }

    setSendingSupport(false);
    if (error) {
      setSupportDone(false);
      setSupportError(error?.message || "Не удалось отправить запрос. Попробуйте еще раз.");
      return false;
    }

    setSupportDone(true);
    setSupportError("");
    return true;
  }, [user]);

  return {
    sendingSupport,
    supportDone,
    supportError,
    clearSupportStatus,
    sendSupportRequest,
  };
}
