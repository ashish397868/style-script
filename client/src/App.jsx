// App.jsx
import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./screens/Navbar";
import Footer from "./screens/Footer";
import Home from "./components/HomePage";           // eagerly loaded

// Lazy‑load all other route components:
const Login               = lazy(() => import("./components/Login"));
const Signup              = lazy(() => import("./components/Signup"));
const ForgotPassword      = lazy(() => import("./components/ForgotPassword"));
const ProductPage         = lazy(() => import("./components/ProductPage"));
const Checkout            = lazy(() => import("./components/Checkout"));
const ReviewOrder         = lazy(() => import("./components/ReviewOrder"));
const Success             = lazy(() => import("./components/Success"));
const UserManagement      = lazy(() => import("./components/Admin/UserManagement"));
const ReviewManagement    = lazy(() => import("./components/Admin/ReviewManagement"));
const OrderManagement     = lazy(() => import("./components/Admin/OrderManagement"));
const AdminDashboard      = lazy(() => import("./components/Admin/AdminDashboard"));
const AddProductPage      = lazy(() => import("./components/Admin/AddProductPage"));
const AdminProductList    = lazy(() => import("./components/Admin/AdminProductList"));
const EditProductPage     = lazy(() => import("./components/Admin/EditProductPage"));
const Products            = lazy(() => import("./components/Products"));
const CategoryPage        = lazy(() => import("./components/CategoryPage"));
const UserProfile         = lazy(() => import("./components/UserProfile"));
const Orders              = lazy(() => import("./components/Orders"));
const OrderDetail         = lazy(() => import("./components/OrderDetail"));
const AddressesBook       = lazy(() => import("./components/AddressesBook"));
const EditAddressPage     = lazy(() => import("./components/EditAddressPage"));
const NewAddressPage      = lazy(() => import("./components/NewAddressPage"));

// Static pages
const AboutUs             = lazy(() => import("./screens/AboutUs"));
const PrivacyPolicy       = lazy(() => import("./screens/PrivacyPolicy"));
const TermsAndConditions  = lazy(() => import("./screens/TermsAndConditions"));
const ContactUs           = lazy(() => import("./screens/ContactUs"));
const ShippingPolicy      = lazy(() => import("./screens/ShippingPolicy"));
const ReturnPolicy        = lazy(() => import("./screens/ReturnPolicy"));
const NotFound            = lazy(() => import("./screens/NotFound"));
const ProtectedRoute      = lazy(() => import("./screens/ProtectedRoute"));

function AppContent() {
  const location = useLocation();

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
