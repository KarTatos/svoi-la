export function resolveAppLink(url) {
  const raw = String(url || "").trim();
  const match = raw.match(/^app:\/\/(place|tip|event|housing|job)\/([^\s/?#]+)/i);
  if (!match) return null;

  const type = String(match[1] || "").toLowerCase();
  const id = String(match[2] || "").trim();
  if (!id) return null;

  const routes = {
    place:   `/places/detail/${id}`,
    tip:     `/tips`,
    event:   `/events/${id}`,
    housing: `/housing/${id}`,
    job:     `/jobs/${id}`,
  };

  return routes[type] ? { href: routes[type], type, id } : null;
}

export function openAppLink(router, url) {
  const target = resolveAppLink(url);
  if (!target?.href) return false;
  router.push(target.href);
  return true;
}