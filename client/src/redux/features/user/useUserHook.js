import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { 
  loginUser, 
  signupUser, 
  initAuth, 
  forgotPassword, 
  resetPassword, 
  logout, 
  clearError 
} from './userSlice'; 

const useUser = () => {
  const dispatch = useDispatch();
  
  // Get all user state values
  const {
    user,
    isLoading,
    error,
    isAuthenticated
  } = useSelector(state => state.user);

  // Wrap all actions with useCallback for performance optimization
  const login = useCallback((credentials) => {
    return dispatch(loginUser(credentials));
  }, [dispatch]);

  const signup = useCallback((userData) => {
    return dispatch(signupUser(userData));
  }, [dispatch]);

  const initializeAuth = useCallback(() => {
    return dispatch(initAuth());
  }, [dispatch]);

  const sendForgotPasswordEmail = useCallback((email) => {
    return dispatch(forgotPassword(email));
  }, [dispatch]);

  const resetUserPassword = useCallback((resetData) => {
    return dispatch(resetPassword(resetData));
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const clearUserError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Return all state and actions
  return {
    // State
    user,
    isLoading,
    error,
    isAuthenticated,
    
    // Actions
    login,
    signup,
    initializeAuth,
    sendForgotPasswordEmail,
    resetUserPassword,
    logoutUser,
    clearUserError,
    
    // Computed values (optional - add more as needed)
    isLoggedIn: isAuthenticated && user !== null,
    isAdmin: user?.role === 'admin',
    name: user?.name ||  '',
    email: user?.email || '',
    id: user?.id || user?._id || null,
  };
};

export default useUser;