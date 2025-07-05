import { useParams } from "react-router-dom";
import ProductCard from "../ProductCard";
import { useEffect, useState } from "react";
import { productAPI } from "../../services/api";
import Loader from "../Loader";

const ThemePage = () => {
  const { theme } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    productAPI.getProductsByTheme(theme)
      .then(res => {
        console.log("Theme products received:", res.data);
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching theme products:", err);
        setError(err.message || "Failed to load products");
        setLoading(false);
      });
  }, [theme]);

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
              Error loading {theme.toLowerCase()}
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
            {theme} Theme
          </h1>
          <p className="lg:w-2/3 mx-auto text-gray-600">
            Browse our latest collection of {theme.toLowerCase()} themed products.
          </p>
        </div>

        {products && products.length > 0 ? (
          <>
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Showing {products.length} {products.length === 1 ? 'product' : 'products'} in {theme.toLowerCase()}
              </p>
            </div>
            
            <div className="flex flex-wrap -m-4">
              {products.map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl text-gray-700 mb-4">
                No {theme.toLowerCase()} themed products available at the moment.
              </p>
              <p className="text-gray-600 mb-6">
                Please check back later for new arrivals, or browse other themes.
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

export default ThemePage;
