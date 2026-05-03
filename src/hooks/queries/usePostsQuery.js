import { useQuery } from "@tanstack/react-query";
import { fetchPostsQuery } from "./postsQuery";

export function usePostsQuery(enabled = true) {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPostsQuery,
    enabled,
  });
}
