import { Navigate, useLocation } from "react-router-dom";
import AccessDenied from "../AccessDenied";
import useUserHook from "../../redux/features/user/useUserHook";
import Loader from "../../components/Loader";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isLoggedIn, isAdmin, isLoading, initializeAuth } = useUserHook();
  const location = useLocation();
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      await initializeAuth(); // this should verify token/session etc.
      if (isMounted) setAuthInitialized(true);
    };
    checkAuth();
    return () => { isMounted = false };
  }, [initializeAuth]);

  // Wait until initialization finishes
  if (isLoading || !authInitialized) {
    return <Loader />;
  }

  // If not logged in, redirect
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin required but not admin
  if (requireAdmin && !isAdmin) {
    return <AccessDenied />;
  }

  return children;
};

export default ProtectedRoute;