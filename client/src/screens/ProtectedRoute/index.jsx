import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AccessDenied from '../AccessDenied';

// ProtectedRoute component that checks both authentication and role
const ProtectedRoute = ({ children, requireAdmin }) => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.user);

  const location = useLocation();


  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    // Show Access Denied page if admin access is required but user is not admin
    return <AccessDenied />;
  }

  return children;
};

export default ProtectedRoute;