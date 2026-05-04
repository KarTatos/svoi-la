import { useQuery } from "@tanstack/react-query";
import { fetchHousingQuery } from "./housingQuery";

export function useHousingQuery(enabled = true) {
  return useQuery({
    queryKey: ["housing"],
    queryFn: fetchHousingQuery,
    enabled,
  });
}

