import { useQuery } from "@tanstack/react-query";
import { fetchMarket } from "../lib/market";

export function useMarketQuery(enabled = true) {
  return useQuery({
    queryKey: ["market"],
    queryFn: fetchMarket,
    enabled,
  });
}
