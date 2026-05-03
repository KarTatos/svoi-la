import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addJob, updateJob, deleteJob } from "../../lib/supabase";
import { queryKeys } from "./queryKeys";

export function useJobMutations() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await addJob(payload);
      if (error) throw error;
      return data?.[0] || null;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data, error } = await updateJob(id, payload);
      if (error) throw error;
      return data?.[0] || null;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await deleteJob(id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
  });

  return {
    addJobMutation: addMutation,
    updateJobMutation: updateMutation,
    deleteJobMutation: deleteMutation,
  };
}
