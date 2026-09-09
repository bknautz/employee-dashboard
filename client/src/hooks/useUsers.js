import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosClient.get('/users');
      return res.data.results;
    },
  });
}
