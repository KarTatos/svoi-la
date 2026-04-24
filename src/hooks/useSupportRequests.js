import { useCallback, useState } from "react";
import { addSupportRequest as dbAddSupportRequest } from "../lib/supabase";

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
    if (!text || !user?.id) return false;

    setSendingSupport(true);
    setSupportDone(false);
    setSupportError("");

    const payload = {
      user_id: user.id,
      user_name: user.name || null,
      user_email: user.email || null,
      message: text,
      status: "new",
    };

    const { error } = await dbAddSupportRequest(payload);

    setSendingSupport(false);
    if (error) {
      setSupportDone(false);
      setSupportError("Не удалось отправить запрос. Попробуйте еще раз.");
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

