import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Navbar from "../src/screen/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "../src/components/HomePage";
import Login from "../src/components/Login";
import Signup from "../src/components/Signup";
import Admin from "../src/components/Admin/AdminDashboard";
import AddProductPage from "../src/components/Admin/AddProductPage";
import ProtectedRoute from "../src/components/ProtectedRoute";
import ForgotPassword from "../src/components/ForgotPassword";
import ProductPage from "../src/components/ProductPage"
import Checkout from "../src/components/Checkout";
import ReviewOrder from "../src/components/ReviewOrder";
import Success from "../src/components/Success";
import UserManagement from "../src/components/Admin/UserManagement";  
import UserProfile from "./components/UserProfile";
import Footer from "../src/screen/Footer"
import Orders from "./components/Orders";
import OrderDetail from "./components/OrderDetail";

// import { useUserStore } from "./store/userStore";
import ReviewManagement from "./components/Admin/ReviewManagement";
import OrderManagement from "./components/Admin/OrderManagement";
import AdminProductList from "../src/components/Admin/AdminProductList";
import EditProductPage from "../src/components/Admin/EditProductPage";
import Products from "../src/components/Products";
import AddressesBook from "./components/AddressesBook";
import EditAddressPage from './components/EditAddressPage';
import NewAddressPage from './components/NewAddressPage';
import CategoryPage from "./components/CategoryPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsAndConditions from "./components/TermsAndConditions"; 
import ContactUs from "./components/ContactUs";
import ShippingPolicy from "./components/ShippingPolicy";
import ReturnPolicy from "./components/ReturnPolicy";
import AboutUs from "./components/AboutUs";


// import {useNavigate} from "react-router-dom";
function App() {
  // const navigate = useNavigate();
  // const { initAuth, user } = useUserStore();
  // const location = useLocation();

  // useEffect(() => {
  //   initAuth();
  // }, []);

  // useEffect(() => {
  //   if (user) {
  //     if (user.role === 'admin') {
  //       navigate("/admin", { replace: true });
  //     } else {
  //       navigate("/", { replace: true });
  //     }
  //   }
  //   // eslint-disable-next-line
  // }, [user]);

  return (
    <>
      {!location.pathname.startsWith('/admin') && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/products" element={<Products />} />
        {/* Removed hardcoded Tshirts route, use dynamic category route below */}
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/review-order" element={<ReviewOrder />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/addresses" element={<AddressesBook />} />
        <Route path="/addresses/edit/:id" element={<EditAddressPage />} />
        <Route path="/addresses/new" element={<NewAddressPage />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/success/:id" element={<Success />} />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        }>
          <Route path="users" element={<UserManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="add-product" element={<AddProductPage />} />
          <Route path="all-products" element={<AdminProductList />} />
          <Route path="edit-product/:id" element={<EditProductPage />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
      {!location.pathname.startsWith('/admin') && <Footer />}
    </>
  );
}

export default App;
