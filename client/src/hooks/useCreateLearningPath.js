import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export function useCreateLearningPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (learningPathData) => {
      const res = await axiosClient.post('/learning-paths', learningPathData);
      return res.data.learningPath;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningPaths'] });
    },
  });
}
