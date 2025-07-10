import { Navigate, useLocation } from "react-router-dom";
import AccessDenied from "../AccessDenied";
import useUserHook from "../../redux/features/user/useUserHook";
import Loader from "../../components/Loader";
import { useEffect, useState } from "react";

// ProtectedRoute component that checks both authentication and role
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isLoggedIn, isAdmin, isLoading, initializeAuth } = useUserHook();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Try to initialize auth if not already authenticated
    if (!isLoggedIn && !isLoading) {
      initializeAuth()
        .finally(() => {
          // Set checkingAuth to false after initialization attempt
          setCheckingAuth(false);
        });
    } else {
      setCheckingAuth(false);
    }
  }, [isLoggedIn, isLoading, initializeAuth]);

  // Show loading while checking authentication
  if (isLoading || checkingAuth) {
    return <Loader />;
  }

  if (!isLoggedIn) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Show Access Denied page if admin access is required but user is not admin
    return <AccessDenied />;
  }

  return children;
};

export default ProtectedRoute;