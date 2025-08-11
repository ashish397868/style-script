import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../../components/Loader";
import { accessoryAPI, reviewAPI } from "../../services/api";
import useCart from "../../redux/features/cart/useCartHook";
import ProductGallery from "../../components/ProductPage/ProductGallery";
import ProductDetails from "../../components/ProductPage/ProductDetails";
import ColorAndSizeSelector from "../../components/ProductPage/ColorAndSizeSelector";
import ProductTabs from "../../components/ProductPage/ProductTabs";
import ProductBreadcrumb from "../../components/ProductPage/BreadCrumb";
import ProductActions from "../../components/ProductPage/ProductActions";
import "react-toastify/dist/ReactToastify.css";
import ProductSpecifications from "../../components/ProductPage/ProductSpecification";

export default function AccessoryDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [accessory, setAccessory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [variants, setVariants] = useState([]);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");

  // helper: unique values
  const unique = (arr) => [...new Set(arr.filter(Boolean))];

  // fetch accessory
  useEffect(() => {
    async function fetchAccessory() {
      try {
        setLoading(true);
        const { data } = await accessoryAPI.getAccessoryBySlug(slug);

        setAccessory(data);

        // prefer in-stock variants — keeps selector meaningful
        const inStock = Array.isArray(data.variants) ? data.variants.filter((v) => v.availableQty > 0) : [];

        const useVariants = inStock.length > 0 ? inStock : Array.isArray(data.variants) ? data.variants : [];

        setVariants(useVariants);

        // set sensible defaults from first variant if available
        if (useVariants.length > 0) {
          setColor(useVariants[0]?.color ?? "");
          setSize(useVariants[0]?.size ?? "");
        } else {
          setColor("");
          setSize("");
        }

        setError("");
      } catch (err) {
        console.error("Error fetching accessory:", err);
        setError("Accessory not found.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchAccessory();
  }, [slug]);

  // fetch reviews (no redux)
  useEffect(() => {
    async function fetchReviews() {
      try {
        if (!accessory?._id) return;
        const { data } = await reviewAPI.getProductReviews(accessory._id);
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    }
    fetchReviews();
  }, [accessory]);

  // when color changes, ensure size is valid for that color
  useEffect(() => {
    if (!color || !variants.length) return;
    const validSizes = variants
      .filter((v) => v.color === color && v.availableQty > 0)
      .map((v) => v.size)
      .filter(Boolean);

    if (validSizes.length && !validSizes.includes(size)) {
      setSize(validSizes[0]);
    }
  }, [color, variants]);

  // derived lists for UI
  const availableColors = unique(variants.map((v) => v.color));
  const availableSizes = unique(variants.map((v) => v.size));

  // currently selected variant
  const selectedVariant = variants.length > 0 ? variants.find((v) => (size ? v.size === size : true) && (color ? v.color === color : true)) || null : null;

  // Add to cart
  const handleAddToCart = () => {
    if (!accessory) {
      toast.error("Accessory not found.");
      return;
    }

    // if there are variants, require appropriate selections
    if (variants.length > 0) {
      // if multiple colors exist require color
      if (availableColors.length > 1 && !color) {
        toast.error("Please select a color.");
        return;
      }
      // if multiple sizes exist require size
      if (availableSizes.length > 1 && !size) {
        toast.error("Please select a size.");
        return;
      }

      if (!selectedVariant) {
        toast.error("Selected variant not found.");
        return;
      }
      if (selectedVariant.availableQty <= 0) {
        toast.error("Selected variant is out of stock.");
        return;
      }

      const key = `${accessory._id}-${selectedVariant.size}-${selectedVariant.color}`;

      addItem(key, 1, {
        price: selectedVariant.price,
        name: accessory.title,
        size: selectedVariant.size,
        color: selectedVariant.color,
        image: selectedVariant.images?.[0] || accessory.images?.[0],
        productId: accessory._id,
        variantId: selectedVariant._id,
      });

      toast.success("Added to cart!");
      return;
    }

    // no variants: use basePrice or maxPrice fallback
    const price = accessory.basePrice ?? accessory.maxPrice ?? 0;
    const key = `${accessory._id}-NA-NA`;
    addItem(key, 1, {
      price,
      name: accessory.title,
      size: null,
      color: null,
      image: accessory.images?.[0],
      productId: accessory._id,
    });
    toast.success("Added to cart!");
  };

  // Buy now
  const handleBuyNow = () => {
    if (!accessory) {
      toast.error("Accessory not found.");
      return;
    }

    if (variants.length > 0 && !selectedVariant) {
      toast.error("Please select a valid variant before buying.");
      return;
    }

    const variant = selectedVariant;
    const price = variant ? variant.price : accessory.basePrice ?? accessory.maxPrice ?? 0;
    const key = `${accessory._id}-${variant ? `${variant.size}-${variant.color}` : "NA-NA"}`;

    addItem(key, 1, {
      price,
      name: accessory.title,
      size: variant?.size ?? null,
      color: variant?.color ?? null,
      image: variant?.images?.[0] || accessory.images?.[0],
      productId: accessory._id,
      variantId: variant?._id,
    });

    navigate("/checkout");
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 text-lg mt-10">{error}</div>;
  if (!accessory) return null;

  return (
    <section className="text-gray-800 body-font overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container px-5 py-10 mx-auto">
        <ProductBreadcrumb product={accessory} />

        <div className="lg:w-4/5 mx-auto flex flex-wrap">
          {/* LEFT COLUMN */}
          <div className="lg:w-1/2 w-full">
            <ProductGallery
              product={selectedVariant && selectedVariant.images?.length ? { ...accessory, images: selectedVariant.images } : accessory.variants?.[0]?.images?.length ? { ...accessory, images: accessory.variants[0].images } : accessory}
            />

            <ProductSpecifications specs={accessory.specifications} />
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:w-1/2 w-full lg:pl-10 mt-6 lg:mt-0">
            <ProductDetails product={accessory} reviews={reviews} />

            {variants.length > 0 && <ColorAndSizeSelector product={accessory} variants={variants} color={color} size={size} setColor={setColor} setSize={setSize} />}

            <ProductActions product={accessory} selectedVariant={selectedVariant} color={color} size={size} variants={variants} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
          </div>
        </div>

        <ProductTabs product={accessory} reviews={reviews} setReviews={setReviews} />
      </div>
    </section>
  );
}
