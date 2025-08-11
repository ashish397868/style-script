import { lazy } from "react";

// Auth
export const Login = lazy(() => import("../screens/Login"));
export const Signup = lazy(() => import("../screens/Signup"));
export const ForgotPassword = lazy(() => import("../screens/ForgotPassword"));
export const UserProfile = lazy(() => import("../screens/UserProfile"));

// Orders
export const Orders = lazy(() => import("../screens/Orders"));
export const OrderDetail = lazy(() => import("../screens/OrderDetail"));

// Addresses
export const AddressesBook = lazy(() => import("../screens/AddressesBook"));
export const EditAddressPage = lazy(() => import("../screens/EditAddressPage"));
export const NewAddressPage = lazy(() => import("../screens/NewAddressPage"));

// Categories & Products
export const CategoryPage = lazy(() => import("../screens/CategoryPage"));
export const ThemesPage = lazy(() => import("../screens/ThemePage"));
export const ProductPage = lazy(() => import("../screens/ProductPage"));
export const SearchPage = lazy(() => import("../screens/SearchPage"));


// Checkout
export const Success = lazy(() => import("../screens/Success"));
export const Checkout = lazy(() => import("../screens/Checkout/AddressSelection"));
export const ReviewOrder = lazy(() => import("../components/ReviewOrder"));
// export const Products = lazy(() => import("../components/Products"));

// Admin
export const AdminDashboard = lazy(() => import("../components/Admin/AdminDashboard"));
export const UserManagement = lazy(() => import("../components/Admin/UserManagement"));
export const ReviewManagement = lazy(() => import("../components/Admin/ReviewManagement"));
export const OrderManagement = lazy(() => import("../components/Admin/OrderManagement"));
export const AddProductPage = lazy(() => import("../components/Admin/AddProductPage"));
export const AdminProductList = lazy(() => import("../components/Admin/AdminProductList"));
export const EditProductPage = lazy(() => import("../components/Admin/EditProductPage"));

// Static
export const AboutUs = lazy(() => import("../screens/AboutUs"));
export const PrivacyPolicy = lazy(() => import("../screens/PrivacyPolicy"));
export const TermsAndConditions = lazy(() => import("../screens/TermsAndConditions"));
export const ContactUs = lazy(() => import("../screens/ContactUs"));
export const ShippingPolicy = lazy(() => import("../screens/ShippingPolicy"));
export const ReturnPolicy = lazy(() => import("../screens/ReturnPolicy"));
export const NotFound = lazy(() => import("../screens/NotFound"));

// Protected
export const ProtectedRoute = lazy(() => import("../screens/ProtectedRoute"));

// Accessory
export const AccessoryCategory = lazy(() => import("../screens/AccessoryCategory"));
export const AccessoryDetailPage = lazy(() => import("../screens/AccessoryDetailsPage"));
