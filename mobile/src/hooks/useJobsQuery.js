import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJobs, fetchJobById, createJob, updateJob, deleteJob } from "../lib/jobs";
import { isSupabaseConfigured } from "../lib/supabase";

export function useJobsQuery(type = null) {
  return useQuery({
    queryKey: ["jobs", type],
    queryFn: () => fetchJobs(type),
    enabled: isSupabaseConfigured,
    staleTime: 2 * 60 * 1000,
  });
}

export function useJobQuery(id) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => fetchJobById(id),
    enabled: Boolean(id) && isSupabaseConfigured,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fields }) => updateJob(id, fields),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["job", data.id] });
    },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
