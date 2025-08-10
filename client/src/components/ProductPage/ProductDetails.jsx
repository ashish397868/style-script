import { FaStar, FaTruck, FaShieldAlt, FaExchangeAlt, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import PincodeChecker from "../PincodeChecker";

export default function ProductDetails({ product, color, size }) {
  // Use product.averageRating instead of calculating from reviews
  const avgRating = product.averageRating ? Number(product.averageRating).toFixed(1) : 0;

  const descriptionPoints = product.description
    ?.split(".")
    .map((p) => p.trim())
    .filter(Boolean);

  const shippingInfo = [
    { icon: FaTruck, title: "Free Shipping", subtitle: "Over ₹999" },
    { icon: FaExchangeAlt, title: "Easy Returns", subtitle: "30 Days Policy" },
    { icon: FaShieldAlt, title: "Secure Payment", subtitle: "100% Secure" },
  ];

  const roundedRating = Math.round(avgRating * 2) / 2;

  return (
    <div className="mb-4">
      {/* Brand & Title */}
      <div className="mb-4">
        <h2 className="text-sm text-gray-500 tracking-widest uppercase mb-1">{product.brand || "Brand"}</h2>
        <h1 className="text-gray-900 text-2xl md:text-3xl font-bold">
          {product.title} {size && color ? `(${size}/${color})` : ""}
        </h1>
      </div>

      {/* Rating */}
      <div className="flex items-center mb-4">
        <div className="flex text-pink-400">
          {[...Array(5)].map((_, i) => {
            if (roundedRating >= i + 1) {
              return <FaStar key={i} className="w-4 h-4 fill-current" />;
            } else if (roundedRating >= i + 0.5) {
              return <FaStarHalfAlt key={i} className="w-4 h-4 fill-current" />;
            } else {
              return <FaRegStar key={i} className="w-4 h-4 text-gray-300" />;
            }
          })}
        </div>
        <span className="text-gray-600 ml-2 text-sm">({product.reviewCount ? product.reviewCount : 0} reviews)</span>
      </div>

      {/* Description */}
      {descriptionPoints?.length > 0 && (
        <div className="text-gray-700 mb-6 border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <ul className="list-disc pl-5 space-y-1">
            {descriptionPoints.map((point, idx) => (
              <li key={idx}>{point}.</li>
            ))}
          </ul>
        </div>
      )}

      {/* Shipping Info */}
      <div className="border border-gray-200 rounded-lg p-4 mb-8 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          {shippingInfo.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex flex-col items-center">
                <Icon className="w-6 h-6 text-pink-600 mb-2" />
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              </div>
            );
          })}
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

/**
 *  
  avgRating → maan lo 4.3 hai.
  Multiply by 2 → 4.3 * 2 = 8.6
  Round → Math.round(8.6) = 9
  Divide by 2 → 9 / 2 = 4.5
  Ab tumhare paas roundedRating hai jo 0.5 steps me rounded hai (4.0, 4.5, 5.0, etc.)

 * Calculate rounded rating to nearest 0.5
 * Example: 4.3 -> 4.5, 2.2 -> 2.0
 * i = index of current star (0 to 4)
 * Condition 1: FULL STAR if roundedRating >= i+1
 *   - Example: roundedRating = 4.5, i=2 -> 4.5 >= 3 ✅ full star
 *
 * Condition 2: HALF STAR if roundedRating >= i+0.5
 *   - Example: roundedRating = 4.5, i=4 -> 4.5 >= 4.5 ✅ half star
 *
 * Condition 3: EMPTY STAR otherwise
 */
