// src/components/ColorButton.jsx
import React from "react";

const COLOR_CLASSES = {
  Red: "bg-red-700",
  Purple: "bg-purple-950",
  "Sea Green": "bg-teal-400",
  Black: "bg-black",
  "Forest Green": "bg-green-700",
  Blue: "bg-blue-700",
  Maroon: "bg-red-900",
  Green: "bg-green-800",
  White: "bg-white border border-gray-300",
};

export default function ColorButton({ color, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "border-2 ml-1 rounded-full w-6 h-6 focus:outline-none",
        isActive ? "border-black" : "border-gray-300",
        COLOR_CLASSES[color] || "",
      ].join(" ")}
    />
  );
}
