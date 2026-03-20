import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../services/axioInstance';

// ----- Student Auth Hooks -----
export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/register', data);
      return response.data;
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/login', data);
      return response.data;
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await axiosInstance.post('/users/forgot-password', data);
      return response.data;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/users/reset-password', data);
      return response.data;
    },
  });
};

// ----- Lecturer Auth Hooks -----
export const useLecturerRegister = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/lecturers/register', data);
      return response.data;
    },
  });
};

export const useLecturerLogin = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/lecturers/login', data);
      return response.data;
    },
  });
};

export const useLecturerForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await axiosInstance.post('/lecturers/forgot-password', data);
      return response.data;
    },
  });
};

export const useLecturerResetPassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/lecturers/reset-password', data);
      return response.data;
    },
  });
};

// ----- Admin Auth Hooks -----
export const useAdminLogin = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/admin/login', data);
      return response.data;
    },
  });
};
