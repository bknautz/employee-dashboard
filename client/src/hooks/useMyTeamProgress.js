import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export function useMyTeamProgress() {
  return useQuery({
    queryKey: ['teams', 'mine', 'progress'],
    queryFn: async () => {
      const res = await axiosClient.get('/teams/mine/progress');
      return res.data;
    },
  });
}
