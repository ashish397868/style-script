import React from "react";

const FeatureCard = React.memo(({ icon, title, description }) => {
  return (
    <div className="relative bg-white rounded-xl p-6 shadow-sm border border-gray-100 group cursor-pointer overflow-hidden transform transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2">
      {/* Icon Container with smooth scaling animation */}
      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 text-3xl transform transition-all duration-300 ease-out group-hover:bg-pink-200 group-hover:scale-110">{icon}</div>

      {/* Title with subtle color transition */}
      <h3 className="text-xl font-bold text-gray-900 mb-3 text-center transition-colors duration-300 group-hover:text-pink-600">{title}</h3>

      {/* Description with color transition */}
      <p className="text-gray-600 text-center transition-colors duration-300 group-hover:text-gray-700">{description}</p>

      {/* Subtle shine effect using pseudo-element */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 -translate-x-full group-hover:translate-x-full group-hover:opacity-20 transition-all duration-700 ease-out pointer-events-none"></div>
    </div>
  );
});

FeatureCard.displayName = "FeatureCard";

export default FeatureCard;