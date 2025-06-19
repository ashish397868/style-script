import { useEffect } from "react";
import "./App.css";
import Navbar from "../src/screen/Navbar";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "../src/screen/Home";
import About from "../src/screen/About";
import Login from "../src/components/Login";
import Signup from "../src/components/Signup";
import Admin from "../src/components/Admin";
import ProtectedRoute from "../src/components/ProtectedRoute";
import ForgotPassword from "../src/components/ForgotPassword";

import { useUserStore } from "./store/userStore";

function App() {
  const { initAuth } = useUserStore();

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
