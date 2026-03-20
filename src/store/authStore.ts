import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { User } from "../types";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (userData: User, tokenStr: string) => void;
  logout: () => void;
  register: (userData: User, tokenStr: string) => void;
  hydrated: boolean;
  setHydrated: (val: boolean) => void;
}

// In-memory store fallback for when native storage is unavailable
const memoryStore: Record<string, string> = {};

// Custom safe storage wrapper to prevent "Native module is null" errors
const safeStorage = {
  getItem: async (name: string) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (e) {
      console.warn("AsyncStorage not available, using memory fallback for:", name);
      return memoryStore[name] || null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (e) {
      console.warn("AsyncStorage.setItem failed, caching in memory for:", name);
      memoryStore[name] = value;
    }
  },
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (e) {
      delete memoryStore[name];
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: (userData: User, tokenStr: string) => {
        // Ensure id is set for backward compatibility
        const normalizedUser = {
          ...userData,
          id: userData.id ?? userData.user_id ?? userData.lecturer_id ?? userData.email ?? "unknown",
        };
        set({ user: normalizedUser, token: tokenStr, isAuthenticated: true });
      },

      register: (userData: User, tokenStr: string) => {
        const normalizedUser = {
          ...userData,
          id: userData.id ?? userData.user_id ?? userData.lecturer_id ?? userData.email ?? "unknown",
        };
        set({ user: normalizedUser, token: tokenStr, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      hydrated: false,
      setHydrated: (val: boolean) => set({ hydrated: val }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => safeStorage),
      onRehydrateStorage: (state) => {
        console.log('Rehydration started...');
        return (state, error) => {
          if (error) {
            console.error('Error during rehydration:', error);
            state?.setHydrated(true); // Still set hydrated so app can boot
          } else {
            console.log('Rehydration finished successfully');
            state?.setHydrated(true);
          }
        };
      },
    },
  ),
);
