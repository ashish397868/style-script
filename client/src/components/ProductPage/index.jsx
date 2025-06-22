// src/pages/ProductDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import { productAPI } from "../../services/api";
import { useCartStore } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";

import PincodeChecker from "../../components/PincodeChecker";
import ReviewForm from "../../components/ReviewForm";
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

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [service, setService] = useState(null);

  const addToCart = useCartStore((s) => s.addToCart);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const user = useUserStore((s) => s.user);

  // Fetch product + variants
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const { data: prod } = await productAPI.getProductBySlug(slug);
        setProduct(prod);
        const { data: allVariants } = await productAPI.getAllProducts({ title: prod.title });
        setVariants(allVariants);
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

  // Filter options
  const colorOptions = Array.from(
    new Set(
      variants
        .filter((v) => v.availableQty > 0 && (!size || v.size === size))
        .map((v) => v.color)
        .filter(Boolean)
    )
  );

  const sizeOptions = Array.from(
    new Set(
      variants
        .filter((v) => v.availableQty > 0 && v.color === color)
        .map((v) => v.size)
        .filter(Boolean)
    )
  );

  // Update product when color/size changes
  useEffect(() => {
    if (!color || !size) return;
    const match = variants.find((v) => v.color === color && v.size === size);
    if (match) setProduct(match);
  }, [color, size, variants]);

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
    // Add selected product to cart (if not already)
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
    <section className="text-gray-600 body-font overflow-hidden">
      <ToastContainer />
      <div className="container px-5 py-16 mx-auto">
        <div className="lg:w-4/5 mx-auto flex flex-wrap">
          <img
            className="lg:w-1/2 w-full lg:h-auto px-24 object-cover object-top rounded"
            alt={product.title}
            src={product.images?.[0] || "/placeholder-image.jpg"}
          />

          <div className="lg:w-1/2 w-full lg:pl-10 mt-6 lg:mt-0">
            <h2 className="text-sm title-font text-gray-500 tracking-widest">
              {product.brand || "Brand"}
            </h2>
            <h1 className="text-gray-900 text-3xl title-font font-medium mb-1">
              {product.title} {size && color ? `(${size}/${color})` : ""}
            </h1>
            <p className="leading-relaxed">{product.description}</p>

            {/* Color & Size */}
            <div className="flex mt-6 items-center pb-5 border-b-2 border-gray-100 mb-5">
              <div className="flex">
                <span className="mr-3">Color</span>
                {colorOptions.map((c) => (
                  <ColorButton key={c} color={c} isActive={color === c} onClick={() => setColor(c)} />
                ))}
              </div>
              <div className="flex ml-6 items-center">
                <span className="mr-3">Size</span>
                <SizeSelect sizes={sizeOptions} value={size} onChange={(e) => setSize(e.target.value)} />
              </div>
            </div>

            {/* Price & Buttons */}
            <div className="flex items-center">
              {product.availableQty > 0 ? (
                <span className="text-2xl font-medium text-gray-900">₹{product.price}</span>
              ) : (
                <span className="text-2xl font-medium text-red-500">Out of Stock!</span>
              )}
              <button
                disabled={product.availableQty <= 0}
                onClick={handleAddToCart}
                className="ml-4 text-white bg-indigo-500 py-2 px-4 md:px-6 rounded hover:bg-indigo-600 disabled:bg-indigo-300"
              >
                Add to Cart
              </button>
              <button
                disabled={product.availableQty <= 0}
                onClick={handleBuyNow}
                className="ml-4 text-white bg-indigo-500 py-2 px-4 md:px-6 rounded hover:bg-indigo-600 disabled:bg-indigo-300"
              >
                Buy Now
              </button>
            </div>

            {/* Pincode & Review */}
            <PincodeChecker onCheck={(available) => setService(available)} />
            <ReviewForm productId={product._id} onSuccess={() => {}} />
          </div>
        </div>
      </div>
    </section>
  );
}
