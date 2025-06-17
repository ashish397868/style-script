import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Login attempt with:', credentials);
          const response = await authAPI.login(credentials);
          console.log('Login response:', response.data);
          
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            set({ 
              user: response.data.user, 
              isLoading: false, 
              isAuthenticated: true, 
              error: null 
            });
            return response.data;
          } else {
            throw new Error('No token received from server');
          }
        } catch (error) {
          console.error('Login error:', error.response?.data || error.message);
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ 
            error: errorMessage, 
            isLoading: false,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
      },

      clearError: () => set({ error: null }),

      initAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await authAPI.getProfile();
            set({ 
              user: response.data, 
              isAuthenticated: true 
            });
          } catch (error) {
            console.error('Auth initialization error:', error);
            localStorage.removeItem('token');
            set({ 
              user: null, 
              isAuthenticated: false 
            });
          }
        }
      },
    }),
    {
      name: 'user-storage',
      getStorage: () => localStorage,
    }
  )
);