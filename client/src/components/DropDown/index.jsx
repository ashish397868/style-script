import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const Dropdown = ({ label, items, buttonClass = "", itemClass = "" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)){
        // console.log("ref", ref.current);
        // console.log("target", e.target);
        setOpen(false);
      }
    };
    document.addEventListener("click", closeOnOutsideClick);
    return () => document.removeEventListener("click", closeOnOutsideClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((prev) => !prev)} className={`cursor-pointer flex items-center ${buttonClass}`}>
        {label}
        <svg className={`w-4 h-4 ml-1 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute mt-2 w-40 bg-white shadow-md rounded z-50">
          {items.map(({ path, label }, idx) => (
            <Link key={idx} to={path} className={`block px-4 py-2 ${itemClass}`} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
