import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../../services/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const searchRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  const fetchResults = async (value) => {
    setLoading(true);
    try {
      const { data } = await productAPI.searchProducts(value);
      setResults(data);
      setShow(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(timeoutRef.current);

    if (!value.trim()) {
      setResults([]);
      setShow(false);
      return;
    }

    timeoutRef.current = setTimeout(() => fetchResults(value), 300);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShow(false);
  };

  const goToSearchPage = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search/?query=${encodeURIComponent(query)}`);
      clearSearch();
    }
  };

  const selectProduct = (slug) => {
    navigate(`/product/${slug}`);
    clearSearch();
  };

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={goToSearchPage} className="flex w-64 relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search products..."
          className="w-full px-3 py-1 pr-8 border border-gray-300 rounded-l-md focus:outline-none focus:border-pink-500 text-gray-800"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <FiX size={16} />
          </button>
        )}
        <button type="submit" className="px-2 py-1 bg-pink-600 text-white rounded-r-md hover:bg-pink-700">
          <FiSearch />
        </button>
      </form>

      {show && (
        <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : results.length > 0 ? (
            results.map((p) => (
              <div
                key={p._id}
                onClick={() => selectProduct(p.slug)}
                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
              >
                {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="h-10 w-10 object-contain mr-4" />}
                <div>
                  <div className="text-sm font-medium">{p.title}</div>
                  <div className="text-xs text-gray-500">{p.category}</div>
                </div>
              </div>
            ))
          ) : (
            query && <div className="p-3 text-center text-gray-500">No products found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
