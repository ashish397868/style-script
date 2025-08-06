// src/pages/components/ProductGallery.jsx
import { useState } from "react";

export default function ProductGallery({ images }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div className="lg:w-1/2 w-full">
      <div className="sticky top-24">
        <div className="mb-4 rounded-lg overflow-hidden shadow-md bg-white p-4 flex items-center justify-center" 
          style={{ minHeight: 400, minWidth: 400, maxHeight: 400, maxWidth: 400 }}>
          <img 
            src={images?.[selectedImageIndex] || "/placeholder-image.jpg"} 
            alt="product-image"
            className="w-full h-full object-contain" 
            style={{ maxWidth: 400, maxHeight: 400, minWidth: 400, minHeight: 400, background: "#fff" }} 
          />
        </div>

        {/* Thumbnail Gallery */}
        <div className="flex space-x-3 overflow-x-auto py-2 px-1">
          {images?.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                selectedImageIndex === index 
                  ? "border-pink-600 scale-105" 
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}