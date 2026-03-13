import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Role } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: Role) => void;
  logout: () => void;
  register: (user: Omit<User, 'id'>) => void;
}

// Temporary mock user data
const mockUsers: User[] = [
  { id: 'u1', role: 'LECTURER', name: 'Dr. Smith', email: 'smith@uni.edu' },
  { id: 'u2', role: 'STUDENT', name: 'John Doe', email: 'john@student.edu', matric_number: '123456' },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (email, role) => {
        // Find in mock DB or allow fresh login if not found (simulating DB creation on fly for testing)
        let foundUser = mockUsers.find((u) => u.email === email && u.role === role);
        if (!foundUser) {
           foundUser = {
              id: `u-${Date.now()}`,
              name: email.split('@')[0],
              email,
              role,
           }
        }
        set({ user: foundUser, isAuthenticated: true });
      },

      register: (newUser) => {
         const user = { ...newUser, id: `u-${Date.now()}` };
         set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
