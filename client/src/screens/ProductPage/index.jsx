import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../../components/Loader";
import {  reviewAPI } from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { fetchProducts } from "../../redux/features/product/productSlice";
import ProductGallery from "../../components/ProductPage/ProductGallery";
import ProductDetails from "../../components/ProductPage/ProductDetails";
import ColorAndSizeSelector from    "../../components/ProductPage/ColorAndSizeSelector";
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

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [reviews, setReviews] = useState([]);

  // Fetch product + variants
  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  useEffect(() => {
    let foundProduct = null;
    if (products && products.length > 0) {
      foundProduct = products.find((p) => p.slug === slug);
    }
    if (foundProduct) {
      setProduct(foundProduct);
      setColor(foundProduct.color || "");
      setSize(foundProduct.size || "");
      setError(null);
      setIsLoading(false);
      
      if (Array.isArray(foundProduct.variants) && foundProduct.variants.length > 0) {
        setVariants(foundProduct.variants);
      } else {
        setVariants(products.filter((v) => v.title === foundProduct.title));
      }
    } else if (products && products.length > 0) {
      setError("Product not found.");
      setProduct(null);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [slug, products]);

  // When color changes, set size to valid size
  useEffect(() => {
    if (!color || !variants.length) return;
    const validSizes = variants
      .filter((v) => v.color === color && v.title === product?.title && v.availableQty > 0)
      .map((v) => v.size);
      
    if (validSizes.length && !validSizes.includes(size)) {
      setSize(validSizes[0]);
    }
  }, [color, variants, product?.title]);

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
    dispatch(addToCart({
      key,
      qty: 1,
      itemDetails: {
        price: product.price,
        name: product.title,
        size,
        color,
        image: product.images?.[0],
        productId: product._id,
      },
    }));
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
    dispatch(addToCart({
      key,
      qty: 1,
      itemDetails: {
        price: product.price,
        name: product.title,
        size,
        color,
        image: product.images?.[0],
        productId: product._id,
      },
    }));
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
          <ProductGallery product={product} />
          
          <div className="lg:w-1/2 w-full lg:pl-10 mt-6 lg:mt-0">
            <ProductDetails 
              product={product} 
              reviews={reviews}
              color={color}
              size={size}
            />
            
            <ColorAndSizeSelector 
              product={product}
              variants={variants}
              color={color}
              size={size}
              setColor={setColor}
              setSize={setSize}
            />
            
            <ProductActions 
              product={product}
              color={color}
              size={size}
              variants={variants}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>
        </div>

        <ProductTabs 
          product={product} 
          reviews={reviews}
          setReviews={setReviews}
        />
      </div>
    </section>
  );
}