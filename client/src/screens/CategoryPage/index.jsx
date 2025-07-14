import { useParams, useLocation } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { useEffect, useState } from "react";
import { productAPI } from "../../services/api";
import Loader from "../../components/Loader";

const CategoryPage = () => {
  const { category } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchProducts = async () => {
      try {
        let response;
        
        if (searchQuery) {
          setTitle(`Search: ${searchQuery}`);
          setSubtitle(`Showing search results for "${searchQuery}"`);
          response = await productAPI.searchProducts(searchQuery);
        } else {
          setTitle(`${category} Collection`);
          setSubtitle(`Browse our latest collection of ${category.toLowerCase()}.`);
          response = await productAPI.getProductsByCategory(category);
        }
        
        console.log("Products received:", response.data);
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to load products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchQuery]);

  if (loading) {
    return (
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-12 mx-auto">
          <Loader />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-12 mx-auto">
          <div className="text-center py-8">
            <p className="text-xl text-red-600 mb-4">
              Error loading {searchQuery ? 'search results' : category.toLowerCase()}
            </p>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-12 mx-auto">
        <div className="flex flex-col text-center w-full mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 capitalize">
            {title}
          </h1>
          <p className="lg:w-2/3 mx-auto text-gray-600">
            {subtitle}
          </p>
        </div>

        {products && products.length > 0 ? (
          <>
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Showing {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>
            </div>
            
            <div className="flex flex-wrap -m-4">
              {products.map(product => {
                // Each product already has its variants grouped by the backend
                return (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                    // variants are already included in product.variants from backend
                  />
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl text-gray-700 mb-4">
                {searchQuery 
                  ? `No results found for "${searchQuery}"` 
                  : `No ${category.toLowerCase()} available at the moment.`}
              </p>
              <p className="text-gray-600 mb-6">
                Please check back later for new arrivals, or try a different search term.
              </p>
              <button 
                onClick={() => window.history.back()} 
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryPage;