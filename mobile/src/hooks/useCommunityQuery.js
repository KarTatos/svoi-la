import { useQuery } from "@tanstack/react-query";
import { fetchPosts, fetchReplies } from "../lib/community";

export function useCommunityQuery(enabled = true) {
  return useQuery({
    queryKey: ["community"],
    queryFn: fetchPosts,
    enabled: Boolean(enabled),
    staleTime: 30_000,
  });
}

export function useRepliesQuery(parentId, enabled = true) {
  return useQuery({
    queryKey: ["community-replies", parentId],
    queryFn: () => fetchReplies(parentId),
    enabled: Boolean(enabled) && Boolean(parentId),
    staleTime: 15_000,
  });
}
