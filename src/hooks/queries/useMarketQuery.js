import { useQuery } from "@tanstack/react-query";
import { fetchMarketQuery } from "./marketQuery";
import { queryKeys } from "./queryKeys";

export function useMarketQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.market,
    queryFn: fetchMarketQuery,
    enabled,
  });
}
