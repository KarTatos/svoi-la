import { useQuery } from "@tanstack/react-query";
import { fetchHousing } from "../lib/housing";

export function useHousingQuery(enabled = true) {
  return useQuery({
    queryKey: ["housing"],
    queryFn: fetchHousing,
    enabled,
  });
}
