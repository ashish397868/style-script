// src/components/ImageZoom.jsx
import { useState, useRef } from "react";

const ImageZoom = ({ src, alt, className }) => {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const zoomFactor = 2.5;

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate mouse position relative to image
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentage positions (0-100)
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    setZoomPosition({ x: xPercent, y: yPercent });
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      ref={containerRef}
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      <img 
        src={src} 
        alt={alt} 
        className="w-full object-cover object-top rounded"
      />
      
      {/* Zoomed image overlay */}
      {showZoom && (
        <div className="hidden lg:block absolute top-0 left-full ml-4 w-[350px] h-[350px] border border-gray-300 bg-white rounded-lg overflow-hidden shadow-xl z-10">
          <div 
            className="w-full h-full bg-no-repeat"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: `${zoomFactor * 100}%`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageZoom;