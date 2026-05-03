import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPost, updatePost, deletePost } from "../../lib/supabase";

export function usePostMutations() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await addPost(payload);
      if (error) throw error;
      return data?.[0] || null;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data, error } = await updatePost(id, payload);
      if (error) throw error;
      return data?.[0] || null;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await deletePost(id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  return {
    addPostMutation: addMutation,
    updatePostMutation: updateMutation,
    deletePostMutation: deleteMutation,
  };
}
