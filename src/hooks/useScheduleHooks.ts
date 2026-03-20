import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axioInstance';

export const useGetSchedules = () => {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const response = await axiosInstance.get('/classes/schedules');
      return response.data;
    },
  });
};

export const useGetSchedule = (id: string | number) => {
  return useQuery({
    queryKey: ['schedule', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/classes/schedule/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};


export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/classes/schedule', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useUpdateAttendanceWindow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: any }) => {
      const response = await axiosInstance.patch(`/classes/schedule/${id}/attendance-window`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: any }) => {
      const response = await axiosInstance.put(`/classes/schedule/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await axiosInstance.delete(`/classes/schedule/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useGetScheduleAttendance = (id: string | number) => {
  return useQuery({
    queryKey: ['schedule-attendance', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/classes/schedule/${id}/attendance`);
      return response.data;
    },
    enabled: !!id,
  });
};


