import * as Sentry from "@sentry/nextjs";

function safeJson(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

function basePayload(level, event, meta = {}) {
  return {
    ts: new Date().toISOString(),
    level,
    event,
    env: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development",
    ...safeJson(meta),
  };
}

export function logInfo(event, meta = {}) {
  console.log(JSON.stringify(basePayload("info", event, meta)));
}

export function logWarn(event, meta = {}) {
  console.warn(JSON.stringify(basePayload("warn", event, meta)));
}

export function logError(event, error, meta = {}) {
  const err = error instanceof Error ? error : new Error(String(error || "Unknown error"));
  const payload = basePayload("error", event, {
    ...meta,
    errorName: err.name,
    errorMessage: err.message,
    stack: err.stack,
  });
  console.error(JSON.stringify(payload));

  Sentry.withScope((scope) => {
    scope.setTag("event", event);
    Object.entries(meta || {}).forEach(([k, v]) => {
      scope.setExtra(k, safeJson(v));
    });
    Sentry.captureException(err);
  });
}

export function requestMeta(request) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const path = (() => {
    try { return new URL(request.url).pathname; } catch { return ""; }
  })();
  return {
    requestId,
    method: request.method,
    path,
  };
}

