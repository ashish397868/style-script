import { useState, useEffect, useRef, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiSearch } from "react-icons/fi";
import { BeatLoader } from "react-spinners";
import useUserHook from '../../redux/features/user/useUserHook';
import useCartHook from '../../redux/features/cart/useCartHook';
import Dropdown from "../DropDown";
import UserDropdown from "../UserDropDown";
import CartButton from "../CartSidebar/CartButton";
import CartSidebar from "../CartSidebar";
import SearchBar from "../SearchBar";

// ✅ Memoized Auth Components to prevent unnecessary re-renders
const AuthComponent = memo(({ isLoading, isAuthenticated, user, onLogout, userLinks }) => {
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="w-24 flex justify-center items-center py-2">
        <BeatLoader color="#C70039" size={8} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <UserDropdown user={user} userLinks={userLinks} onLogout={onLogout} />;
  }

  return (
    <div className="flex items-center">
      <Link to="/login" className="px-3 py-1 rounded bg-pink-600 text-white hover:bg-pink-700 font-medium mx-2">
        Login
      </Link>
      <Link to="/signup" className="px-3 py-1 rounded bg-pink-600 text-white hover:bg-pink-700 font-medium">
        Signup
      </Link>
    </div>
  );
});

const MobileAuthComponent = memo(({ isLoading, isAuthenticated, user, onLogout, userLinks }) => {
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="w-16 flex justify-center items-center py-1">
        <BeatLoader color="#C70039" size={6} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <UserDropdown user={user} userLinks={userLinks} onLogout={onLogout} />;
  }

  return (
    <div className="flex items-center space-x-1">
      <Link to="/login" className="px-2 py-1 text-xs rounded bg-pink-600 text-white hover:bg-pink-700 font-medium">
        Login
      </Link>
      <Link to="/signup" className="px-2 py-1 text-xs rounded bg-pink-600 text-white hover:bg-pink-700 font-medium">
        Signup
      </Link>
    </div>
  );
});

const Navbar = ({
  shopLinks = [],
  tshirtItems = [],
  brandName = "FitnessStore",
  logo = null,
  backgroundColor = "bg-white",
  textColor = "text-black",
  hoverColor = "hover:text-gray-800",
  cartIconColor = "text-pink-600",
  cartIconHover = "hover:text-pink-700",
  userLinks = []
}) => {

  const navigate = useNavigate();
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const { user, isAuthenticated, logoutUser, isLoading } = useUserHook();
  const { cart, subTotal, addItem, removeItem, clearItems, totalItems } = useCartHook();

  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(""); // ✅ Local search state

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if ( 
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    /*
      handleClickOutside:
      Yeh function check karta hai ki user ne kahin bahar click kiya hai ya nahi.
      - menuOpen: Sirf tab check karo jab menu open ho.
      - menuRef.current: Menu ka DOM element.
      - !menuRef.current.contains(event.target): Click menu ke andar nahi hua.
      - hamburgerRef.current: Hamburger button ka DOM element.
      - !hamburgerRef.current.contains(event.target): Click hamburger ke andar bhi nahi hua.
      Agar click dono ke bahar hua → menu ko close kar do.
      */

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logoutUser();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (mobileSearch.trim() === "") return;
    navigate(`/search/?query=${encodeURIComponent(mobileSearch)}`);
  };

  return (
    <>
      <nav className={`${backgroundColor} shadow-lg w-full z-50 sticky top-0`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo & Desktop Search */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center py-4 px-2">
                {logo && <img src={logo} alt="Logo" className="h-8 w-8 mr-2 rounded" />}
                <span className="font-bold text-lg text-pink-600">{brandName}</span>
              </Link>
              <div className="hidden md:block ml-4">
                <SearchBar />
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {shopLinks.map((item, index) => (
                <Link key={index} to={item.path} className={`py-4 px-2 ${textColor} ${hoverColor} font-semibold`}>
                  {item.label}
                </Link>
              ))}

              {isAuthenticated && user?.role === "admin" && (
                <Link to="/admin" className={`py-4 px-2 ${textColor} ${hoverColor} font-semibold`}>
                  Admin
                </Link>
              )}

              <Dropdown label="Tshirts" items={tshirtItems} buttonClass={`${textColor} ${hoverColor} font-semibold`} />

              {/* Authentication Links */}
              <AuthComponent {...{ isLoading, isAuthenticated, user, onLogout: handleLogout, userLinks }} />

              <CartButton count={totalItems} onClick={() => setSidebarOpen(true)} iconClass={`${cartIconColor} ${cartIconHover}`} />
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Authentication Links */}
              <MobileAuthComponent {...{ isLoading, isAuthenticated, user, onLogout: handleLogout, userLinks }} />
              <CartButton count={totalItems} onClick={() => setSidebarOpen(true)} iconClass={`${cartIconColor} ${cartIconHover}`} />
              <button ref={hamburgerRef} onClick={() => setMenuOpen(!menuOpen)} className={`p-2 rounded-full ${textColor} ${hoverColor}`}>
                <FiMenu className="text-2xl" />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden py-2 pb-3">
            <form className="flex w-full" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-gray-800"
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
              />
              <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded-r-md hover:bg-pink-700">
                <FiSearch />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        <div ref={menuRef} className={`${menuOpen ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {shopLinks.map((item, index) => (
              <Link key={index} to={item.path} className={`block px-3 py-2 rounded-md text-base font-medium ${textColor} ${hoverColor}`} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            {isAuthenticated && user?.role === "admin" && (
              <Link to="/admin" className={`block px-3 py-2 rounded-md text-base font-medium ${textColor} ${hoverColor}`} onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            )}
            <Dropdown label="Products" items={tshirtItems} buttonClass={`w-full text-left px-3 py-2 text-base font-medium ${textColor} ${hoverColor}`} />
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
