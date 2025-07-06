import { Navigate, useLocation } from "react-router-dom";
import AccessDenied from "../AccessDenied";
import useUserHook from "../../redux/features/user/useUserHook";

// ProtectedRoute component that checks both authentication and role
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isLoggedIn, isAdmin } = useUserHook();
  const location = useLocation();

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