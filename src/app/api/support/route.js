import { NextResponse } from "next/server";

function esc(value) {
  return String(value || "").replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const message = String(body?.message || "").trim();
    const userName = String(body?.user_name || "Пользователь").trim();
    const userEmail = String(body?.user_email || "").trim();
    const userId = String(body?.user_id || "").trim();
    const appScreen = String(body?.screen || "").trim();

    if (!message || message.length < 5) {
      return NextResponse.json({ error: "Сообщение слишком короткое" }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_SUPPORT_CHAT_ID;
    if (!token || !chatId) {
      return NextResponse.json({ error: "Telegram не настроен: TELEGRAM_BOT_TOKEN / TELEGRAM_SUPPORT_CHAT_ID" }, { status: 500 });
    }

    const now = new Date();
    const lines = [
      "🛟 *Новый запрос в поддержку*",
      "",
      `👤 ${esc(userName)}${userEmail ? ` \\(${esc(userEmail)}\\)` : ""}`,
      userId ? `🆔 ${esc(userId)}` : "",
      appScreen ? `📍 Экран: ${esc(appScreen)}` : "",
      `🕒 ${esc(now.toLocaleString("ru-RU"))}`,
      "",
      `💬 ${esc(message)}`,
    ].filter(Boolean);

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
      }),
    });

    const payload = await tgRes.json().catch(() => ({}));
    if (!tgRes.ok || payload?.ok === false) {
      return NextResponse.json({ error: payload?.description || "Ошибка отправки в Telegram" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Неверный запрос" }, { status: 400 });
  }
}

