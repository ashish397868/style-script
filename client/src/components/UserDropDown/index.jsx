// components/UserDropdown.js
import { useState, useRef, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const UserDropdown = ({ user, userLinks = [] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center focus:outline-none"
        style={{ borderRadius: '50%', padding: 0, border: 'none', background: 'none' }}
        aria-label="User menu"
      >
        {user && user.profilePicture ? (
          <img src={user.profilePicture} alt="Profile" className="w-8 h-8 rounded-full" />
        ) : (
          <FaUserCircle className="w-8 h-8 text-pink-600" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-50">
          {userLinks.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {/* Logout User on click make it a button*/}
          <div>
            <button
              onClick={() => {
                // Handle logout logic here
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>          
          </div>

        </div>
      )}
    </div>
  );
};

export default UserDropdown;  