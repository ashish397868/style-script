import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../../components/Loader";
import { reviewAPI } from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import useCart from "../../redux/features/cart/useCartHook";
import { fetchProductBySlug } from "../../redux/features/product/productSlice";
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
  
  // Get current product and loading state from Redux
  const currentProduct = useSelector((state) => state.product.currentProduct);
  const productLoading = useSelector((state) => state.product.loading);
  const productError = useSelector((state) => state.product.error);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const [variants, setVariants] = useState([]);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [reviews, setReviews] = useState([]);
  const { addItem } = useCart();

  // Fetch product by slug
  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }
  }, [dispatch, slug]);

  // Update variants and initial color/size when product loads
  useEffect(() => {
    if (currentProduct) {
      setColor(currentProduct.color || "");
      setSize(currentProduct.size || "");
      
      // Set variants - either from product.variants or find products with same title
      if (Array.isArray(currentProduct.variants) && currentProduct.variants.length > 0) {
        setVariants(currentProduct.variants);
      } else {
        // If no variants array, treat current product as the only variant
        setVariants([currentProduct]);
      }
    }
  }, [currentProduct]);

  // Update product when color changes
  const handleColorChange = (newColor) => {
    setColor(newColor);
    
    // Find variant with the selected color
    if (variants && variants.length > 0) {
      const colorVariant = variants.find(
        (v) => v.color === newColor && v.title === currentProduct.title
      );
      
      if (colorVariant) {
        // You might want to update Redux state or just handle this locally
        // For now, we'll keep the current product but update local color state
        console.log("Color variant found:", colorVariant);
      }
    }
  };

  // When color changes, set size to valid size
  useEffect(() => {
    if (!color || !variants.length || !currentProduct) return;
    
    const validSizes = variants
      .filter((v) => v.color === color && v.title === currentProduct.title && v.availableQty > 0)
      .map((v) => v.size);
      
    if (validSizes.length && !validSizes.includes(size)) {
      setSize(validSizes[0]);
    }
  }, [color, variants, currentProduct?.title]);

  // Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      try {
        if (currentProduct && currentProduct._id) {
          const { data: reviews } = await reviewAPI.getProductReviews(currentProduct._id);
          setReviews(reviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    }

    if (currentProduct) {
      fetchReviews();
    }
  }, [currentProduct]);

  const handleAddToCart = () => {
    if (!currentProduct || !size || !color) {
      toast.error("Please select size and color.");
      return;
    }
    
    const key = `${currentProduct._id}-${size}-${color}`;
    
    // Find the selected variant
    const selectedVariant = variants.find(
      (v) => v.size === size && v.color === color
    );
    
    if (!selectedVariant) {
      toast.error("Selected variant not found.");
      return;
    }
    
    addItem(
      key,
      1,
      {
        price: selectedVariant.price,
        name: currentProduct.title,
        size,
        color,
        image: selectedVariant.images?.[0] || currentProduct.images?.[0],
        productId: currentProduct._id,
      },
    );
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      // Save the current path to navigate back after login
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    
    if (!currentProduct || !size || !color) {
      toast.error("Please select size and color.");
      return;
    }
    
    const key = `${currentProduct._id}-${size}-${color}`;
    
    // Find the selected variant
    const selectedVariant = variants.find(
      (v) => v.size === size && v.color === color
    );
    
    if (!selectedVariant) {
      toast.error("Selected variant not found.");
      return;
    }
    
    addItem(
      key,
      1,
      {
        price: selectedVariant.price,
        name: currentProduct.title,
        size,
        color,
        image: selectedVariant.images?.[0] || currentProduct.images?.[0],
        productId: currentProduct._id,
      },
    );
    navigate("/checkout");
  };

  const selectedVariant = currentProduct && variants.length > 0
    ? variants.find((v) => v.size === size && v.color === color)
    : null;

  if (productLoading) {
    return <Loader />;
  }

  if (productError) {
    return <div className="text-center text-red-500 text-lg mt-10">{productError}</div>;
  }

  if (!currentProduct) {
    return <div className="text-center text-red-500 text-lg mt-10">Product not found.</div>;
  }

   return (
    <section className="text-gray-800 body-font overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container px-5 py-10 mx-auto">
        <ProductBreadcrumb product={currentProduct} />
        
        <div className="lg:w-4/5 mx-auto flex flex-wrap">
          <ProductGallery 
            product={
              selectedVariant && selectedVariant.images 
                ? { ...currentProduct, images: selectedVariant.images }
                : currentProduct.variants[0]
            } 
          />
          
          <div className="lg:w-1/2 w-full lg:pl-10 mt-6 lg:mt-0">
            <ProductDetails 
              product={currentProduct} 
              reviews={reviews}
              color={color}
              size={size}
            />
            
            <ColorAndSizeSelector 
              product={currentProduct}
              variants={variants}
              color={color}
              size={size}
              setColor={handleColorChange}
              setSize={setSize}
            />
            
            <ProductActions 
              product={currentProduct}
              color={color}
              size={size}
              variants={variants}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>
        </div>

        <ProductTabs 
          product={currentProduct} 
          reviews={reviews}
          setReviews={setReviews}
        />
      </div>
    </section>
  );
}