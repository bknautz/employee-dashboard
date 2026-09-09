import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export function useDeleteLearningPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (learningPathId) => {
      await axiosClient.delete(`/learning-paths/${learningPathId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningPaths'] });
    },
  });
}
