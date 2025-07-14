import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../../services/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const searchTimeout = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Debounce search API call
    searchTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await productAPI.searchProducts(value);
        setSearchResults(response.data);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleClearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleSelectProduct = (slug) => {
    navigate(`/product/${slug}`);
    handleClearSearch();
  };

  const handleSubmitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(query)}`);
      handleClearSearch();
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center w-64">
        <form onSubmit={handleSubmitSearch} className="flex w-full">
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search products..."
            className="w-full px-3 py-1 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-gray-800"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-pink-600 text-white rounded-r-md hover:bg-pink-700"
          >
            <FiSearch />
          </button>
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <FiX />
            </button>
          )}
        </form>
      </div>

      {/* Search results dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : (
            searchResults.map((product) => (
              <div
                key={product._id}
                onClick={() => handleSelectProduct(product.slug)}
                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
              >
                {product.images && product.images[0] && (
                  <img src={product.images[0]} alt={product.title} className="h-10  object-contain mr-4" />
                )}
                <div>
                  <div className="text-sm font-medium">{product.title}</div>
                  <div className="text-xs text-gray-500">{product.category}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showResults && query && searchResults.length === 0 && !isLoading && (
        <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 p-3 text-center text-gray-500">
          No products found
        </div>
      )}
    </div>
  );
};

export default SearchBar; 