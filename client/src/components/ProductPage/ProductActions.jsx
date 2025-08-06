// ProductActions.jsx
function ProductActions({ product, color, size, variants, onAddToCart, onBuyNow }) {
  // Helper function to check variant availability
  const isVariantAvailable = (selectedColor, selectedSize) => {
    return variants.some(v => 
      v.color === selectedColor && 
      v.size === selectedSize && 
      v.availableQty > 0
    );
  };

  const currentSelectionAvailable = color && size ? isVariantAvailable(color, size) : false;
  
  return (
    <div className="mb-8">
      <div className="flex items-center mb-6">
        <span className="text-3xl font-bold text-gray-900">₹{product.basePrice.toLocaleString()}</span>
        {product.originalPrice && (
          <>
            <span className="ml-3 text-xl text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
            <span className="ml-3 bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </span>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          disabled={!currentSelectionAvailable || !color || !size}
          onClick={onAddToCart}
          className="flex-1 min-w-[140px] bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!color || !size ? 'Select Options' : !currentSelectionAvailable ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button
          disabled={!currentSelectionAvailable || !color || !size}
          onClick={onBuyNow}
          className="flex-1 min-w-[140px] bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!color || !size ? 'Select Options' : !currentSelectionAvailable ? 'Out of Stock' : 'Buy Now'}
        </button>
      </div>
    </div>
  );
}

export default ProductActions;