import React, { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const OptimizedLazyImage = ({
  src,
  alt,
  className = "",
  index = 0,
  fetchPriority = "auto",
  loading = "lazy",
  path = ""
}) => {
  // Custom animation delay based on index
  const animationStyle = {
    animationDelay: `${index * 100}ms`,
    animationFillMode: "both"
  };

  return (
    <motion.div
      style={animationStyle}
      className={`cursor-pointer relative overflow-hidden rounded-lg ${className}`}
      initial={{ opacity: 0, y: 50 }} // pehle hidden
      whileInView={{ opacity: 1, y: 0 }} // jab viewport me aaye
      viewport={{ once: true, amount: 0.2 }} // ek hi baar trigger ho
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link to={path} className="block w-full h-full">
        <motion.img
          src={src}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
          className="w-full h-full object-contain rounded-lg transition-all duration-500 ease-out"
          whileHover={{ scale: 1.05 }} // hover par zoom
          transition={{ duration: 0.3 }}
        />
      </Link>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity duration-300 ease-out rounded-lg pointer-events-none"></div>
    </motion.div>
  );
};

// ✅ memo lagaya for optimization
export default memo(OptimizedLazyImage);