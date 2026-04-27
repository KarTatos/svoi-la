// View tracking via Supabase RPC (atomic on the server side).
// One unique view per (user-or-guest) × (card), forever.

import { supabase } from "./supabase";

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

/**
 * Records a view atomically on the server.
 * Returns the current views count (incremented if new, unchanged if already counted).
 *
 * @param {"place"|"tip"|"event"|"housing"} itemType
 * @param {string|number} itemId
 * @param {string|null} userId  optional logged-in user id
 * @returns {Promise<number>} current views count, or 0 on error
 */
export async function recordView(itemType, itemId, userId = null) {
  if (!itemId) return 0;
  const viewerKey = getViewerKey(userId);
  try {
    const { data, error } = await supabase.rpc("record_view", {
      p_item_type: itemType,
      p_item_id: String(itemId),
      p_viewer_key: viewerKey,
    });
    if (error) {
      console.error("record_view failed:", error);
      return 0;
    }
    return Number(data || 0);
  } catch (err) {
    console.error("record_view error:", err);
    return 0;
  }
}
