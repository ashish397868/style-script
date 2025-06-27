// LazyLoadingImage.jsx
import { motion } from "framer-motion";
import { useState, useCallback } from "react";

const LazyMotionImg = ({ src, alt, className, index = 0 }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center rounded-lg`}>
        <span className="text-gray-500">Failed to load image</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ scale: 1.05 }}
      className="cursor-pointer relative"
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-lg" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} transition-opacity duration-300 rounded-lg ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </motion.div>
  );
};

export default LazyMotionImg;