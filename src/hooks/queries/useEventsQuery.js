import { useQuery } from "@tanstack/react-query";
import { fetchEventsQuery } from "./eventsQuery";

export function useEventsQuery(enabled = true) {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEventsQuery,
    enabled,
  });
}

