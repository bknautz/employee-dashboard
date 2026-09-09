import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export function useMarkComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId) => {
      const res = await axiosClient.post(`/enrollments/${enrollmentId}/complete`);
      return res.data.enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'me'] });
    },
  });
}
