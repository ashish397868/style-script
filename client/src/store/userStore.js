import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
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
      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Signup attempt with:', userData);
          const response = await authAPI.signup(userData);
          console.log('Signup response:', response.data);
          
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            set({ 
              user: response.data.user, 
              isLoading: false, 
              isAuthenticated: true, 
              error: null 
            });
          }
          
          return response.data;
        } catch (error) {
          console.error('Signup error:', error.response?.data || error.message);
          const errorMessage = error.response?.data?.message || 'Signup failed';
          set({ 
            error: errorMessage, 
            isLoading: false,
            isAuthenticated: false 
          });
          throw error;
        }
      },      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Forgot password attempt for:', email);
          const response = await authAPI.forgotPassword(email);
          console.log('Forgot password response:', response.data);
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          console.error('Forgot password error:', error.response?.data || error.message);
          const errorMessage = error.response?.data?.message || 'Failed to send reset email';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      resetPassword: async (resetData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Reset password attempt with:', resetData);
          const response = await authAPI.resetPassword(resetData);
          console.log('Reset password response:', response.data);
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          console.error('Reset password error:', error.response?.data || error.message);
          const errorMessage = error.response?.data?.message || 'Failed to reset password';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'user-storage',
      getStorage: () => localStorage,
    }
  )
);