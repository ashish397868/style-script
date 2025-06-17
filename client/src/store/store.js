import { create } from 'zustand';
import { apiService } from '../services/api';

export const useUserStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.login(credentials);
      set({ user: response.data.user, isLoading: false });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.signup(userData);
      set({ user: response.data.user, isLoading: false });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Signup failed', isLoading: false });
      throw error;
    }
  },

  updateProfile: async (updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.updateProfile(updateData);
      set({ user: response.data.user, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Update failed', isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));