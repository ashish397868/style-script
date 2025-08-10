// components/UserDropdown.js
import { useState, useRef, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const UserDropdown = ({ user, userLinks = [], onLogout }) => {
  const [open, setOpen] = useState(false); // menu open/close
  const ref = useRef(null); // dropdown ka DOM reference

  // Click outside close logic
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) { //ref.current.contains(e.target) = check karna ki click tumhare dropdown/modal ke andar hua ya bahar.

        // console.log("ref", ref.current);//Ab ref.current dropdown ka actual DOM element ka reference hold karega.
        // console.log("target", e.target); //e.target = user ne kahan click kiya.
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* User avatar button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer flex items-center"
        style={{ borderRadius: "50%", background: "none" }}
        aria-label="User menu"
      >
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <FaUserCircle className="w-8 h-8 text-pink-600" />
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-50">
          {/* User Links */}
          {userLinks.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="block px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
