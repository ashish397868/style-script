import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import useUserHook from '../../redux/features/user/useUserHook';
import useCartHook from '../../redux/features/cart/useCartHook';
import Dropdown from "../DropDown";
import UserDropdown from "../UserDropDown";
import CartButton from "../CartSidebar/CartButton";
import CartSidebar from "../CartSidebar";

const Navbar = ({
  shopLinks = [],
  tshirtItems = [],
  brandName = "FitnessStore",
  logo = null,
  backgroundColor = "bg-white",
  textColor = "text-white",
  hoverColor = "hover:text-gray-800",
  cartIconColor = "text-pink-600",
  cartIconHover = "hover:text-pink-700",
  userLinks = []
}) => {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    logoutUser,
    initializeAuth
  } = useUserHook();
  
  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line
  }, []);

  const {
    cart,
    subTotal,
    addItem,
    removeItem,
    clearItems
  } = useCartHook();

  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cartCount = Object.keys(cart).reduce((total, key) => total + cart[key].qty, 0);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <>
      <nav className={`${backgroundColor} shadow-lg w-full z-50 sticky top-0`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center py-4 px-2">
              {logo && <img src={logo} alt="Logo" className="h-8 w-8 mr-2 rounded " />}
              <span className={`font-bold text-lg text-pink-600 `}>{brandName}</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {shopLinks.map((item, index) => (
                <Link key={index} to={item.path} className={`py-4 px-2 ${textColor} ${hoverColor} font-semibold`}>
                  {item.label}
                </Link>
              ))}

              {isAuthenticated && user.role === "admin" && (
                <Link to="/admin" className={`py-4 px-2 ${textColor} ${hoverColor} font-semibold`}>
                  Admin
                </Link>
              )}

              <Dropdown label="Tshirts" items={tshirtItems} buttonClass={`${textColor} ${hoverColor} font-semibold `} itemClass={`${hoverColor}`} />

              {isAuthenticated ? (
                <UserDropdown user={user} userLinks={userLinks} onLogout={handleLogout} />
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
            </div>

            {/* Mobile controls */}
            <div className="md:hidden flex items-center space-x-2">
              {/* User dropdown for mobile */}
              {isAuthenticated ? (
                <UserDropdown user={user} userLinks={userLinks} />
              ) : (
                <div className="flex items-center space-x-1">
                  <Link to="/login" className="px-2 py-1 text-xs rounded bg-pink-600 text-white hover:bg-pink-700 font-medium transition duration-150 ease-in-out">
                    Login
                  </Link>
                  <Link to="/signup" className="px-2 py-1 text-xs rounded bg-pink-600 text-white hover:bg-pink-700 font-medium transition duration-150 ease-in-out">
                    Signup
                  </Link>
                </div>
              )}

              <CartButton count={cartCount} onClick={() => setSidebarOpen(true)} iconClass={`${cartIconColor} ${cartIconHover}`} />
              <button onClick={() => setMenuOpen(!menuOpen)} className={`p-2 rounded-full ${textColor} ${hoverColor}`}>
                <FiMenu className="text-2xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${menuOpen ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {shopLinks.map((item, index) => (
              <Link key={index} to={item.path} className={`block px-3 py-2 rounded-md text-base font-medium ${textColor} ${hoverColor}`} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}

            {/* Admin link for mobile */}
            {isAuthenticated && user.role === "admin" && (
              <Link to="/admin" className={`block px-3 py-2 rounded-md text-base font-medium ${textColor} ${hoverColor}`} onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            )}

            <Dropdown label="Products" items={tshirtItems} buttonClass={`w-full text-left px-3 py-2 text-base font-medium ${textColor} ${hoverColor}`} itemClass={`pl-6 px-3 py-2 text-base font-medium ${textColor} ${hoverColor}`} />
          </div>
        </div>
      </nav>

      <CartSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        cart={cart}
        addToCart={addItem}
        removeFromCart={removeItem}
        clearCart={clearItems}
        subTotal={subTotal}
      />
    </>
  );
};

export default Navbar;