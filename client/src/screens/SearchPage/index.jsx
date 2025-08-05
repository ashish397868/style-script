import { useLocation } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { useEffect, useState } from "react";
import { productAPI } from "../../services/api";
import Loader from "../../components/Loader";

const SearchPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('query'); // ?query=shoes etc.

  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchQuery) return;

    setLoading(true);
    setError(null);

    const fetchResults = async () => {
      try {
        const response = await productAPI.searchProducts(searchQuery);
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load search results.");
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery]);

  if (!searchQuery) {
    return (
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-12 mx-auto text-center">
          <p className="text-xl text-gray-700 mb-4">No search query provided.</p>
          <button onClick={() => window.history.back()} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Go Back
          </button>
        </div>
      </section>
    );
  }

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
        <div className="container px-5 py-12 mx-auto text-center">
          <p className="text-xl text-red-600 mb-4">Error loading search results</p>
          <p className="text-gray-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-12 mx-auto">
        <div className="flex flex-col text-center w-full mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 capitalize">
            Search: {searchQuery}
          </h1>
          <p className="lg:w-2/3 mx-auto text-gray-600">
            Showing results for "<span className="font-semibold">{searchQuery}</span>"
          </p>
        </div>

        {products.length > 0 ? (
          <>
            <div className="text-center mb-6">
              <p className="text-gray-600">Showing {products.length} result{products.length > 1 ? 's' : ''}</p>
            </div>

            <div className="flex flex-wrap -m-4">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-gray-700 mb-4">
                No results found for "<span className="font-semibold">{searchQuery}</span>"
              </p>
              <p className="text-gray-600 mb-6">Try a different keyword or check back later.</p>
              <button onClick={() => window.history.back()} className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors">
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchPage;
