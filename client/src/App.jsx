import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Navbar from "../src/screen/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "../src/components/HomePage";
import About from "../src/screen/About";
import Login from "../src/components/Login";
import Signup from "../src/components/Signup";
import Admin from "../src/components/Admin/AdminDashboard";
import AddProductPage from "../src/components/Admin/AddProductPage";
import ProtectedRoute from "../src/components/ProtectedRoute";
import ForgotPassword from "../src/components/ForgotPassword";
import Tshirts from "../src/components/Tshirts";
import ProductPage from "../src/components/ProductPage"
import Checkout from "../src/components/Checkout";
import ReviewOrder from "../src/components/ReviewOrder";
import Success from "../src/components/Success";
import UserManagement from "../src/components/Admin/UserManagement";  
import UserProfile from "./components/UserProfile";
import Footer from "../src/screen/Footer"

// import { useUserStore } from "./store/userStore";
import ReviewManagement from "./components/Admin/ReviewManagement";
import OrderManagement from "./components/Admin/OrderManagement";
import AdminProductList from "../src/components/Admin/AdminProductList";
import EditProductPage from "../src/components/Admin/EditProductPage";
import Products from "../src/components/Products";



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
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/tshirts" element={<Tshirts />} />
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
