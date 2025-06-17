import { useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./screen/Home";
import About from "./screen/About";
import Login from "./components/Login";
import Admin from "./components/Admin";
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
        <Route path="/admin" element={<Admin />} />
        {/* ... other routes */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
