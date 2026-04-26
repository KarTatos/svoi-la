// Track once-per-viewer card views via /api/views.
// Pure module — does not touch React state. Caller passes ctx and an
// onUpdated callback to apply the new view count locally.

const VIEWED_STORAGE_PREFIX = "viewed_once_";
const GUEST_KEY_STORAGE = "la_viewer_key";

function getStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getViewerKey(userId) {
  if (userId) return `user:${userId}`;
  const storage = getStorage();
  try {
    let guestKey = storage?.getItem(GUEST_KEY_STORAGE);
    if (!guestKey) {
      guestKey =
        (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      storage?.setItem(GUEST_KEY_STORAGE, guestKey);
    }
    return `guest:${guestKey}`;
  } catch {
    return "guest:anonymous";
  }
}

function readViewedMap(viewerKey) {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(`${VIEWED_STORAGE_PREFIX}${viewerKey}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function markViewed(viewerKey, itemKey) {
  const storage = getStorage();
  if (!storage) return;
  try {
    const map = readViewedMap(viewerKey);
    map[itemKey] = true;
    storage.setItem(`${VIEWED_STORAGE_PREFIX}${viewerKey}`, JSON.stringify(map));
  } catch {}
}

/**
 * Record a card view.
 *
 * @param {"place"|"tip"|"event"|"housing"} itemType
 * @param {{id: any, fromDB?: boolean}} item
 * @param {{authReady?: boolean, userId?: string|null, onUpdated?: (views: number) => void}} [ctx]
 * @returns {Promise<boolean>} true when the view was registered or already known
 */
export async function trackCardView(itemType, item, ctx = {}) {
  const itemId = item?.id;
  if (!itemId || !item?.fromDB) return false;
  if (ctx.authReady === false) return false;

  const viewerKey = getViewerKey(ctx.userId);
  if (!viewerKey) return false;
  const itemKey = `${itemType}:${itemId}`;

  // Already counted for this viewer — fast path.
  if (readViewedMap(viewerKey)?.[itemKey]) return true;

  try {
    const response = await fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemType, itemId, viewerKey }),
    });
    const payload = await response.json().catch(() => null);
    if (response.ok && payload?.ok && Number.isFinite(Number(payload.views))) {
      markViewed(viewerKey, itemKey);
      if (typeof ctx.onUpdated === "function") {
        try {
          ctx.onUpdated(Number(payload.views));
        } catch {}
      }
      return true;
    }
    console.error("View track failed:", itemType, itemId, payload?.error || response.status);
    return false;
  } catch (err) {
    console.error("View track request error:", itemType, itemId, err);
    return false;
  }
}
