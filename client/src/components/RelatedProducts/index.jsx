import { useEffect, useState } from "react";
import { useProductStore } from "../../store/productStore";
import { useNavigate, Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle, FiShoppingBag, FiStar, FiTruck } from "react-icons/fi";
import { BeatLoader } from "react-spinners";

  const { products, fetchProducts, loading: productsLoading } = useProductStore();
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function getRelated() {
      setLoading(true);
      try {
        let allProducts = products;
        if (!products || products.length === 0) {
          // fetch if not loaded
          const res = await fetchProducts();
          allProducts = Array.isArray(res) ? res : res.products || [];
        }
        let filtered = allProducts;
        if (category) filtered = filtered.filter(p => p.category === category);
        if (tag) filtered = filtered.filter(p => p.tags && p.tags.includes(tag));
        if (excludeId) filtered = filtered.filter(p => p._id !== excludeId);
        setRelated(filtered.slice(0, 4));
        setError(null);
      } catch (err) {
        setError("Failed to load related products.");
      } finally {
        setLoading(false);
      }
    }
    getRelated();
    // eslint-disable-next-line
  }, [category, tag, excludeId, products]);

  if (error) return <div className="text-red-500 text-center py-6">{error}</div>;
  if (!related.length && !loading) return null;

  return (
    <section className="mt-16 max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900">You May Also Like</h3>
        <button 
          onClick={() => navigate('/products')}
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
        >
          View All <FiArrowRight className="ml-1" />
        </button>
      </div>
      
      {loading || productsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
              <div className="bg-gray-200 w-full h-48" />
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {related.map(product => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer group"
              onClick={() => navigate(`/product/${product.slug}`)}
            >
              <div className="relative">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                  <img
                    src={product.images && product.images[0] ? product.images[0] : "/placeholder-image.jpg"}
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
                  NEW
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={i < 4 ? "w-4 h-4 fill-current" : "w-4 h-4 text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-xs ml-1">(24)</span>
                </div>
                
                <h4 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {product.title}
                </h4>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2 h-10">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-gray-500 text-sm line-through">₹{product.originalPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
export default RelatedProducts;