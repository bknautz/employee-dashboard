import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export function useAssignTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, teamId }) => {
      const res = await axiosClient.patch(`/users/${userId}`, { team: teamId });
      return res.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
