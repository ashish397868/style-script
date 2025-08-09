import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { initAuth } from './userSlice';
import { userAPI } from '../../../services/api';

const useUserProfile = () => {
  const dispatch = useDispatch();
  const { user, authLoading, error } = useSelector(state => state.user);

  // Fetch user profile from backend
  const fetchProfile = useCallback(async () => {
    try {
      const res = await userAPI.getProfile();
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to fetch profile';
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      const res = await userAPI.updateProfile(profileData);
      // Optionally, re-init auth to update redux state
      await dispatch(initAuth());
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to update profile';
    }
  }, [dispatch]);

  // Change password
  const changePassword = useCallback(async (passwordData) => {
    try {
      const res = await userAPI.changePassword(passwordData);
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to change password';
    }
  }, []);

  return {
    user,
    authLoading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
  };
};

export default useUserProfile;