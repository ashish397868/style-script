// Updated Navbar.js using reusable SideCart, UserDropdown, and Dropdown components
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { useCartStore } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";

import Dropdown from "../DropDown";
import UserDropdown from "../UserDropDown";
import CartButton from "../CartSidebar/CartButton";
import CartSidebar from "../CartSidebar";

const Navbar = ({
  menuItems = [],
  productItems = [],
  brandName = "FitnessStore",
  logoSrc = null,
  backgroundColor = "bg-white",
  textColor = "text-white",
  hoverColor = "hover:text-gray-800",
  cartIconColor = "text-pink-600",
  cartIconHover = "hover:text-pink-700",
}) => {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, subTotal, clearCart } = useCartStore();
  const { user, logout, isAuthenticated } = useUserStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cartCount = Object.keys(cart).reduce((total, key) => total + cart[key].qty, 0);

  useEffect(() => {
    useCartStore.getState().loadCart();
  }, []);

  useEffect(() => {
    useCartStore.getState().saveCart();
  }, [cart]);

  useEffect(() => {
    useUserStore.getState().initAuth();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className={`${backgroundColor} shadow-lg w-full z-50`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center py-4 px-2">
              {logoSrc && <img src={logoSrc} alt="Logo" className="h-8 w-8 mr-2 rounded " />}
              <span className={`font-bold text-lg text-pink-600 `}>{brandName}</span>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              {menuItems.map((item, index) => (
                <Link key={index} to={item.href} className={`py-4 px-2 ${textColor} ${hoverColor} font-semibold`}>
                  {item.label}
                </Link>
              ))}

              <Dropdown label="Tshirts" items={productItems.map((item) => ({ ...item, component: Link }))} buttonClass={`${textColor} ${hoverColor} font-semibold `} itemClass={`${""} ${hoverColor}`} />

              {isAuthenticated ? (
                <UserDropdown
                  user={user}
                  actions={[
                    { label: "Profile", onClick: () => navigate("/profile") },
                    { label: "Orders", onClick: () => navigate("/orders") },
                    { label: "Addresses", onClick: () => navigate("/addresses") },
                    { label: "Logout", onClick: handleLogout }
                  ]}
                />
              ) : (
                <div className="flex items-center">
                  <Link to="/login" className="px-3 py-1 rounded bg-pink-600 text-white hover:bg-pink-700 font-medium transition duration-150 ease-in-out mx-2">
                    Login
                  </Link>
                  <Link to="/signup" className="px-3 py-1 rounded bg-pink-600 text-white hover:bg-pink-700 font-medium transition duration-150 ease-in-out">
                    Signup
                  </Link>
                </div>
              )}

              <CartButton count={cartCount} onClick={() => setSidebarOpen(true)} iconClass={`${cartIconColor} ${cartIconHover}`} />

              <button onClick={() => setMenuOpen(!menuOpen)} className={`md:hidden p-2 rounded-full ${textColor} ${hoverColor}`}>
                <FiMenu className="text-2xl" />
              </button>
            </div>
          </div>
        </div>

        <div className={`${menuOpen ? "block" : "hidden"} md:hidden`}>
          {" "}
          {/* Mobile Menu */}
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item, index) => (
              <Link key={index} to={item.href} className={`block px-3 py-2 rounded-md text-base font-medium ${textColor} ${hoverColor}`} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Dropdown
              label="Products"
              items={productItems.map((item) => ({ ...item, component: Link }))}
              buttonClass={`w-full text-left px-3 py-2 text-base font-medium ${textColor} ${hoverColor}`}
              itemClass={`pl-6 px-3 py-2 text-base font-medium ${textColor} ${hoverColor}`}
            />
          </div>
        </div>
      </nav>

      <CartSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} clearCart={clearCart} subTotal={subTotal} />
    </>
  );
};

export default Navbar;
