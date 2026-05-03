import { useQuery } from "@tanstack/react-query";
import { fetchPlacesQuery } from "./placesQuery";

export function usePlacesQuery(enabled = true) {
  return useQuery({
    queryKey: ["places"],
    queryFn: fetchPlacesQuery,
    enabled,
  });
}

