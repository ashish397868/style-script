import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  AiOutlineShoppingCart, 
  AiOutlineClose,
  AiFillDelete,
  AiFillMinusCircle,
  AiFillPlusCircle
} from "react-icons/ai";
import { FiMenu } from "react-icons/fi";
import { BsFillBagCheckFill } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import { useCartStore } from "../../store/cartStore.js";
import { useUserStore } from "../../store/userStore";

const Navbar = ({
  menuItems = [],
  productItems = [],
  brandName = "FitnessStore",
  logoSrc = null,
  backgroundColor = "bg-white",
  textColor = "text-gray-600",
  hoverColor = "hover:text-gray-800",
  cartIconColor = "text-gray-700",
  cartIconHover = "hover:text-gray-900"
}) => {
  const navigate = useNavigate();
  // Zustand stores
  const { cart, addToCart, removeFromCart, subTotal, clearCart } = useCartStore();
  const { user, logout, isAuthenticated } = useUserStore();
  
  // Local state
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Add this inside the Navbar component, after the existing useEffect
  useEffect(() => {
    // Load cart from localStorage on component mount
    useCartStore.getState().loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    useCartStore.getState().saveCart();
  }, [cart]);

  // Initialize auth state when component mounts
  useEffect(() => {
    useUserStore.getState().initAuth();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Cart item count
  const cartCount = Object.keys(cart).reduce((total, key) => total + cart[key].qty, 0);

  return (
    <>
      {/* Main Navbar */}
      <nav className={`${backgroundColor} shadow-lg fixed w-full z-50`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center py-4 px-2">
                {logoSrc && <img src={logoSrc} alt="Logo" className="h-8 w-8 mr-2 rounded" />}
                <span className={`font-semibold text-lg ${textColor} ${hoverColor}`}>
                  {brandName}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {menuItems.map((item, index) => (
                <Link 
                  key={index} 
                  to={item.href}
                  className={`py-4 px-2 ${textColor} ${hoverColor} font-semibold`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Products Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center focus:outline-none font-semibold ${textColor} ${hoverColor}`}
                >
                  Products
                  <IoIosArrowDown className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute mt-1 w-40 bg-white shadow-lg rounded-lg z-50">
                    {productItems.map((item, index) => (
                      <Link 
                        key={index} 
                        to={item.href}
                        className={`block py-2 px-4 ${textColor} ${hoverColor}`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* User/Cart Controls */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className={`${textColor}`}>Welcome, {user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className={`${textColor} ${hoverColor}`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center">
                  <Link 
                    to="/login"
                    className={`px-3 py-1 rounded ${textColor} ${hoverColor} font-medium`}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup"
                    className={`ml-2 px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 font-medium`}
                  >
                    Signup
                  </Link>
                </div>
              )}
              
              {/* Cart Icon */}
              <button
                onClick={() => setSidebarOpen(true)}
                className={`relative p-2 rounded-full ${cartIconColor} ${cartIconHover}`}
              >
                <AiOutlineShoppingCart className="text-2xl" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`md:hidden p-2 rounded-full ${textColor} ${hoverColor}`}
              >
                <FiMenu className="text-2xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${menuOpen ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${textColor} ${hoverColor}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex justify-between items-center ${textColor} ${hoverColor}`}
              >
                Products
                <IoIosArrowDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div className="pl-4">
                  {productItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.href}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${textColor} ${hoverColor}`}
                      onClick={() => {
                        setMenuOpen(false);
                        setDropdownOpen(false);
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                      <button
                        type="button"
                        className="ml-3 h-7 flex items-center"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <AiOutlineClose className="h-6 w-6 text-gray-500" />
                      </button>
                    </div>

                    <div className="mt-8">
                      {Object.keys(cart).length === 0 ? (
                        <p className="text-center text-gray-500">Your cart is empty</p>
                      ) : (
                        <div className="flow-root">
                          <ul className="-my-6 divide-y divide-gray-200">
                            {Object.keys(cart).map((key) => (
                              <li key={key} className="py-6 flex">
                                <div className="ml-4 flex-1 flex flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>
                                        {cart[key].name} ({cart[key].size}/{cart[key].variant})
                                      </h3>
                                      <p className="ml-4">₹{cart[key].price * cart[key].qty}</p>
                                    </div>
                                  </div>
                                  <div className="flex-1 flex items-end justify-between text-sm">
                                    <div className="flex items-center">
                                      <button
                                        onClick={() => removeFromCart(key, 1)}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        <AiFillMinusCircle className="h-5 w-5" />
                                      </button>
                                      <span className="mx-2 text-gray-500">{cart[key].qty}</span>
                                      <button
                                        onClick={() => addToCart(key, 1)}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        <AiFillPlusCircle className="h-5 w-5" />
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => removeFromCart(key, cart[key].qty)}
                                      className="font-medium text-red-600 hover:text-red-500"
                                    >
                                      <AiFillDelete className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>₹{subTotal.toFixed(2)}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                    <div className="mt-6">
                      <Link
                        to="/checkout"
                        onClick={() => setSidebarOpen(false)}
                        className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                          Object.keys(cart).length === 0 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        <BsFillBagCheckFill className="mr-2" />
                        Checkout
                      </Link>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <button
                        disabled={Object.keys(cart).length === 0}
                        onClick={clearCart}
                        className={`text-sm font-medium flex items-center ${
                          Object.keys(cart).length === 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-600 hover:text-red-500'
                        }`}
                      >
                        <AiFillDelete className="mr-1" />
                        Clear Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;