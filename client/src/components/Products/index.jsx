import React, { useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaStar, FaRegHeart, FaShoppingCart, FaFilter, FaTimes } from 'react-icons/fa';
import { IoShirtOutline } from 'react-icons/io5';
import { GiTShirt } from 'react-icons/gi';
import { RiTShirt2Line } from 'react-icons/ri';
import { MdOutlineLocalOffer, MdOutlineCategory } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const navigate = useNavigate();
  const { products, fetchProducts, loading, error } = useProductStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!products || products.length === 0) {
      fetchProducts();
    }
    // eslint-disable-next-line
  }, []);

  // Categories with icons
  const categories = [
    { id: 'all', name: 'All Products', icon: <MdOutlineCategory className="mr-2" /> },
    { id: 'tshirts', name: 'T-Shirts', icon: <GiTShirt className="mr-2" /> },
    { id: 'sweatshirts', name: 'Sweatshirts', icon: <IoShirtOutline className="mr-2" /> },
    { id: 'polo', name: 'Polo T-Shirts', icon: <RiTShirt2Line className="mr-2" /> },
    { id: 'combo', name: 'Combo Packs', icon: <MdOutlineLocalOffer className="mr-2" /> },
    { id: 'gaming', name: 'Gaming Theme', icon: <MdOutlineLocalOffer className="mr-2" /> },
    { id: 'coding', name: 'Coding Theme', icon: <MdOutlineLocalOffer className="mr-2" /> },
  ];

  // Helper to normalize color for comparison (e.g., 'Red' -> 'red')
  const normalizeColor = c => c?.toLowerCase();

  // Filter products based on selections
  const filteredProducts = products
    ? products.filter(product => {
        // Category filter (backend: product.category)
        if (selectedCategory !== 'all' && product.category?.toLowerCase() !== selectedCategory) {
          return false;
        }

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
  }, [selectedCategory, priceRange, sizes, colors, sortBy]);

  // Product Card Component
  const ProductCard = ({ product }) => {
    // Fallbacks for image, name, etc.
    const image = product.image || (Array.isArray(product.images) ? product.images[0] : null);
    const name = product.name || product.title || 'Product';
    const description = product.description || '';
    const categoryLabel = categories.find(c => c.id === (product.category?.toLowerCase() || product.category))?.name || product.category || 'Fashion';
    const slug = product.slug;
    
    return (
      <div
        className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
        onClick={() => {
          setFilterOpen(false); // Close filter sidebar on navigation
          if (slug) navigate(`/product/${slug}`);
        }}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${name}`}
        onKeyDown={e => {
          if (e.key === 'Enter' && slug) {
            setFilterOpen(false);
            navigate(`/product/${slug}`);
          }
        }}
      >
        {/* Product Image */}
        <div className="relative">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-64 object-contain md:h-72 lg:h-80 rounded-t-xl transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}

          {/* Discount Badge */}
          {product.originalPrice && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </div>
          )}
        </div>
        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <div className="text-pink-600 text-sm font-medium mb-1">
            {categoryLabel}
          </div>
          {/* Product Name */}
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
            {name}
          </h3>
          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-12">
            {description}
          </p>
          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex text-pink-400">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < (product.rating || 4) ? "w-4 h-4 fill-current" : "w-4 h-4 text-gray-300"}
                />
              ))}
            </div>
            <span className="text-gray-500 text-sm ml-1">({product.reviewCount || 24})</span>
          </div>
          {/* Price & Add to Cart */}
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-gray-900 text-xl">₹{product.price}</span>
              {product.originalPrice && (
                <span className="ml-2 text-gray-500 text-sm line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            <button 
              className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-full flex items-center transition-colors"
              onClick={e => {
                e.stopPropagation();
                // Close filter sidebar when adding to cart
                setFilterOpen(false);
                
                // Try to get size/color from product, fallback to first available
                let size = product.size;
                let color = product.color;
                if (!size && Array.isArray(product.sizes) && product.sizes.length > 0) size = product.sizes[0];
                if (!color && Array.isArray(product.colors) && product.colors.length > 0) color = product.colors[0];
                if (!size || !color) {
                  toast.error('No size or color available for this product.');
                  return;
                }
                const key = `${product._id || product.id}-${size}-${color}`;
                addToCart(key, 1, {
                  price: product.price,
                  name: product.name || product.title,
                  size,
                  color,
                  image: product.image || (Array.isArray(product.images) ? product.images[0] : undefined),
                  productId: product._id || product.id,
                });
                toast.success(`${name} added to cart!`);
              }}
              aria-label={`Add ${name} to cart`}
            >
              <FaShoppingCart className="mr-2" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex">
        {/* Sidebar skeleton */}
        <div className="hidden md:block w-1/4 pr-8">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            </div>
          ))}
        </div>
        
        {/* Products grid skeleton */}
        <div className="w-full md:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-64 w-full" />
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-10 w-32 rounded-full bg-gray-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Error state
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
        <h2 className="font-bold text-xl mb-2">Error Loading Products</h2>
        <p>{error}</p>
        <button 
          onClick={() => fetchProducts(true)}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ToastContainer should be rendered only once at the top level */}
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Discover Our Collection</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our premium selection of products designed with quality and style in mind
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
          {/* Filter Sidebar - Desktop and Mobile Modal */}
          <div
            className={`${
              filterOpen ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto md:static md:block md:w-1/4 md:pr-8' : 'hidden md:block md:w-1/4 md:pr-8'
            }`}
            aria-modal={filterOpen ? 'true' : undefined}
            role={filterOpen ? 'dialog' : undefined}
          >
            {/* Filter Header - Always show on mobile when open, conditionally on desktop */}
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
            
            {/* Categories */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <MdOutlineCategory className="mr-2" /> Categories
              </h3>
              <ul className="space-y-2">
                {categories.map(category => (
                  <li key={category.id}>
                    <button 
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center w-full text-left p-2 rounded-md transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-pink-100 text-pink-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-pressed={selectedCategory === category.id}
                    >
                      {category.icon} {category.name}
                    </button>
                  </li>
                ))}
              </ul>
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
                {['Red', 'pink', 'Green', 'Black', 'White', 'Gray', 'Yellow', 'Purple'].map(color => {
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
                setSelectedCategory('all');
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    setSelectedCategory('all');
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

export default Products;