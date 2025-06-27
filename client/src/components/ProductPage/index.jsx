
// src/pages/ProductPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate,Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import { FaStar, FaTruck, FaShieldAlt, FaExchangeAlt } from "react-icons/fa";
import { productAPI, reviewAPI } from "../../services/api";
import { useCartStore } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import PincodeChecker from "../../components/PincodeChecker";
import ReviewForm from "../../components/ReviewForm";
import ReviewCard from "../../components/ReviewCard";
import ColorButton from "../ColorButton";
import SizeSelect from "../SelectSize";
import "react-toastify/dist/ReactToastify.css";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("description");

  const addToCart = useCartStore((s) => s.addToCart);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  // Fetch product + variants
useEffect(() => {
  async function fetchData() {
    setIsLoading(true);
    try {
      const { data: prod } = await productAPI.getProductBySlug(slug);
      setProduct(prod);

      try {
        // Fetch all products with the same title, then filter for exact title match (in case API returns more)
        const { data: allVariantsRaw } = await productAPI.getAllProducts({ title: prod.title });
        const filteredVariants = allVariantsRaw.filter(v => v.title === prod.title);
        setVariants(filteredVariants);
      } catch (variantErr) {
        setVariants([]); // fallback: no variants
      }

      setColor(prod.color || "");
      setSize(prod.size || "");
      setError(null);
    } catch {
      setError("Product not found.");
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }
  fetchData();
}, [slug]);
  // When color changes, set size to a valid size for that color if current size is not available
  useEffect(() => {
    if (!color || !variants.length) return;
    const validSizes = variants.filter(v => v.color === color && v.title === product?.title && v.availableQty > 0).map(v => v.size);
    if (validSizes.length && !validSizes.includes(size)) {
      setSize(validSizes[0]);
    }
  }, [color, variants, product?.title]);
  

  // Filter options - FIXED: Only show options for this specific product
  // Always include the current product's color and size if not present in variants
  // Only show colors and sizes for variants with the same title as the current product
  // Show all unique colors and sizes for the current product title
  let colorOptions = Array.from(
    new Set(
      variants
        .filter((v) => v.title === product?.title && v.availableQty > 0)
        .map((v) => v.color)
        .filter(Boolean)
    )
  );
  if (product && product.color && !colorOptions.includes(product.color)) {
    colorOptions = [product.color, ...colorOptions];
  }

  let sizeOptions = Array.from(
    new Set(
      variants
        .filter((v) => v.title === product?.title && v.availableQty > 0)
        .map((v) => v.size)
        .filter(Boolean)
    )
  );
  if (product && product.size && !sizeOptions.includes(product.size)) {
    sizeOptions = [product.size, ...sizeOptions];
  }

  // Update product when color/size changes - FIXED: Only show variants of this product

  useEffect(() => {
    if (!color || !size) return;
    // Always update product to the selected variant (even if _id is the same)
    const match = variants.find((v) => v.color === color && v.size === size);
    if (match) {
      setProduct(match);
    }
  }, [color, size, variants]);

  // Reset image index to 0 whenever product changes (for color/size switch)
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product]);

  // Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      try {
        if (product && product._id) {
          const { data: reviews } = await reviewAPI.getProductReviews(product._id);
          setReviews(reviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    }

    if (product) {
      fetchReviews();
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product || !size || !color) {
      toast.error("Please select size and color.");
      return;
    }
    const key = `${product._id}-${size}-${color}`;
    addToCart(key, 1, {
      price: product.price,
      name: product.title,
      size,
      color,
      image: product.images?.[0],
      productId: product._id,
    });
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!product || !size || !color) {
      toast.error("Please select size and color.");
      return;
    }
    const key = `${product._id}-${size}-${color}`;
    addToCart(key, 1, {
      price: product.price,
      name: product.title,
      size,
      color,
      image: product.images && product.images[0],
      productId: product._id,
    });
    navigate("/checkout");
  };

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <BeatLoader height={80} width={80} color="#4fa94d" radius={9} />
      </div>
    );
  }
  
  if (error) return <div className="text-center text-red-500 text-lg mt-10">{error}</div>;
  if (!product) return null;

  return (
    <section className="text-gray-800 body-font overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      {console.log("Variants : - ",variants)}
      <div className="container px-5 py-10 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-gray-600 hover:text-indigo-600 text-sm">Home</Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <Link to="/products/t-shirts" className="ml-1 text-sm text-gray-600 hover:text-indigo-600 md:ml-2">Tshirts</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <span className="ml-1 text-sm text-gray-500 md:ml-2 font-medium">{product.title}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Main Product Section */}
        <div className="lg:w-4/5 mx-auto flex flex-wrap">
          {/* Image Gallery */}
          <div className="lg:w-1/2 w-full">
            <div className="sticky top-24">
              <div className="mb-4 rounded-lg overflow-hidden shadow-md bg-white p-4">
                <img
                  src={product.images?.[selectedImageIndex] || "/placeholder-image.jpg"}
                  alt={product.title}
                  className="w-full h-auto max-h-[500px] object-contain mx-auto"
                />
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="flex space-x-3 overflow-x-auto py-2 px-1">
                {product.images?.map((img, index) => (
                  <button 
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-indigo-600 scale-105' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2 w-full lg:pl-10 mt-6 lg:mt-0">
            <div className="mb-4">
              <h2 className="text-sm title-font text-gray-500 tracking-widest uppercase mb-1">
                {product.brand || "Brand"}
              </h2>
              <h1 className="text-gray-900 text-2xl md:text-3xl font-bold">
                {product.title} {size && color ? `(${size}/${color})` : ""}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < Math.round(avgRating)
                        ? "w-4 h-4 fill-current"
                        : "w-4 h-4 text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-gray-600 ml-2 text-sm">({reviews.length} reviews)</span>
              <span className="mx-2 text-gray-300">•</span>
              <span className={`text-sm font-medium ${product.availableQty > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.availableQty > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="leading-relaxed text-gray-700 mb-6 border-b border-gray-200 pb-6">
              <p>{product.description}</p>
            </div>

            {/* Color & Size */}
            <div className="py-6 border-b border-gray-200 mb-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.length > 0 ? (
                    colorOptions.map((c) => (
                      <ColorButton 
                        key={c} 
                        color={c} 
                        isActive={color === c} 
                        onClick={() => setColor(c)}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No color options available</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.length > 0 ? (
                    <SizeSelect 
                      sizes={sizeOptions} 
                      value={size} 
                      onChange={(e) => setSize(e.target.value)} 
                    />
                  ) : (
                    <p className="text-gray-500 text-sm">No size options available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Price & Buttons */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="ml-3 text-xl text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
                {product.originalPrice && (
                  <span className="ml-3 bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  disabled={product.availableQty <= 0}
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[140px] text-white bg-indigo-600 hover:bg-indigo-700 py-3 px-6 rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                <button
                  disabled={product.availableQty <= 0}
                  onClick={handleBuyNow}
                  className="flex-1 min-w-[140px] text-white bg-gray-900 hover:bg-black py-3 px-6 rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="border border-gray-200 rounded-lg p-4 mb-8 bg-gray-50">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <FaTruck className="w-6 h-6 text-indigo-600 mb-2" />
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-gray-500">Over ₹999</p>
                </div>
                <div className="flex flex-col items-center">
                  <FaExchangeAlt className="w-6 h-6 text-indigo-600 mb-2" />
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-gray-500">30 Days Policy</p>
                </div>
                <div className="flex flex-col items-center">
                  <FaShieldAlt className="w-6 h-6 text-indigo-600 mb-2" />
                  <p className="text-sm font-medium">Secure Payment</p>
                  <p className="text-xs text-gray-500">100% Secure</p>
                </div>
              </div>
            </div>

            {/* Pincode Checker */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Check Delivery</h3>
              <PincodeChecker onCheck={(available) => setService(available)} />
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button 
                className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === "description" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
              <button 
                className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === "reviews" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews ({reviews.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === "description" ? (
              <div className="prose max-w-none">
                <h3 className="text-xl font-bold mb-4">Product Details</h3>
                <p className="mb-4">{product.description}</p>
                
                <h3 className="text-xl font-bold mb-4 mt-8">Features</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {product.features?.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  )) || (
                    <>
                      <li>High-quality materials for durability</li>
                      <li>Designed for comfort and style</li>
                      <li>Easy to maintain and care for</li>
                      <li>Eco-friendly production process</li>
                    </>
                  )}
                </ul>
              </div>
            ) : (
              <div>
                {/* Review Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="text-center mb-4 md:mb-0 md:mr-8">
                      <div className="text-5xl font-bold text-indigo-600">{avgRating}</div>
                      <div className="flex justify-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < Math.round(avgRating)
                                ? "w-5 h-5 text-amber-400 fill-current"
                                : "w-5 h-5 text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 mt-1">{reviews.length} reviews</p>
                    </div>
                    
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter(r => Math.round(r.rating) === star).length;
                        const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
                        
                        return (
                          <div key={star} className="flex items-center mb-2">
                            <span className="text-sm w-16">{star} star</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                              <div 
                                className="h-full bg-amber-400 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm w-10 text-gray-600">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map(review => (
                      <ReviewCard key={review._id || review.createdAt} review={review} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No reviews yet. Be the first to review this product!
                    </div>
                  )}
                </div>
                
                {/* Review Form */}
                <div className="mt-12 border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold mb-6">Write a Review</h3>
                  <ReviewForm productId={product._id} onSuccess={() => {
                    // Refresh reviews after submission
                    reviewAPI.getProductReviews(product._id)
                      .then(({ data }) => setReviews(data))
                      .catch(console.error);
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}