import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { productAPI } from "../../services/api";
import Loader from "../../components/Loader";
import ProductCard from "../../components/ProductCard";
import { FaFilter, FaTimes } from 'react-icons/fa';
import useCartHook from '../../redux/features/cart/useCartHook';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ThemePage = () => {
  const { theme } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state variables
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const {addItem} = useCartHook();

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

  // Helper to normalize color for comparison
  const normalizeColor = c => c?.toLowerCase();
  
  // Filter products based on selections
  const filteredProducts = products 
    ? products.filter(product => {
        // Price filter
        if (typeof product.price === 'number' && (product.price < priceRange[0] || product.price > priceRange[1])) {
          return false;
        }

        // Size filter (backend: product.size or product.sizes)
        const prodSizes = product.sizes || product.size || [];
        if (sizes.length > 0 && !sizes.some(size => prodSizes.includes(size))) {
          return false;
        }

        // Color filter (backend: product.color or product.colors, sentence case)
        let prodColorsArr = [];
        if (Array.isArray(product.colors)) {
          prodColorsArr = product.colors;
        } else if (typeof product.colors === 'string') {
          prodColorsArr = [product.colors];
        } else if (Array.isArray(product.color)) {
          prodColorsArr = product.color;
        } else if (typeof product.color === 'string') {
          prodColorsArr = [product.color];
        }
        const prodColors = prodColorsArr.map(normalizeColor);
        if (colors.length > 0 && !colors.some(color => prodColors.includes(normalizeColor(color)))) {
          return false;
        }

        return true;
      })
    : [];
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // newest
  });

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [priceRange, sizes, colors, sortBy]);

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
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container px-5 py-12 mx-auto">
        <div className="flex flex-col text-center w-full mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 capitalize">
            {theme} Theme
          </h1>
          <p className="lg:w-2/3 mx-auto text-gray-600">
            Browse our latest collection of {theme.toLowerCase()} themed products.
          </p>
        </div>

        {/* Mobile filter button */}
        <div className="md:hidden flex justify-end mb-6">
          <button 
            onClick={() => setFilterOpen(true)}
            className="flex items-center bg-pink-600 text-white px-4 py-2 rounded-lg"
          >
            <FaFilter className="mr-2" /> Filters
          </button>
        </div>

        {/* Main content */}
        <div className="flex">
          {/* Filter Sidebar */}
          <div
            className={`${
              filterOpen ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto md:static md:block md:w-1/4 md:pr-8' : 'hidden md:block md:w-1/4 md:pr-8'
            }`}
            aria-modal={filterOpen ? 'true' : undefined}
            role={filterOpen ? 'dialog' : undefined}
          >
            {/* Filter Header */}
            <div className={`${filterOpen ? 'flex' : 'hidden md:hidden'} justify-between items-center mb-6 md:hidden`}>
              <h2 className="text-xl font-bold">Filters</h2>
              <button 
                onClick={() => setFilterOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
                aria-label="Close filters"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            {/* Price Range */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
              <div className="px-2">
                <input 
                  type="range" 
                  min="0" 
                  max="5000" 
                  step="100"
                  value={priceRange[0]}
                  onChange={e => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="w-full mb-2"
                />
                <input 
                  type="range" 
                  min="0" 
                  max="5000" 
                  step="100"
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm">₹{priceRange[0]}</span>
                  <span className="text-sm">₹{priceRange[1]}</span>
                </div>
              </div>
            </div>
            
            {/* Sizes */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-4">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <button
                    key={size}
                    onClick={() => 
                      setSizes(prev => 
                        prev.includes(size) 
                          ? prev.filter(s => s !== size) 
                          : [...prev, size]
                      )
                    }
                    aria-pressed={sizes.includes(size)}
                    className={`px-3 py-1 border rounded-md text-sm ${
                      sizes.includes(size)
                        ? 'bg-pink-600 text-white border-pink-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Colors */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-4">Colors</h3>
              <div className="flex flex-wrap gap-2">
                {['Red', 'Pink', 'Green', 'Black', 'White', 'Gray', 'Yellow', 'Purple'].map(color => {
                  const colorKey = color.toLowerCase();
                  return (
                    <button
                      key={color}
                      onClick={() =>
                        setColors(prev =>
                          prev.includes(color)
                            ? prev.filter(c => c !== color)
                            : [...prev, color]
                        )
                      }
                      aria-pressed={colors.includes(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        colorKey === 'white' ? 'border-gray-300' : 'border-transparent'
                      } ${colors.includes(color) ? 'ring-2 ring-offset-2 ring-pink-500' : ''}`}
                      style={{ backgroundColor: colorKey }}
                      aria-label={color}
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Reset Filters */}
            <button 
              onClick={() => {
                setPriceRange([0, 5000]);
                setSizes([]);
                setColors([]);
              }}
              className="w-full py-2 border border-pink-600 text-pink-600 rounded-md hover:bg-pink-50"
              aria-label="Reset all filters"
            >
              Reset Filters
            </button>
          </div>

          {/* Products Grid */}
          <div className="w-full md:w-3/4">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-4 bg-white rounded-lg shadow-sm">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-700">
                  Showing <span className="font-bold">{sortedProducts.length}</span> of{" "}
                  <span className="font-bold">{products.length}</span> products
                </p>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-700 mr-2">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <div className="flex flex-wrap -m-4">
                {paginatedProducts.map(product => (
                  <ProductCard 
                    key={product._id || product.id} 
                    product={product} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gray-100 inline-block p-6 rounded-full mb-4">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We couldn't find any products matching your filters. Try adjusting your criteria.
                </p>
                <button 
                  onClick={() => {
                    setPriceRange([0, 5000]);
                    setSizes([]);
                    setColors([]);
                  }}
                  className="mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg"
                >
                  Reset Filters
                </button>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    className={`px-4 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 rounded-l-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`px-4 py-2 border-t border-b border-gray-300 ${currentPage === i + 1 ? 'bg-pink-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className={`px-4 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 rounded-r-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile filter overlay */}
      {filterOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setFilterOpen(false)}
          aria-label="Close filter overlay"
          tabIndex={0}
          role="button"
        />
      )}
    </div>
  );
};

export default ThemePage;
