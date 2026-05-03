import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMarketItem, updateMarketItem, deleteMarketItem } from "../../lib/supabase";
import { queryKeys } from "./queryKeys";

export function useMarketMutations() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await addMarketItem(payload);
      if (error) throw error;
      return data?.[0] || null;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.market }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data, error } = await updateMarketItem(id, payload);
      if (error) throw error;
      return data?.[0] || null;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.market }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await deleteMarketItem(id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.market }),
  });

  return {
    addMarketMutation: addMutation,
    updateMarketMutation: updateMutation,
    deleteMarketMutation: deleteMutation,
  };
}
