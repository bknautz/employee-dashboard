import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export function useEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId) => {
      const res = await axiosClient.post('/enrollments', { course: courseId });
      return res.data.enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'me'] });
    },
  });
}
