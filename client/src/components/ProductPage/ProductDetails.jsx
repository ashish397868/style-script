// src/pages/components/ProductDetails.jsx
import { FaStar } from "react-icons/fa";
import PincodeChecker from "../PincodeChecker";
import { FaTruck, FaShieldAlt, FaExchangeAlt } from "react-icons/fa";

export default function ProductDetails({ product, reviews, color, size, availableQty }) {
  // Calculate average rating
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="mb-4">
      <div className="mb-4">
        <h2 className="text-sm title-font text-gray-500 tracking-widest uppercase mb-1">{product.brand || "Brand"}</h2>
        <h1 className="text-gray-900 text-2xl md:text-3xl font-bold">
          {product.title} {size && color ? `(${size}/${color})` : ""}
        </h1>
      </div>

      {/* Rating */}
      <div className="flex items-center mb-4">
        <div className="flex text-pink-400">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={i < Math.round(avgRating) ? "w-4 h-4 fill-current" : "w-4 h-4 text-gray-300"} />
          ))}
        </div>
        <span className="text-gray-600 ml-2 text-sm">({reviews.length} reviews)</span>
        {/* <span className="mx-2 text-gray-300">•</span>
        {color && size ? (
          <span className={`text-sm font-medium ${availableQty > 0 ? "text-green-600" : "text-red-600"}`}>
            {availableQty > 0 ? (
              <>In Stock ({availableQty} available)</>
            ) : (
              "Out of Stock"
            )}
          </span>
        ) : (
          <span className="text-sm text-gray-600">Select color and size to check availability</span>
        )} */}
      </div>

      <div className="leading-relaxed text-gray-700 mb-6 border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <ul className="list-disc pl-5 space-y-1">
          {product.description
            ?.split(".") // split by dot
            .map((point) => point.trim()) // trim spaces
            .filter((point) => point.length > 0) // remove empty
            .map((point, idx) => (
              <li key={idx}>{point}.</li>
            ))}
        </ul>
      </div>

      {/* Shipping Info */}
      <div className="border border-gray-200 rounded-lg p-4 mb-8 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <FaTruck className="w-6 h-6 text-pink-600 mb-2" />
            <p className="text-sm font-medium">Free Shipping</p>
            <p className="text-xs text-gray-500">Over ₹999</p>
          </div>
          <div className="flex flex-col items-center">
            <FaExchangeAlt className="w-6 h-6 text-pink-600 mb-2" />
            <p className="text-sm font-medium">Easy Returns</p>
            <p className="text-xs text-gray-500">30 Days Policy</p>
          </div>
          <div className="flex flex-col items-center">
            <FaShieldAlt className="w-6 h-6 text-pink-600 mb-2" />
            <p className="text-sm font-medium">Secure Payment</p>
            <p className="text-xs text-gray-500">100% Secure</p>
          </div>
        </div>
      </div>

      {/* Pincode Checker */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Check Delivery</h3>
        <PincodeChecker />
      </div>
    </div>
  );
}
