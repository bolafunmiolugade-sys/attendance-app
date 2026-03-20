import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '../services/axioInstance';

export const useMarkAttendance = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/mark-attendance', data);
      return response.data;
    },
  });
};

export const useGetStudentAttendanceHistory = () => {
  return useQuery({
    queryKey: ['student-attendance-history'],
    queryFn: async () => {
      const response = await axiosInstance.get('/student/attendance-history');
      return response.data;
    },
  });
};
