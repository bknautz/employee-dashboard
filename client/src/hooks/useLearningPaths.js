import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export function useLearningPaths() {
  return useQuery({
    queryKey: ['learningPaths'],
    queryFn: async () => {
      const res = await axiosClient.get('/learning-paths');
      return res.data.results;
    },
  });
}
