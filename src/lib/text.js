// Pure text helpers shared across the app.

export function normalizeAddressText(value = "") {
  const noHtml = String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const firstVariant = noHtml.split(" / ")[0].split("/")[0].trim();
  const normalized = (firstVariant || noHtml)
    .replace(/\s*,\s*/g, ", ")
    .replace(/(,\s*){2,}/g, ", ")
    .replace(/,\s*$/, "")
    .trim();
  const parts = normalized.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length > 4) return parts.slice(0, 4).join(", ");
  return normalized;
}
