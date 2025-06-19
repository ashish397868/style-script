import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

// ProtectedRoute component that checks both authentication and role
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isAuthenticated, user } = useUserStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated, but save the attempted path
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    // Redirect to home if admin access is required but user is not admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
