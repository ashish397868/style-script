// src/components/SizeSelect.jsx
import React from "react";

export default function SizeSelect({ sizes, value, onChange }) {
  return (
    <div className="relative inline-block">
      <select
        onChange={onChange}
        value={value}
        className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10"
      >
        {sizes.map((sz) => (
          <option key={sz} value={sz}>
            {sz}
          </option>
        ))}
      </select>
      <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </span>
    </div>
  );
}
