import { useQuery } from "@tanstack/react-query";
import { fetchTips } from "../lib/tips";
import { isSupabaseConfigured } from "../lib/supabase";

export function useTipsQuery() {
  return useQuery({
    queryKey: ["tips"],
    queryFn: fetchTips,
    enabled: isSupabaseConfigured,
  });
}
