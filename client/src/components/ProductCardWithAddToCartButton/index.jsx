import React from 'react';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ 
  product, 
  categories,
  onAddToCart,
  onNavigate
}) => {
  const navigate = useNavigate();
  const image = product.image || (Array.isArray(product.images) ? product.images[0] : null);
  const name = product.name || product.title || "Product";
  const description = product.description || "";
  const categoryLabel = categories.find((c) => c.id === (product.category?.toLowerCase() || product.category))?.name || product.category || "Fashion";
  const slug = product.slug;

  const handleCardClick = () => {
    if (slug) {
      onNavigate();
      navigate(`/product/${slug}`);
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" && slug) {
          handleCardClick();
        }
      }}
    >
      <div className="relative">
        {image ? (
          <img src={image} alt={name} className="w-full h-64 object-contain md:h-72 lg:h-80 rounded-t-xl transition-transform duration-300 hover:scale-105" />
        ) : (
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}

        {product.originalPrice && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-pink-600 text-sm font-medium mb-1">{categoryLabel}</div>
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-12">{description}</p>
        <div className="flex items-center mb-4">
          <div className="flex text-pink-400">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < (product.rating || 4) ? "w-4 h-4 fill-current" : "w-4 h-4 text-gray-300"} />
            ))}
          </div>
          <span className="text-gray-500 text-sm ml-1">({product.reviewCount || 24})</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-gray-900 text-xl">₹{product.price}</span>
            {product.originalPrice && <span className="ml-2 text-gray-500 text-sm line-through">₹{product.originalPrice}</span>}
          </div>
          <button
            className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-full flex items-center transition-colors"
            onClick={handleAddToCartClick}
            aria-label={`Add ${name} to cart`}
          >
            <FaShoppingCart className="mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;