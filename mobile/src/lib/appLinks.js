export function resolveAppLink(url) {
  const raw = String(url || "").trim();
  const match = raw.match(/^app:\/\/(place|tip|event|housing)\/([^\s/?#]+)/i);
  if (!match) return null;

  const type = String(match[1] || "").toLowerCase();
  const id = String(match[2] || "").trim();
  if (!id) return null;

  if (type === "place") {
    return { href: `/places/detail/${id}` };
  }

  if (type === "tip") {
    return { href: "/tips" };
  }

  if (type === "event" || type === "housing") {
    return null;
  }

  return null;
}

export function openAppLink(router, url) {
  const target = resolveAppLink(url);
  if (!target?.href) return false;
  router.push(target.href);
  return true;
}