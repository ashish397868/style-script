import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../../redux/features/product/productSlice";
import { useNavigate } from "react-router-dom";
import ProductCard from "../ProductCard";
import { FiArrowRight } from "react-icons/fi";
import Loader from "../Loader";

// Related Products Component
function RelatedProducts({ excludeIds, categories = [] }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products);
  const productsLoading = useSelector((state) => state.product.loading);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
    // Only set loading true if products are not loaded
    setLoading(!products || products.length === 0);
  }, [dispatch, products]);

  useEffect(() => {
    if (!products || products.length === 0) return;
    setLoading(false);
    try {
      let allProducts = products || [];

      // Filtering logic
      let filtered = allProducts;

      // Exclude purchased products
      const excludeArr = Array.isArray(excludeIds) ? excludeIds : [];
      if (excludeArr.length > 0) {
        filtered = filtered.filter((p) => !excludeArr.includes(p._id));
      }

      // Filter by categories if available
      if (categories.length > 0) {
        filtered = filtered.filter((p) => p.category && categories.includes(p.category));
      }

      // Fallback to random products if no category match
      if (filtered.length < 4) {
        filtered = allProducts.filter((p) => !excludeArr.includes(p._id));
      }

      // Limit to 4 products
      setRelated(filtered.slice(0, 4));
      setError(null);
    } catch (err) {
      setError("Failed to load related products.",err);
    }
  }, [categories, excludeIds, products]);

  if (error) return <div className="text-red-500 text-center py-6">{error}</div>;
  if (!related.length && !loading) return null;

  return (
    <section className="mt-16">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900">You May Also Like</h3>
        <button onClick={() => navigate("/products")} className="text-pink-600 hover:text-pink-800 font-medium flex items-center">
          View All <FiArrowRight className="ml-1" />
        </button>
      </div>

      {loading || productsLoading ? (
 <Loader />
      ) : (
        <div className="flex flex-wrap -m-4">
          {related.map((product) => (
            <ProductCard key={product._id} product={product} variants={product.variants || []} />
          ))}
        </div>
      )}
    </section>
  );
}
export default RelatedProducts;
