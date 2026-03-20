import axios from "axios";
import { useAuthStore } from "../store/authStore";

const axiosInstance = axios.create({
  baseURL: "https://attendance-mgt-backend.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
});

// Interceptor to add token to requests
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = useAuthStore.getState()?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.log("Token error:", e);
  }

  return config;
});
export default axiosInstance;
