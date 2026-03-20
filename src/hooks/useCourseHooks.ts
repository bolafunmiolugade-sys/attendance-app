import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axioInstance';

export const useGetCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await axiosInstance.get('/courses');
      return response.data;
    },
  });
};

export const useGetCourse = (id: string | number) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/courses/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useGetCourseByCode = (courseCode: string) => {
  return useQuery({
    queryKey: ['course-by-code', courseCode],
    queryFn: async () => {
      const response = await axiosInstance.get(`/courses/code/${courseCode}`);
      return response.data;
    },
    enabled: !!courseCode,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/courses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: any }) => {
      const response = await axiosInstance.put(`/courses/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await axiosInstance.delete(`/courses/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useGetCourseMembers = (id: string | number) => {
  return useQuery({
    queryKey: ['course-members', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/courses/${id}/members`);
      return response.data;
    },
    enabled: !!id,
  });
};
