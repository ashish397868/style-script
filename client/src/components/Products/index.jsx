import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts, setFilters, setPage } from "../../redux/features/product/productSlice";
import useCartHook from "../../redux/features/cart/useCartHook";
import { FaFilter } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import FilterSidebar from "../../components/FilterSidebar";
import colorMap from "../../constants/colorMap"

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const products = useSelector((state) => state.product.products);
  const loading = useSelector((state) => state.product.loading);
  const error = useSelector((state) => state.product.error);
  const { addItem } = useCartHook();

  // Filter state - ensure arrays are properly initialized
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  // const pageSize = 12;

  // Fetch products on component mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Memoized unique categories from products
  const categories = useMemo(() => {
    if (!products?.length) return [];
    
    const uniqueCategories = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(uniqueCategories).sort().map(category => ({
      id: category,
      name: category,
      icon: null
    }));
  }, [products]);

  // Memoized available sizes from variants
  const availableSizes = useMemo(() => {
    if (!products?.length) return [];

    const sizeSet = new Set();
    const order = { S: 1, M: 2, L: 3, XL: 4, XXL: 5 };

    products.forEach((product) => {
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach(variant => {
          if (variant.size) {
            sizeSet.add(variant.size.toUpperCase());
          }
        });
      }
    });

    return Array.from(sizeSet).sort((a, b) => {
      return (order[a] || Infinity) - (order[b] || Infinity) || a.localeCompare(b);
    });
  }, [products]);

  // Memoized available colors from variants
  const availableColors = useMemo(() => {
    if (!products?.length) return [];

    const colorSet = new Set();
    const validNames = colorMap.map(c => c.name.toLowerCase());

    products.forEach((product) => {
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach(variant => {
          if (variant.color) {
            const color = variant.color.toLowerCase();
            // Try to match with our color map
            const match = validNames.find(name => color === name || color.includes(name));
            const finalColor = match || color;
            colorSet.add(finalColor.charAt(0).toUpperCase() + finalColor.slice(1));
          }
        });
      }
    });

    return Array.from(colorSet).sort();
  }, [products]);

  // Update filters
  useEffect(() => {
    dispatch(setFilters({
      category: selectedCategory === "all" ? null : selectedCategory,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sizes: selectedSizes,
      colors: selectedColors,
      sort: sortBy,
      page: currentPage,
      limit: 12
    }));
  }, [dispatch, selectedCategory, priceRange, selectedSizes, selectedColors, sortBy, currentPage]);

  // Update sorting directly through filters

  // Get pagination info from Redux store
  const totalPages = useSelector((state) => state.product.totalPages);
  const totalProducts = useSelector((state) => state.product.totalProducts);

  // Fetch products when page changes or filters change
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch, currentPage, selectedCategory, selectedSizes, selectedColors, sortBy, priceRange]);

  // Update page in Redux store
  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    setCurrentPage(newPage);
  };

  // Reset all filters - ensure arrays are properly reset
  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, 5000]);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  // Array handling is now done through Redux actions

  // Handle add to cart
  const handleAddToCart = (product, selectedSize, selectedColor) => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select both size and color");
      return;
    }

    // Get available variants
    const availableVariants = Array.isArray(product.variants) ? product.variants : [];
    if (availableVariants.length === 0) {
      toast.error("No variants available for this product");
      return;
    }

    // Find the specific variant that matches the selected size and color
    const variant = availableVariants.find(
      v => v.size?.toUpperCase() === selectedSize.toUpperCase() && 
           v.color?.toLowerCase() === selectedColor.toLowerCase()
    );

    if (!variant) {
      toast.error("This combination of size and color is not available");
      return;
    }

    if (!variant.availableQty || variant.availableQty <= 0) {
      toast.error("This variant is out of stock");
      return;
    }

    const key = `${product._id}-${selectedSize}-${selectedColor}`;
    addItem(key, 1, {
      price: variant.price,
      name: product.title,
      size: variant.size,
      color: variant.color,
      image: variant.images?.[0] || product.images?.[0],
      productId: product._id,
      variantId: variant._id,
      sku: variant.sku
    });

    toast.success(`${product.title} added to cart!`);
  };

  // Loading state
  if (loading) return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
  );

  // Error state
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
        <h2 className="font-bold text-xl mb-2">Error Loading Products</h2>
        <p>{error}</p>
        <button 
          onClick={() => dispatch(fetchProducts())} 
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Discover Our Collection</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our premium selection of products designed with quality and style in mind
          </p>
        </div>

        <div className="md:hidden flex justify-end mb-6">
          <button 
            onClick={() => setFilterOpen(true)} 
            className="flex items-center bg-pink-600 text-white px-4 py-2 rounded-lg"
          >
            <FaFilter className="mr-2" /> Filters
          </button>
        </div>

        <div className="flex">
          <FilterSidebar
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            sizes={availableSizes}
            selectedSizes={selectedSizes}
            onSizeChange={setSelectedSizes}  // Keep this as is
            colors={availableColors}
            selectedColors={selectedColors}
            onColorChange={setSelectedColors}  // Keep this as is
            onResetFilters={resetFilters}
            colorMap={colorMap}
          />

          <div className="w-full md:w-3/4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-4 bg-white rounded-lg shadow-sm">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-700">
                  Showing <span className="font-bold">{products.length}</span> of{' '}
                  <span className="font-bold">{totalProducts}</span> products
                </p>
              </div>

              <div className="flex items-center">
                <span className="text-gray-700 mr-2">Sort by:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className="border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {products.length > 0 ? (
              <div className="flex flex-wrap -m-4">
                {products.map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    onAddToCart={(size, color) => handleAddToCart(product, size, color)}
                    onNavigate={() => navigate(`/product/${product.slug || product._id}`)}
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
                  onClick={resetFilters} 
                  className="mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    className={`px-4 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 rounded-l-md ${
                      currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`px-4 py-2 border-t border-b border-gray-300 ${
                        currentPage === i + 1 
                          ? "bg-pink-600 text-white" 
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className={`px-4 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 rounded-r-md ${
                      currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => handlePageChange(currentPage + 1)}
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
    </div>
  );
};

export default Products;