export const TIPS_CATS = [
  { id: "tipping", icon: "💰", title: "Чаевые", desc: "Сколько оставлять и где" },
  { id: "driving", icon: "🚗", title: "Вождение", desc: "Права, DMV, правила" },
  { id: "banking", icon: "🏦", title: "Банки и кредит", desc: "Счета, SSN, кредитная история" },
  { id: "health", icon: "🏥", title: "Медицина", desc: "Страховка, врачи, аптеки" },
  { id: "shopping", icon: "🛒", title: "Покупки", desc: "Где дешевле, возврат, налог" },
  { id: "social", icon: "🤝", title: "Общение", desc: "Культура, small talk, этикет" },
  { id: "housing", icon: "🏠", title: "Жильё", desc: "Аренда, депозит, права" },
  { id: "other", icon: "📝", title: "Разное", desc: "Всё остальное" },
];

export const CARD_TEXT_MAX = 500;
const RICH_PREFIX = "__LA_RICH_V1__";

export function limitCardText(text = "") {
  const normalized = String(text || "");
  return normalized.length > CARD_TEXT_MAX ? `${normalized.slice(0, CARD_TEXT_MAX)}…` : normalized;
}

export function encodeRichText(text, photos = []) {
  const cleanPhotos = Array.isArray(photos) ? photos.filter(Boolean) : [];
  if (!cleanPhotos.length) return text;
  return `${RICH_PREFIX}${JSON.stringify({ text, photos: cleanPhotos })}`;
}

export function decodeRichText(raw) {
  if (typeof raw !== "string" || !raw.startsWith(RICH_PREFIX)) {
    return { text: String(raw || ""), photos: [] };
  }
  try {
    const parsed = JSON.parse(raw.slice(RICH_PREFIX.length));
    return {
      text: String(parsed?.text || ""),
      photos: Array.isArray(parsed?.photos) ? parsed.photos.filter(Boolean) : [],
    };
  } catch {
    return { text: String(raw || ""), photos: [] };
  }
}
