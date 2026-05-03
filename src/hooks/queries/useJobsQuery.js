import { useQuery } from "@tanstack/react-query";
import { fetchJobsQuery } from "./jobsQuery";
import { queryKeys } from "./queryKeys";

export function useJobsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobs,
    queryFn: fetchJobsQuery,
    enabled,
  });
}
