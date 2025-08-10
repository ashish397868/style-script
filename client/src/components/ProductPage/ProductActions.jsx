function ProductActions({ product, color, size, variants, onAddToCart, onBuyNow }) {
  // Find the variant matching current selection
  const selectedVariant = color && size ? variants.find((v) => v.color === color && v.size === size) : null;

  // Price helper fallback
  const getVariantPrice = () => selectedVariant?.price || product.basePrice;

  // const handleAddToCart = () => {
  //   if (!product || !selectedVariant) return;

  //   const key = `${product._id}-${size}-${color}`;
  //   const price = getVariantPrice();

  //   onAddToCart(key, 1, {
  //     productId: product._id,
  //     price,
  //     name: product.title,
  //     image: selectedVariant.images?.[0] || product.images?.[0],
  //     sku: selectedVariant.sku,
  //     brand: product.brand,
  //     category: product.category,
  //     variantInfo: {
  //       size,
  //       color,
  //       price,
  //       sku: selectedVariant.sku,
  //       availableQty: selectedVariant.availableQty,
  //     },
  //   });
  // };

  // const handleBuyNow = () => {
  //   if (!product || !selectedVariant) return;

  //   const key = `${product._id}-${size}-${color}`;
  //   const price = getVariantPrice();

  //   onBuyNow(key, 1, {
  //     productId: product._id,
  //     price,
  //     name: product.title,
  //     image: selectedVariant.images?.[0] || product.images?.[0],
  //     sku: selectedVariant.sku,
  //     brand: product.brand,
  //     category: product.category,
  //     variantInfo: {
  //       size,
  //       color,
  //       price,
  //       sku: selectedVariant.sku,
  //       availableQty: selectedVariant.availableQty,
  //     },
  //   });
  // };

  return (
    <div className="mb-8">
      <div className="flex items-center mb-6">
        <div className="flex items-center">
          {/* Original price (15% more) with strikethrough */}
          <span className="text-gray-500 text-xl line-through mr-3">₹{Math.round(getVariantPrice() * 1.15).toLocaleString()}</span>

          {/* Final discounted price */}
          <span className="text-3xl font-bold text-green-600">₹{getVariantPrice().toLocaleString()}</span>

          {/* Discount percentage */}
          <span className="ml-3 bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">15% OFF</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          disabled={!color || !size}
          onClick={onAddToCart}
          className="cursor-pointer flex-1 min-w-[140px] bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!color || !size ? "Select Options" : "Add to Cart"}
        </button>

        <button
          disabled={!color || !size}
          onClick={onBuyNow}
          className="cursor-pointer flex-1 min-w-[140px] bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!color || !size ? "Select Options" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

export default ProductActions;
