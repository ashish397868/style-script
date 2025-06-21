import { useEffect, useState } from "react";
import { productAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function RelatedProducts({ category, tag, excludeId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      try {
        // You can adjust this API call to filter by category/tag as needed
        const res = await productAPI.getAllProducts();
        let filtered = res.data;
        if (category) filtered = filtered.filter(p => p.category === category);
        if (tag) filtered = filtered.filter(p => p.tags && p.tags.includes(tag));
        if (excludeId) filtered = filtered.filter(p => p._id !== excludeId);
        setProducts(filtered.slice(0, 4)); // Show up to 4 related
        setError(null);
      } catch (err) {
        setError("Failed to load related products.");
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [category, tag, excludeId]);

  if (loading) return <div>Loading related products...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!products.length) return <div>No related products found.</div>;

  return (
    <section className="mt-10">
      <h3 className="text-xl font-bold mb-4">Related Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(product => (
          <div
            key={product._id}
            className="border rounded p-3 hover:shadow cursor-pointer"
            onClick={() => navigate(`/product/${product.slug}`)}
          >
            <img
              src={product.images && product.images[0] ? product.images[0] : "/placeholder-image.jpg"}
              alt={product.title}
              className="w-full h-40 object-cover mb-2 rounded"
            />
            <div className="font-semibold">{product.title}</div>
            <div className="text-gray-600">₹{product.price}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
