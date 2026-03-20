import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";
import { Alert } from "react-native";

const axiosInstance = axios.create({
  baseURL: "https://attendance-mgt-backend.onrender.com/api",
  timeout: 20000, // 20 seconds timeout for Render cold starts
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // withCredentials: true is removed as it can cause issues on Android and is not needed for Bearer auth
});

// Interceptor to add token to requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const state = useAuthStore.getState();
      const token = state?.token;

      // Note: If the app is extremely fresh, hydration might still be happening. 
      // Most screens wait for 'hydrated' flag in _layout.tsx, so this is generally safe.
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Axios Request Interceptor Error:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    // const message = (error.response?.data as any)?.message || error.message;

    // Handle session expiration (401)
    if (status === 401) {
      const logout = useAuthStore.getState().logout;
      if (logout) {
        // Only alert if we were previously logged in to avoid spamming on login screen
        if (useAuthStore.getState().isAuthenticated) {
          Alert.alert("Session Expired", "Please log in again.");
          logout();
        }
      }
    }

    // Network errors (no response)
    if (!error.response) {
      console.warn("Network Error:", error.message);
      // Usually, components will handle this via isError, but we log it for debugging
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
