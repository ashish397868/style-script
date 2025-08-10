// App.jsx
import { Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./components/HomePage";
import useUserHook from "./redux/features/user/useUserHook";
import Loader from "./components/Loader";

import {
  Login,
  Signup,
  ForgotPassword,
  UserProfile,
  Orders,
  OrderDetail,
  AddressesBook,
  EditAddressPage,
  NewAddressPage,
  CategoryPage,
  ThemesPage,
  ProductPage,
  Success,
  Checkout,
  ReviewOrder,
  // Products,
  AdminDashboard,
  UserManagement,
  ReviewManagement,
  OrderManagement,
  AddProductPage,
  AdminProductList,
  EditProductPage,
  AboutUs,
  PrivacyPolicy,
  TermsAndConditions,
  ContactUs,
  ShippingPolicy,
  ReturnPolicy,
  NotFound,
  ProtectedRoute,
  SearchPage,
} from "./routes/lazyImports";

import Navbar from "./screens/Navbar";
import Footer from "./screens/Footer";

function AppContent() {
  const location = useLocation(); // useLocation se current URL ka path milta hai.
  const { initializeAuth, logoutUser } = useUserHook();

  // Initialize authentication on app load
  useEffect(() => {
    const init = async () => {
      await initializeAuth();
    };

    init();
  }, [initializeAuth]);

  // Listen for authentication events
  useEffect(() => {
    const handleUnauthorized = () => {
      logoutUser();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logoutUser]);

  return (
    <>
      {/* Show navbar/footer only on non-admin pages */}
      {!location.pathname.startsWith("/admin") && (
        <Suspense fallback={<div className="h-16 bg-white shadow-lg w-full"></div>}>
          <Navbar />
        </Suspense>
      )}

      <Suspense
        fallback={
          <div style={{ textAlign: "center", margin: "2rem" }}>
            <Loader />
          </div>
        }
      >
        <Routes>
          {/* Eagerly‑loaded Home */}
          <Route path="/" element={<Home />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Static pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />

          {/* Products & categories */}
          {/* <Route path="/products" element={<Products />} /> */}
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/theme/:theme" element={<ThemesPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* User‑protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/review-order" element={<ReviewOrder />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/addresses" element={<AddressesBook />} />
            <Route path="/addresses/edit/:id" element={<EditAddressPage />} />
            <Route path="/addresses/new" element={<NewAddressPage />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/success/:id" element={<Success />} />
          </Route>

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
            <Route path="users" element={<UserManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="add-product" element={<AddProductPage />} />
            <Route path="all-products" element={<AdminProductList />} />
            <Route path="edit-product/:id" element={<EditProductPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {!location.pathname.startsWith("/admin") && (
        <Suspense fallback={<div className="h-16 bg-gray-100"></div>}>
          <Footer />
        </Suspense>
      )}
    </>
  );
}

export default function App() {
  return <AppContent />;
}
