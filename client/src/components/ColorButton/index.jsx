// src/components/ColorButton.jsx
import colorMap from "../../constants/colorMap";

export default function ColorButton({ color, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "border-2 ml-1 rounded-full w-6 h-6 focus:outline-none",
        isActive ? "border-black" : "border-gray-300",
        (colorMap.find(c => c.name.toLowerCase() === color?.toLowerCase())?.className || ""),
      ].join(" ")}
    />
  );
}
