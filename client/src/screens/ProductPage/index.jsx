import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../../components/Loader";
import { reviewAPI } from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import useCart from "../../redux/features/cart/useCartHook";
import { fetchProducts, fetchProductBySlug } from "../../redux/features/product/productSlice";
import ProductGallery from "../../components/ProductPage/ProductGallery";
import ProductDetails from "../../components/ProductPage/ProductDetails";
import ColorAndSizeSelector from "../../components/ProductPage/ColorAndSizeSelector";
import ProductTabs from "../../components/ProductPage/ProductTabs";
import "react-toastify/dist/ReactToastify.css";
import ProductBreadcrumb from "../../components/ProductPage/BreadCrumb";
import ProductActions from "../../components/ProductPage/ProductActions";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products);
  const productsLoading = useSelector((state) => state.product.loading);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const currentProduct = useSelector((state) => state.product.currentProduct);

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [reviews, setReviews] = useState([]);
  const { addItem } = useCart();

  // Fetch product + variants
  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (currentProduct) {
      setProduct(currentProduct);
      
      // Set initial color and size to first available variant only
      const availableVariants = currentProduct.variants?.filter(v => v.availableQty > 0) || [];
      if (availableVariants.length > 0) {
        setColor(availableVariants[0].color || "");
        setSize(availableVariants[0].size || "");
      }
      
      setVariants(currentProduct.variants || []);
      setIsLoading(false);
    }
  }, [currentProduct]);

  const selectedVariant = variants.find(
    (v) => v.color === color && v.size === size
  );

  // Get available colors only
  const availableColors = [...new Set(
    variants
      .filter(v => v.availableQty > 0)
      .map(v => v.color)
  )];

  // Get available sizes for current color only
  const availableSizes = variants
    .filter(v => v.color === color && v.availableQty > 0)
    .map(v => v.size);

  // Update product when color changes
  const handleColorChange = (newColor) => {
    // Only allow changing to available colors
    const isColorAvailable = availableColors.includes(newColor);
    if (!isColorAvailable) {
      toast.error("This color is not available");
      return;
    }

    setColor(newColor);

    // Find variant with the selected color
    if (variants && variants.length > 0) {
      const colorVariant = variants.find((v) => v.color === newColor && v.availableQty > 0);

      if (colorVariant) {
        // Update product data with the selected color variant
        setProduct({
          ...product,
          ...colorVariant,
          variants: variants, // Keep the variants array
          images: colorVariant.images || product.images, // Use variant images if available
        });
      }
    }
  };

  // Handle size change with availability check
  const handleSizeChange = (newSize) => {
    const isSizeAvailable = availableSizes.includes(newSize);
    if (!isSizeAvailable) {
      toast.error("This size is not available for selected color");
      return;
    }
    setSize(newSize);
  };

  // When color changes, set size to valid available size
  useEffect(() => {
    if (!color || !variants.length) return;
    const validSizes = variants.filter((v) => v.color === color && v.availableQty > 0).map((v) => v.size);

    if (validSizes.length && !validSizes.includes(size)) {
      setSize(validSizes[0]);
    }
  }, [color, variants, size]);

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

    // Additional check for variant availability
    if (!selectedVariant || selectedVariant.availableQty <= 0) {
      toast.error("Selected variant is not available");
      return;
    }

    const key = `${product._id}-${size}-${color}`;
    addItem(key, 1, {
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
      // Save the current path to navigate back after login
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!product || !size || !color) {
      toast.error("Please select size and color.");
      return;
    }

    // Additional check for variant availability
    if (!selectedVariant || selectedVariant.availableQty <= 0) {
      toast.error("Selected variant is not available");
      return;
    }

    const key = `${product._id}-${size}-${color}`;
    addItem(key, 1, {
      price: product.price,
      name: product.title,
      size,
      color,
      image: product.images?.[0],
      productId: product._id,
    });
    navigate("/checkout");
  };

  if (isLoading || productsLoading) {
    return <Loader />;
  }

  if (error) return <div className="text-center text-red-500 text-lg mt-10">{error}</div>;
  if (!product) return null;

  return (
    <section className="text-gray-800 body-font overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container px-5 py-10 mx-auto">
        <ProductBreadcrumb product={product} />

        <div className="lg:w-4/5 mx-auto flex flex-wrap">
         <ProductGallery images={selectedVariant?.images || []} />

          <div className="lg:w-1/2 w-full lg:pl-10 mt-6 lg:mt-0">
            <ProductDetails product={product} reviews={reviews} color={color} size={size} />

            <ColorAndSizeSelector 
              product={product} 
              variants={variants} 
              color={color} 
              size={size} 
              setColor={handleColorChange} 
              setSize={handleSizeChange}
              availableColors={availableColors}
              availableSizes={availableSizes}
            />

            <ProductActions product={product} color={color} size={size} variants={variants} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
          </div>
        </div>

        <ProductTabs product={product} reviews={reviews} setReviews={setReviews} />
      </div>
    </section>
  );
}