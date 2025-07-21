import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../../redux/features/product/productSlice";
import useCartHook from "../../redux/features/cart/useCartHook";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaFilter } from "react-icons/fa";
import { IoShirtOutline } from "react-icons/io5";
import { GiTShirt } from "react-icons/gi";
import { RiTShirt2Line } from "react-icons/ri";
import { MdOutlineLocalOffer, MdOutlineCategory } from "react-icons/md";
import FilterSidebar from "../../components/FilterSideBar";
import ProductCard from "../../components/ProductCardWithAddToCartButton";
import colorMap from "../../constants/colorMap";

const Products = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products);
  const loading = useSelector((state) => state.product.loading);
  const error = useSelector((state) => state.product.error);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const { addItem } = useCartHook();
  const pageSize = 12;

  // Categories with icons
  const categories = [
    { id: "all", name: "All Products", icon: <MdOutlineCategory className="mr-2" /> },
    { id: "tshirts", name: "T-Shirts", icon: <GiTShirt className="mr-2" /> },
    { id: "sweatshirts", name: "Sweatshirts", icon: <IoShirtOutline className="mr-2" /> },
    { id: "polo", name: "Polo T-Shirts", icon: <RiTShirt2Line className="mr-2" /> },
    { id: "combo", name: "Combo Packs", icon: <MdOutlineLocalOffer className="mr-2" /> },
    { id: "gaming", name: "Gaming Theme", icon: <MdOutlineLocalOffer className="mr-2" /> },
    { id: "coding", name: "Coding Theme", icon: <MdOutlineLocalOffer className="mr-2" /> },
  ];

  const availableSizes = useMemo(() => {
    if (!products?.length) return [];

    const sizeSet = new Set();

    products.forEach((p) => {
      const raw = p.sizes || p.size;
      const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
      arr.forEach((s) => s && sizeSet.add(s));
    });

    const order = { S: 1, M: 2, L: 3, XL: 4, XXL: 5 };

    return Array.from(sizeSet).sort((a, b) => {
      const A = a.toUpperCase();
      const B = b.toUpperCase();
      if (order[A] && order[B]) return order[A] - order[B];
      if (order[A]) return -1;
      if (order[B]) return 1;
      return a.localeCompare(b);
    });
  }, [products]);

  const availableColors = useMemo(() => {
    if (!products?.length) return [];

    const colorSet = new Set();
    const validNames = colorMap.map((c) => c.name.toLowerCase());

    products.forEach((p) => {
      const raw = p.colors || p.color;
      const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];

      arr.forEach((c) => {
        if (!c) return;
        const lower = c.toLowerCase();

        // find match in our colorMap
        const match = validNames.find((name) => lower === name || lower.includes(name));

        const finalName = (match || c).toString();
        colorSet.add(finalName.charAt(0).toUpperCase() + finalName.slice(1).toLowerCase());
      });
    });

    return Array.from(colorSet).sort();
  }, [products]);

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  const filteredProducts = useMemo(() => {
    if (!products?.length) return [];

    return products.filter((product) => {
      // ✅ Category filter
      if (selectedCategory !== "all" && product.category?.toLowerCase() !== selectedCategory) {
        return false;
      }

      // ✅ Price filter
      if (typeof product.price === "number" && (product.price < priceRange[0] || product.price > priceRange[1])) {
        return false;
      }

      // ✅ Helper to normalize field to array
      const toArray = (val1, val2) => {
        const raw = val1 || val2;
        return Array.isArray(raw) ? raw : raw ? [raw] : [];
      };

      // ✅ Size filter
      const prodSizes = toArray(product.sizes, product.size);
      if (selectedSizes.length > 0 && !selectedSizes.some((size) => prodSizes.includes(size))) {
        return false;
      }

      // ✅ Color filter
      const prodColors = toArray(product.colors, product.color).map((c) => c.toLowerCase());
      if (selectedColors.length > 0) {
        const match = selectedColors.some((sel) => {
          const selLower = sel.toLowerCase();
          return prodColors.some((pc) => pc === selLower || pc.includes(selLower) || selLower.includes(pc));
        });
        if (!match) return false;
      }

      return true; // passed all filters
    });
  }, [products, selectedCategory, priceRange, selectedSizes, selectedColors]);

  // ✅ Sort products
  const sortedProducts = useMemo(() => {
    const productsCopy = [...filteredProducts];
    return productsCopy.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
  }, [filteredProducts, sortBy]);

  // ✅ Pagination
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ✅ Reset pagination whenever filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, selectedSizes, selectedColors, sortBy]);

  // ✅ Toggle size selection
  const handleSizeChange = (size) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  };

  // ✅ Toggle color selection
  const handleColorChange = (color) => {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]));
  };

  // ✅ Reset all filters
  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, 5000]);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  // ✅ Helper to safely extract size/color
  const getFirstValue = (main, alt) => {
    if (Array.isArray(main) && main.length > 0) return main[0];
    if (Array.isArray(alt) && alt.length > 0) return alt[0];
    return main || alt || null;
  };

  // ✅ Handle add to cart
  const handleAddToCart = (product) => {
    setFilterOpen(false);

    const size = getFirstValue(product.sizes, product.size);
    const color = getFirstValue(product.colors, product.color);

    if (!size || !color) {
      toast.error("No size or color available for this product.");
      return;
    }

    const key = `${product._id || product.id}-${size}-${color}`;
    addItem(key, 1, {
      price: product.price,
      name: product.name || product.title,
      size,
      color,
      image: product.image || (Array.isArray(product.images) ? product.images[0] : undefined),
      productId: product._id || product.id,
    });

    toast.success(`${product.name || product.title} added to cart!`);
  };

  // Loading state
  if (loading)
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex">
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
  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h2 className="font-bold text-xl mb-2">Error Loading Products</h2>
          <p>{error}</p>
          <button onClick={() => dispatch(fetchProducts())} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
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
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Explore our premium selection of products designed with quality and style in mind</p>
        </div>

        <div className="md:hidden flex justify-end mb-6">
          <button onClick={() => setFilterOpen(true)} className="flex items-center bg-pink-600 text-white px-4 py-2 rounded-lg">
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
            onSizeChange={handleSizeChange}
            colors={availableColors}
            selectedColors={selectedColors}
            onColorChange={handleColorChange}
            onResetFilters={resetFilters}
          />

          <div className="w-full md:w-3/4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-4 bg-white rounded-lg shadow-sm">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-700">
                  Showing <span className="font-bold">{sortedProducts.length}</span> of <span className="font-bold">{products.length}</span> products
                </p>
              </div>

              <div className="flex items-center">
                <span className="text-gray-700 mr-2">Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} categories={categories} onAddToCart={handleAddToCart} onNavigate={() => setFilterOpen(false)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gray-100 inline-block p-6 rounded-full mb-4">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 max-w-md mx-auto">We couldn't find any products matching your filters. Try adjusting your criteria.</p>
                <button onClick={resetFilters} className="mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg">
                  Reset Filters
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    className={`px-4 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 rounded-l-md ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i + 1} className={`px-4 py-2 border-t border-b border-gray-300 ${currentPage === i + 1 ? "bg-pink-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`} onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className={`px-4 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 rounded-r-md ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
