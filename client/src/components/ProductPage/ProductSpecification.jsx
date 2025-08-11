// src/components/ProductSpecifications.jsx
import React from "react";

const ProductSpecifications = ({ specs }) => {
  if (!specs || specs.length === 0) return null;
  const specsArray = Object.entries(specs); 

  console.log("Rendering ProductSpecifications with specs:", specsArray);

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-pink-600 flex items-center">
          <svg 
            className="w-5 h-5 mr-2 text-pink-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          Technical Specifications
        </h3>
      </div>
      
      {/* Specifications List */}
      <div className="divide-y divide-gray-100">
        {specsArray.map((spec, index) => (
          <div 
            key={index} 
            className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <dt className="text-sm font-medium text-gray-900 capitalize">
                {spec[0].replace(/([A-Z])/g, ' $1').trim()}
              </dt>
              <dd className="text-sm text-gray-700 font-mono bg-gray-100 px-3 py-1 rounded-md sm:text-right">
                {spec[1]}
              </dd>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 text-center">
        <p className="text-xs text-gray-500">
          All specifications are subject to manufacturer standards
        </p>
      </div>
    </div>
  );
};

export default ProductSpecifications;