import React from "react";
import { motion } from "framer-motion";

const FeatureCard = React.memo(({ icon, title, description }) => {
  return (
    <motion.div
      className="relative bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer overflow-hidden"
      whileHover={{ 
        y: -8, 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
        // boxShadow syntax: "offset-x offset-y blur-radius spread-radius color"
        // Breakdown of each value:
        // 0     → Horizontal offset (x-axis): shadow bilkul center me hai, left ya right shift nahi hua
        // 25px  → Vertical offset (y-axis): shadow 25px neeche dikhega (saaya neeche ki taraf hoga)
        // 50px  → Blur radius: shadow kitna blur dikhega, jitna zyada value utna soft shadow
        // -12px → Spread radius: shadow thoda chhota kiya gaya hai (negative spread se shrink hota hai)
        // rgba(0, 0, 0, 0.25) → Shadow ka color: black color with 25% transparency

      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Icon Container */}
      <motion.div 
        className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full text-3xl"
        initial={{ backgroundColor: "#fdf2f8", color: "#db2777" }} // pink-100, pink-600
        whileHover={{ 
          scale: 1.1, 
          backgroundColor: "#fce7f3", // pink-200
          color: "#db2777" // pink-600
        }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>

      {/* Title */}
      <motion.h3 
        className="text-xl font-bold mb-3 text-center"
        initial={{ color: "#111827" }} // gray-900
        whileHover={{ color: "#ec4899" }} // pink-600
        transition={{ duration: 0.2 }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p 
        className="text-center"
        initial={{ color: "#4b5563" }} // gray-600
        whileHover={{ color: "#374151" }} // gray-700
        transition={{ duration: 0.2 }}
      >
        {description}
      </motion.p>

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 pointer-events-none"
        initial={{ x: "-100%" }}
        whileHover={{ 
          x: "100%", 
          opacity: 0.2 
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </motion.div>
  );
});

export default FeatureCard;