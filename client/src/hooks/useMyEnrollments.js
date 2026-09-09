import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export function useMyEnrollments() {
  return useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: async () => {
      const res = await axiosClient.get('/enrollments/me');
      return res.data.results;
    },
  });
}
