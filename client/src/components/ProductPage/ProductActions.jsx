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

  const handleAddToCart = () => {
    if (!product || !color || !size) return;

    const selectedVariant = variants.find(
      (v) => v.color === color && v.size === size && v.availableQty > 0
    );

    if (!selectedVariant) {
      console.error("No variant found for", { color, size, variants });
      return;
    }

    console.log("Selected variant:", {
      color,
      size,
      price: selectedVariant.price,
      sku: selectedVariant.sku,
      availableQty: selectedVariant.availableQty
    });

    const key = `${product._id}-${size}-${color}`;
    // Ensure we have a valid price
    const variantPrice = selectedVariant.price || product.basePrice;
    
    onAddToCart(key, 1, {
      productId: product._id,
      price: variantPrice,
      name: product.title,
      image: selectedVariant.images?.[0] || product.images?.[0],
      sku: selectedVariant.sku,
      brand: product.brand,
      category: product.category,
      variantInfo: {
        size,
        color,
        price: variantPrice,
        sku: selectedVariant.sku,
        availableQty: selectedVariant.availableQty
      }
    });
  };

  const handleBuyNow = () => {
    if (!product || !color || !size) return;

    const selectedVariant = variants.find(
      (v) => v.color === color && v.size === size && v.availableQty > 0
    );

    if (!selectedVariant) return;

    const key = `${product._id}-${size}-${color}`;
    // Ensure we have a valid price
    const variantPrice = selectedVariant.price || product.basePrice;

    onBuyNow(key, 1, {
      productId: product._id,
      price: variantPrice,
      name: product.title,
      image: selectedVariant.images?.[0] || product.images?.[0],
      sku: selectedVariant.sku,
      brand: product.brand,
      category: product.category,
      variantInfo: {
        size,
        color,
        price: variantPrice,
        sku: selectedVariant.sku,
        availableQty: selectedVariant.availableQty
      }
    });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center mb-6">
        {color && size ? (
          <div className="flex items-center">
            {(() => {
              const selectedVariant = variants.find(v => v.color === color && v.size === size);
              const variantPrice = selectedVariant?.price;
              const maxPrice = product.maxPrice || 0;
              
              return (
                <>
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{variantPrice ? variantPrice.toLocaleString() : product.basePrice.toLocaleString()}
                  </span>
                  {maxPrice > (variantPrice || product.basePrice) && (
                    <>
                      <span className="ml-3 text-xl text-gray-500 line-through">₹{maxPrice.toLocaleString()}</span>
                      <span className="ml-3 bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                        {Math.round((1 - (variantPrice || product.basePrice) / maxPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          <div className="flex items-center">
            <span className="text-3xl font-bold text-gray-900">₹{product.basePrice.toLocaleString()}</span>
            {product.maxPrice > product.basePrice && (
              <span className="ml-3 text-sm text-gray-500">
                - ₹{product.maxPrice.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          disabled={!currentSelectionAvailable || !color || !size}
          onClick={handleAddToCart}
          className="flex-1 min-w-[140px] bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!color || !size ? 'Select Options' : !currentSelectionAvailable ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button
          disabled={!currentSelectionAvailable || !color || !size}
          onClick={handleBuyNow}
          className="flex-1 min-w-[140px] bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!color || !size ? 'Select Options' : !currentSelectionAvailable ? 'Out of Stock' : 'Buy Now'}
        </button>
      </div>
    </div>
  );
}

export default ProductActions;