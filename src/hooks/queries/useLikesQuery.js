import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { fetchLikesQuery } from "./likesQuery";

export function useLikesQuery(userId, enabled = true) {
  const queryClient = useQueryClient();
  const reloadTimerRef = useRef(null);

  useEffect(() => {
    if (!userId) return undefined;

    const scheduleReload = () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      reloadTimerRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["likes", userId] });
      }, 260);
    };

    const channel = supabase
      .channel("svoi_la_realtime_sync_likes")
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, () => {
        scheduleReload();
      })
      .subscribe();

    return () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  return useQuery({
    queryKey: ["likes", userId],
    queryFn: () => fetchLikesQuery(userId),
    enabled: Boolean(enabled && userId),
  });
}
