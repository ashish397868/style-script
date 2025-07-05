import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
const Dropdown = ({ label, items, buttonClass = "", itemClass = "" }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className={`flex items-center ${buttonClass}`}>
        {label}
        <svg className={`w-4 h-4 ml-1 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute mt-2 w-40 bg-white shadow-md rounded z-50">
          {items.map((item, idx) => (
            <Link key={idx} to={item.path} className={`block px-4 py-2 ${itemClass}`} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;