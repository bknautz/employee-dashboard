import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await axiosClient.get('/courses');
      return res.data.results;
    },
  });
}
