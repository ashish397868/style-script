import { useNavigate } from "react-router-dom";
import colorMap from "../../constants/colorMap";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const variantList = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants: [product];

  const availableVariants = variantList
  // If no variants are available, don't render the card
  if (!availableVariants || availableVariants.length === 0) {
    return null;
  }

  // Get unique colors and sizes from available variants only
  const uniqueColors = [...new Set(availableVariants.map(v => v.color).filter(Boolean))];
  
  // Sort sizes in standard order: XS, S, M, L, XL, XXL, etc.
  const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];

  const sizes = [...new Set(availableVariants.map(v => v.size).filter(Boolean))];

  // bas sizeOrder ke hisaab se sort kar do
  const uniqueSizes = sizes.sort(
    (a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)
  );

  // Calculate total available quantity across all variants
  const totalAvailableQty = availableVariants.reduce((total, variant) => total + variant.availableQty, 0);

  // Use the first available variant for display data
  const displayVariant = availableVariants[0];

  return (
    <div
      onClick={handleCardClick}
      className="lg:w-1/5 md:w-1/4 p-4 w-full cursor-pointer shadow-lg m-4 hover:shadow-xl transition-shadow duration-300 ease-in-out hover:shadow-rose-200 flex flex-col"
    >
      <div className="block relative rounded overflow-hidden bg-white">
        <img
          alt={displayVariant.title}
          className="block m-auto max-h-56 object-contain"
          src={displayVariant.images && displayVariant.images.length > 0 ? displayVariant.images[0] : "/placeholder-image.jpg"}
        />
      </div>

      <div className="mt-4 text-center md:text-left">
        <h3 className="text-gray-500 text-xs tracking-widest title-font mb-1 capitalize">
          {displayVariant.category} {displayVariant.brand && `| ${displayVariant.brand}`}
        </h3>
        <h2 className="text-gray-900 title-font text-lg font-medium">
          {displayVariant.title.substring(0, 45)}...
        </h2>
        <p className="mt-1 font-semibold">₹{displayVariant.price}</p>
        <p className="text-gray-600 text-xs mb-1">{displayVariant.description.substring(0, 100)}...</p>

        {/* Color swatches - only show available colors */}
        {uniqueColors.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 items-center">
            <span className="text-xs text-gray-600 mr-1">Colors:</span>
            {uniqueColors.map((color) => {
              const colorObj = colorMap.find(c => c.name.toLowerCase() === color.toLowerCase());
              return (
                <span
                  key={color}
                  className={`inline-block w-5 h-5 rounded-full border border-gray-300 mr-1 ${colorObj ? colorObj.className : ''}`}
                  title={color}
                >
                  {!colorObj && (
                    <span className="text-xs text-gray-700 flex items-center justify-center h-full">
                      {color[0].toUpperCase()}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Size chips - only show available sizes */}
        {uniqueSizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 items-center">
            <span className="text-xs text-gray-600 mr-1">Sizes:</span>
            {uniqueSizes.map(size => (
              <span
                key={size}
                className="border border-gray-300 px-2 py-0.5 text-xs rounded bg-gray-50"
              >
                {size}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2">
          <span className="text-green-600 font-medium">
            In Stock ({totalAvailableQty} {availableVariants.length > 1 ? 'total' : 'available'})
          </span>
          {availableVariants.length > 1 && (
            <span className="text-gray-500 text-xs block">
              {availableVariants.length} variants available
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;