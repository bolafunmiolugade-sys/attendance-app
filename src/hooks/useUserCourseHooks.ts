import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axioInstance';

export const useGetMyCourses = () => {
  return useQuery({
    queryKey: ['my-courses'],
    queryFn: async () => {
      const response = await axiosInstance.get('/my-courses');
      return response.data;
    },
  });
};

export const useRegisterCourses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // data should contain { courseIds: string[] } or similar depending on your backend
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/register-courses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
    },
  });
};
