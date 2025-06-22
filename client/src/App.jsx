import { useEffect } from "react";
import "./App.css";
import Navbar from "../src/screen/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "../src/screen/Home";
import About from "../src/screen/About";
import Login from "../src/components/Login";
import Signup from "../src/components/Signup";
import Admin from "../src/components/Admin/AdminDashboard";
import ProtectedRoute from "../src/components/ProtectedRoute";
import ForgotPassword from "../src/components/ForgotPassword";
import Tshirts from "../src/components/Tshirts";
import ProductPage from "../src/components/ProductPage"
import Checkout from "../src/components/Checkout";
import ReviewOrder from "../src/components/ReviewOrder";
import Success from "../src/components/Success";
import UserManagement from "../src/components/Admin/UserManagement";  
import UserProfile from "./components/UserProfile";

import { useUserStore } from "./store/userStore";
import ReviewManagement from "./components/Admin/ReviewManagement";
import OrderManagement from "./components/Admin/OrderManagement";
import AddEditProduct from "./components/Admin/AddEditProduct";

function App() {
  const { initAuth } = useUserStore();

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/products/t-shirts" element={<Tshirts />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/review-order" element={<ReviewOrder />} />
        <Route path="/success" element={<Success />} />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        }>
          <Route path="users" element={<UserManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="products" element={<AddEditProduct />} />

        </Route>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
        </>

  );
}

export default App;
