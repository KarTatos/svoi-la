import { useQuery } from "@tanstack/react-query";
import { fetchTipsQuery } from "./tipsQuery";

export function useTipsQuery(enabled = true) {
  return useQuery({
    queryKey: ["tips"],
    queryFn: fetchTipsQuery,
    enabled,
  });
}

