import { useNavigate } from "react-router-dom";
import colorMap from "../../constants/colorMap";

const ProductCard = ({ product, variants }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  // Use variants prop if provided, else fallback to product.variants or just product
  const variantList = Array.isArray(variants) && variants.length > 0
    ? variants
    : Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants
      : [product];

  // Only show variants with the same title and availableQty > 0
  const filteredVariants = variantList.filter(v => v.title === product.title && v.availableQty > 0);
  const uniqueColors = [...new Set(filteredVariants.map(v => v.color).filter(Boolean))];
  const uniqueSizes = [...new Set(filteredVariants.map(v => v.size).filter(Boolean))];

  return (
    <div
      onClick={handleCardClick}
      className="lg:w-1/5 md:w-1/4 p-4 w-full cursor-pointer shadow-lg m-4 hover:shadow-xl transition-shadow duration-300 ease-in-out hover:shadow-rose-200 flex flex-col"
    >
      <div className="block relative rounded overflow-hidden bg-white">
        <img
          alt={product.title}
          className="block m-auto max-h-56 object-contain"
          src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder-image.jpg"}
        />
      </div>

      <div className="mt-4 text-center md:text-left">
        <h3 className="text-gray-500 text-xs tracking-widest title-font mb-1">
          {product.category} {product.brand && `| ${product.brand}`}
        </h3>
        <h2 className="text-gray-900 title-font text-lg font-medium">
          {product.title.substring(0, 45)}...
        </h2>
        <p className="mt-1 font-semibold">₹{product.price}</p>
        <p className="text-gray-600 text-xs mb-1">{product.description.substring(0, 100)}...</p>

        {/* Color swatches */}
        {uniqueColors.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 items-center">
            {uniqueColors.map((color) => {
              const colorObj = colorMap.find(c => c.name.toLowerCase() === color.toLowerCase());
              return (
                <span
                  key={color}
                  className={`inline-block w-5 h-5 rounded-full border border-gray-300 mr-1 ${colorObj ? colorObj.className : ''}`}
                  title={color}
                >
                  {!colorObj && (
                    <span className="text-xs text-gray-700">{color[0]}</span>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Size chips */}
        {uniqueSizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 items-center">
            {uniqueSizes.map(size => (
              <span
                key={size}
                className="border border-gray-300 px-2 py-0.5 text-xs rounded"
              >
                {size}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2">
          {product.availableQty > 0 ? (
            <span className="text-green-600 font-medium">
              In Stock ({product.availableQty})
            </span>
          ) : (
            <span className="text-red-600 font-medium">Out of Stock</span>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductCard;