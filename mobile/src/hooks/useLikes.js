import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLike, fetchUserLikedIds } from "../lib/likes";

// ─── useLikes ─────────────────────────────────────────────────────────────────
// For screens that show a LIST of items (tips, places list, feed).
// Fetches all liked IDs for user in one query.
//
// itemType  — 'tip' | 'place' | 'post' | 'event'
// userId    — current user id (or null if not logged in)
// queryKey  — React Query key for the items list (for optimistic update)
// likeField — field name in each item that holds the count (default: 'likes')
//
// Returns:
//   likedIds — Set<string> of liked item ids
//   isLiked(id) — boolean helper
//   toggle(id)  — call on heart press

export function useLikes(itemType, userId, queryKey, likeField = "likes") {
  const queryClient = useQueryClient();
  const [likedIds, setLikedIds] = useState(new Set());
  const userIdRef = useRef(userId);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  // Load all liked IDs for this user+type on mount / when user changes
  useEffect(() => {
    if (!userId) {
      setLikedIds(new Set());
      return;
    }
    fetchUserLikedIds(itemType, userId).then(setLikedIds);
  }, [itemType, userId]);

  const mutation = useMutation({
    mutationFn: (itemId) => toggleLike(itemType, itemId, userIdRef.current),

    onMutate: (itemId) => {
      const sid = String(itemId);
      const wasLiked = likedIds.has(sid);

      // Optimistic: flip liked state immediately
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.delete(sid);
        else next.add(sid);
        return next;
      });

      // Optimistic: update count in React Query cache
      if (queryKey) {
        queryClient.setQueryData(queryKey, (prev = []) =>
          prev.map((item) =>
            String(item.id) === sid
              ? { ...item, [likeField]: Math.max(0, (item[likeField] || 0) + (wasLiked ? -1 : 1)) }
              : item
          )
        );
      }

      return { wasLiked };
    },

    onError: (err, itemId, ctx) => {
      const msg = err?.message || String(err);
      console.error("[useLikes] toggle failed:", msg);
      Alert.alert("Ошибка лайка", msg);
      // Rollback liked state
      const sid = String(itemId);
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (ctx.wasLiked) next.add(sid);
        else next.delete(sid);
        return next;
      });
      // Rollback count in cache
      if (queryKey) {
        queryClient.setQueryData(queryKey, (prev = []) =>
          prev.map((item) =>
            String(item.id) === sid
              ? { ...item, [likeField]: Math.max(0, (item[likeField] || 0) + (ctx.wasLiked ? 1 : -1)) }
              : item
          )
        );
      }
    },
  });

  const isLiked = useCallback(
    (itemId) => likedIds.has(String(itemId)),
    [likedIds]
  );

  const toggle = useCallback(
    (itemId) => {
      if (!userId) return; // caller should redirect to login
      mutation.mutate(itemId);
    },
    [userId, mutation]
  );

  return { likedIds, isLiked, toggle };
}
