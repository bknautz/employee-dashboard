import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ enrollmentId, progressPercent }) => {
      const res = await axiosClient.patch(`/enrollments/${enrollmentId}/progress`, {
        progressPercent,
      });
      return res.data.enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'me'] });
    },
  });
}
