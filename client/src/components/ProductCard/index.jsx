import { useNavigate } from "react-router-dom";

const sizeList = ["S", "M", "L", "XL", "XXL"];
const colorMap = [
  { name: "Red", className: "bg-red-700" },
  { name: "Black", className: "bg-black" },
  { name: "Maroon", className: "bg-red-900" },
  { name: "Blue", className: "bg-blue-700" },
  { name: "Purple", className: "bg-purple-950" },
  { name: "Forest Green", className: "bg-green-700" },
  { name: "Sea Green", className: "bg-teal-400" },
  { name: "Green", className: "bg-green-800" },
];

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="lg:w-1/5 md:w-1/4 p-4 w-full cursor-pointer shadow-lg m-4 hover:shadow-xl transition-shadow duration-300 ease-in-out hover:shadow-rose-200"
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
          {product.title}
        </h2>
        <p className="mt-1 font-semibold">₹{product.price}</p>
        <p className="text-gray-600 text-xs mb-1">{product.description}</p>
        <div className="mt-1">
          {sizeList.map(
            (size) =>
              product.size && product.size.includes(size) && (
                <span
                  key={size}
                  className="border border-gray-300 mx-1 px-1 text-xs"
                >
                  {size}
                </span>
              )
          )}
        </div>
        <div className="mt-1 flex flex-wrap">
          {colorMap.map(
            (color) =>
              product.color && product.color.includes(color.name) && (
                <span
                  key={color.name}
                  className={`border-2 border-gray-300 ml-1 ${color.className} rounded-full w-5 h-5 inline-block`}
                  title={color.name}
                ></span>
              )
          )}
        </div>
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