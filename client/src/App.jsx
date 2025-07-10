// App.jsx
import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
// import Navbar from "./screens/Navbar";
// import Footer from "./screens/Footer";
import Home from "./components/HomePage";
import useUserHook from "./redux/features/user/useUserHook";
import Loader from "./components/Loader";
import { AUTH_EVENTS } from "./services/api";

const Navbar = lazy(() => import("./screens/Navbar")); // eagerly loaded
const Footer = lazy(() => import("./screens/Footer")); // eagerly loaded

// Lazy‑load all other route components:
// Authentication
const Login               = lazy(() => import("./screens/Login"));
const Signup              = lazy(() => import("./screens/Signup"));
const ForgotPassword      = lazy(() => import("./screens/ForgotPassword"));
const UserProfile         = lazy(() => import("./screens/UserProfile"));

// user orders
const Orders              = lazy(() => import("./screens/Orders"));
const OrderDetail         = lazy(() => import("./screens/OrderDetail"));

// address pages
const AddressesBook       = lazy(() => import("./screens/AddressesBook"));
const EditAddressPage     = lazy(() => import("./screens/EditAddressPage"));
const NewAddressPage      = lazy(() => import("./screens/NewAddressPage"));

// category and theme pages
const CategoryPage        = lazy(() => import("./screens/CategoryPage"));
const ThemesPage         = lazy(() => import("./screens/ThemePage"));

// product page
const ProductPage         = lazy(() => import("./screens/ProductPage"));

// Checkout and order review
const Success             = lazy(() => import("./screens/Success"));
const Checkout            = lazy(() => import("./screens/Checkout/AddressSelection"));


const ReviewOrder         = lazy(() => import("./components/ReviewOrder"));
const Products            = lazy(() => import("./components/Products"));

// Admin routes
const UserManagement      = lazy(() => import("./components/Admin/UserManagement"));
const ReviewManagement    = lazy(() => import("./components/Admin/ReviewManagement"));
const OrderManagement     = lazy(() => import("./components/Admin/OrderManagement"));
const AdminDashboard      = lazy(() => import("./components/Admin/AdminDashboard"));
const AddProductPage      = lazy(() => import("./components/Admin/AddProductPage"));
const AdminProductList    = lazy(() => import("./components/Admin/AdminProductList"));
const EditProductPage     = lazy(() => import("./components/Admin/EditProductPage"));

// Static pages
const AboutUs             = lazy(() => import("./screens/AboutUs"));
const PrivacyPolicy       = lazy(() => import("./screens/PrivacyPolicy"));
const TermsAndConditions  = lazy(() => import("./screens/TermsAndConditions"));
const ContactUs           = lazy(() => import("./screens/ContactUs"));
const ShippingPolicy      = lazy(() => import("./screens/ShippingPolicy"));
const ReturnPolicy        = lazy(() => import("./screens/ReturnPolicy"));
const NotFound            = lazy(() => import("./screens/NotFound"));

// Protected route wrapper
const ProtectedRoute      = lazy(() => import("./screens/ProtectedRoute"));

function AppContent() {
  const location = useLocation();
  const { initializeAuth, isLoading, logoutUser } = useUserHook();
  
  // Initialize authentication on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Listen for authentication events
  useEffect(() => {
    const handleUnauthorized = () => {
      logoutUser();
    };

    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized);
    
    return () => {
      window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized);
    };
  }, [logoutUser]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      {/* Show navbar/footer only on non-admin pages */}
      {!location.pathname.startsWith("/admin") && <Navbar />}

      <Suspense fallback={<div style={{ textAlign: "center", margin: "2rem" }}>Loading…</div>}>
        <Routes>
          {/* Eagerly‑loaded Home */}
          <Route path="/" element={<Home />} />

          {/* Public routes */}
          <Route path="/login"          element={<Login />} />
          <Route path="/signup"         element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Static pages */}
          <Route path="/about"                  element={<AboutUs />} />
          <Route path="/privacy-policy"         element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions"   element={<TermsAndConditions />} />
          <Route path="/contact"                element={<ContactUs />} />
          <Route path="/shipping-policy"        element={<ShippingPolicy />} />
          <Route path="/return-policy"          element={<ReturnPolicy />} />

          {/* Products & categories */}
          <Route path="/products"               element={<Products />} />
          <Route path="/category/:category"     element={<CategoryPage />} />
          <Route path="/theme/:theme"           element={<ThemesPage />} />
          <Route path="/product/:slug"          element={<ProductPage />} />

          {/* User‑protected */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review-order"
            element={
              <ProtectedRoute>
                <ReviewOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addresses"
            element={
              <ProtectedRoute>
                <AddressesBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addresses/edit/:id"
            element={
              <ProtectedRoute>
                <EditAddressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addresses/new"
            element={
              <ProtectedRoute>
                <NewAddressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/success/:id"
            element={
              <ProtectedRoute>
                <Success />
              </ProtectedRoute>
            }
          />

          {/* Admin (nested) */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={null /* your dashboard overview */} />
            <Route path="users"       element={<UserManagement />} />
            <Route path="reviews"     element={<ReviewManagement />} />
            <Route path="orders"      element={<OrderManagement />} />
            <Route path="add-product" element={<AddProductPage />} />
            <Route path="all-products" element={<AdminProductList />} />
            <Route path="edit-product/:id" element={<EditProductPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {!location.pathname.startsWith("/admin") && <Footer />}
    </>
  );
}

export default function App() {
  return (
    // <Router>
      <AppContent />
    // </Router>
  );
}
