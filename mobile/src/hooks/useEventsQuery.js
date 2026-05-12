import { useQuery } from "@tanstack/react-query";
import { fetchEvents, fetchEventAttendees } from "../lib/events";
import { isSupabaseConfigured } from "../lib/supabase";

export function useEventsQuery() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    enabled: isSupabaseConfigured,
    staleTime: 2 * 60 * 1000,
  });
}

export function useEventAttendeesQuery(eventId) {
  return useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: () => fetchEventAttendees(eventId),
    enabled: Boolean(eventId) && isSupabaseConfigured,
  });
}
