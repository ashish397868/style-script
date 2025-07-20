import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const OptimizedLazyImage = React.memo(({ 
  src, 
  alt, 
  className, 
  index = 0, 
  fetchPriority = "auto",
  loading = "lazy",
  path = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  // Intersection Observer for smooth scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Custom animation styles
  const animationStyle = {
    animationDelay: `${index * 100}ms`,
    animationFillMode: 'both'
  };

  if (hasError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center rounded-lg`}>
        <div className="text-center p-4">
          <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
          <span className="text-gray-500 text-sm">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`cursor-pointer relative overflow-hidden rounded-lg group transform transition-all duration-500 ease-out ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      } ${className}`}
      style={animationStyle}
    >
      {/* Loading placeholder with shimmer effect */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse"></div>
        </div>
      )}
      
      {/* Main image */}
      <Link to={path} className="block w-full h-full">
        <img
          src={src}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-contain rounded-lg transition-all duration-500 ease-out transform group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </Link>
      
      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 ease-out rounded-lg pointer-events-none"></div>
      
      {/* Optional: Add a subtle border highlight on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 rounded-lg transition-all duration-300 ease-out pointer-events-none"></div>
    </div>
  );
});

OptimizedLazyImage.displayName = 'OptimizedLazyImage';

export default OptimizedLazyImage;