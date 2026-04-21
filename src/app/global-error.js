"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ margin: 0, background: "#f4f4f7", fontFamily: "Manrope, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 480, width: "100%", background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: 20 }}>
            <h2 style={{ margin: "0 0 10px" }}>Критическая ошибка</h2>
            <p style={{ margin: "0 0 14px", color: "#666" }}>Отчёт отправлен. Нажмите кнопку, чтобы перезапустить экран.</p>
            <button onClick={() => reset()} style={{ border: "none", background: "#F47B20", color: "#fff", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
              Перезапустить
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

