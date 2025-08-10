import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { 
  loginUser, 
  signupUser, 
  initAuth, 
  forgotPassword, 
  resetPassword, 
  logout, 
  clearError ,
  fetchProfile,
  updateProfile,
  changePassword,
  setUser
} from './userSlice'; 

const useUser = () => {
  const dispatch = useDispatch();
  
  // Get all user state values
  const {
    user,
    authLoading,
    passwordLoading,
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
    return dispatch(initAuth()).unwrap().catch(error => {
      // Silently handle rejection - we just need to know when it's done
      console.log('Auth initialization completed with error:', error);
      return null;
    });
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

  const fetchUserProfile = useCallback(() => {
    return dispatch(fetchProfile());
  }, [dispatch]);

  const updateUserProfile = useCallback((data) => {
    return dispatch(updateProfile(data));
  }, [dispatch]);

  const changeUserPassword = useCallback((data) => {
    return dispatch(changePassword(data));
  }, [dispatch]);

  const setUserState = useCallback((userData) => {
  dispatch(setUser(userData));
}, [dispatch]);

  // Return all state and actions
  return {
    // State
    user,
    authLoading,
    passwordLoading,
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
    fetchUserProfile,
    updateUserProfile,
    changeUserPassword,
    setUserState,

    // Computed values (optional - add more as needed)
    isLoggedIn: isAuthenticated && user !== null,
    isAdmin: user?.role === 'admin',
    name: user?.name ||  '',
    email: user?.email || '',
    id: user?.id || user?._id || null,
  };
};

export default useUser;


/*
  Why use unwrap() here?

  - Normally, dispatch(someThunk()) returns a Promise that ALWAYS resolves,
    even if the thunk was rejected. This means .catch() will NOT run for errors.
  
  - unwrap() changes this behavior:
      ✔ If thunk is fulfilled → returns the actual data (resolved value).
      ✔ If thunk is rejected → throws an error (rejected Promise), so .catch() will run.
  
  - This is useful when you want try/catch or .then/.catch to handle API errors directly.
  
  Example:
    dispatch(loginUser(credentials))
      .unwrap()
      .then(data => console.log("Success:", data))
      .catch(err => console.log("Error:", err));
*/
