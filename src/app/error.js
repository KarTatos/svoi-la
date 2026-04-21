"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 480, width: "100%", background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: 20 }}>
        <h2 style={{ margin: "0 0 10px" }}>Произошла ошибка</h2>
        <p style={{ margin: "0 0 14px", color: "#666" }}>Мы уже получили отчёт и проверим проблему.</p>
        <button onClick={() => reset()} style={{ border: "none", background: "#F47B20", color: "#fff", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
          Попробовать снова
        </button>
      </div>
    </div>
  );
}

