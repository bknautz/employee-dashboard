import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await axiosClient.get('/teams');
      return res.data.results;
    },
  });
}
