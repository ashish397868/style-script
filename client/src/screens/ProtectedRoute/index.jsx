import { Navigate, useLocation, Outlet } from "react-router-dom";
import AccessDenied from "../AccessDenied";
import useUserHook from "../../redux/features/user/useUserHook";
import Loader from "../../components/Loader";

import { lazy } from "react";
const Navbar = lazy(() => import("../Navbar"));
const Footer = lazy(() => import("../Footer"));


const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isLoggedIn, isAdmin, authLoading } = useUserHook();
  const location = useLocation();

  if (authLoading) {
    return <Loader />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <>
      <Navbar />
      <AccessDenied />
      <Footer />
    </>;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;