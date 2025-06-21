import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import { productAPI } from "../../services/api";
import { useCartStore } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import "react-toastify/dist/ReactToastify.css";

// =============== ColorButton Component ===============
const ColorButton = ({ color, isActive, onClick }) => {
  const colorClasses = {
    Red: "bg-red-700",
    Purple: "bg-purple-950",
    "Sea Green": "bg-teal-400",
    Black: "bg-black",
    "Forest Green": "bg-green-700",
    Blue: "bg-blue-700",
    Maroon: "bg-red-900",
    Green: "bg-green-800",
  };

  return (
    <button
      onClick={onClick}
      className={`border-2 ${isActive ? "border-black" : "border-gray-300"} ml-1 ${colorClasses[color]} rounded-full w-6 h-6 focus:outline-none`}
    ></button>
  );
};

// =============== SizeSelect Component ===============
const SizeSelect = ({ sizes, value, onChange }) => (
  <div className="relative">
    <select
      onChange={onChange}
      value={value}
      className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10"
    >
      {sizes.map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
    <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    </span>
  </div>
);

// =============== PincodeChecker Component ===============
const PincodeChecker = ({ checkServicability, onChangePin, service }) => (
  <>
    <div className="flex space-x-2 mt-5">
      <input onChange={onChangePin} className="px-2 border border-gray-300 rounded" placeholder="Enter your Pincode" type="text" />
      <button onClick={checkServicability} className="text-white bg-indigo-500 py-2 px-6 rounded hover:bg-indigo-600">
        Check
      </button>
    </div>
    {service === false && <div className="text-red-700 text-sm mt-3">Sorry! We do not deliver to this pincode yet.</div>}
    {service === true && <div className="text-green-700 text-sm mt-3">Yay! We deliver to this pincode.</div>}
  </>
);

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [pin, setPin] = useState("");
  const [service, setService] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const addToCart = useCartStore((state) => state.addToCart);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await productAPI.getProductBySlug(slug);
        const prod = response.data;
        setProduct(prod);
        setColor(prod.color || "");
        setSize(prod.size || "");
        setError(null);
      } catch (err) {
        setError("Product not found.");
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || !size || !color) {
      toast.error("Please select size and color.");
      return;
    }
    // Create a unique key for the cart item (e.g., productId-size-color)
    const key = `${product._id}-${size}-${color}`;
    addToCart(key, 1, {
      price: product.price,
      name: product.title,
      size,
      color,
      image: product.images && product.images[0],
      productId: product._id,
    });
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user && user.address && user.phone) {
      setAddress(user.address);
      setPhone(user.phone);
      setShowAddressModal(true);
    } else {
      setAddress("");
      setPhone("");
      setShowAddressModal(true);
    }
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    // Here you would update the user info in backend/store if edited
    setShowAddressModal(false);
    toast.success("Proceeding to payment (demo only)");
  };

  const checkServicability = async () => {
    try {
      // Replace with your actual pincode API
      const response = await fetch("/api/get-pincode");
      const pinJson = await response.json();
      const available = Object.keys(pinJson).includes(pin);
      setService(available);
      toast[available ? "success" : "error"](
        available ? "We deliver to this pincode." : "We do not deliver here yet."
      );
    } catch (error) {
      toast.error("Failed to check pincode.");
    }
  };

  const onChangePin = (e) => setPin(e.target.value);

  const handleSizeChange = (e) => {
    setSize(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <BeatLoader visible={true} height="80" width="80" color="#4fa94d" radius="9" ariaLabel="three-dots-loading" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg mt-10">{error}</div>;
  }

  if (!product) return null;

  // Parse sizes and colors if they are comma-separated strings
  const sizeOptions = product.size ? (Array.isArray(product.size) ? product.size : product.size.split(",")) : [];
  const colorOptions = product.color ? (Array.isArray(product.color) ? product.color : product.color.split(",")) : [];

  return (
    <section className="text-gray-600 body-font overflow-hidden">
      <ToastContainer />
      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <form onSubmit={handleAddressSubmit} className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">Shipping Info</h2>
            <div className="mb-2">
              <label className="block text-sm">Address</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm">Phone</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-3 py-1 bg-gray-300 rounded" onClick={() => setShowAddressModal(false)}>Cancel</button>
              <button type="submit" className="px-3 py-1 bg-indigo-500 text-white rounded">Continue</button>
            </div>
          </form>
        </div>
      )}
      <div className="container px-5 py-16 mx-auto">
        <div className="lg:w-4/5 mx-auto flex flex-wrap">
          <img
            className="lg:w-1/2 w-full lg:h-auto px-24 object-cover object-top rounded"
            alt={product.title}
            src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder-image.jpg"}
          />
          <div className="lg:w-1/2 w-full lg:pl-10 mt-6 lg:mt-0">
            <h2 className="text-sm title-font text-gray-500 tracking-widest">{product.brand || "Brand"}</h2>
            <h1 className="text-gray-900 text-3xl title-font font-medium mb-1">
              {product.title} {size && color ? `(${size}/${color})` : ""}
            </h1>
            <p className="leading-relaxed">{product.description}</p>

            <div className="flex mt-6 items-center pb-5 border-b-2 border-gray-100 mb-5">
              <div className="flex">
                <span className="mr-3">Color</span>
                {colorOptions.map((c) => (
                  <ColorButton key={c} color={c} isActive={color === c} onClick={() => setColor(c)} />
                ))}
              </div>

              <div className="flex ml-6 items-center">
                <span className="mr-3">Size</span>
                <SizeSelect sizes={sizeOptions} value={size} onChange={handleSizeChange} />
              </div>
            </div>

            <div className="flex items-center">
              {product.availableQty >= 1 ? (
                <span className="text-2xl font-medium text-gray-900">₹{product.price}</span>
              ) : (
                <span className="text-2xl font-medium text-red-500">Out of Stock!</span>
              )}

              <button
                disabled={product.availableQty <= 0}
                className="ml-4 text-white bg-indigo-500 py-2 px-4 md:px-6 rounded hover:bg-indigo-600 disabled:bg-indigo-300"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>

              <button
                disabled={product.availableQty <= 0}
                className="ml-4 text-white bg-indigo-500 py-2 px-4 md:px-6 rounded hover:bg-indigo-600 disabled:bg-indigo-300"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            <div className="mt-4">
              <PincodeChecker checkServicability={checkServicability} onChangePin={onChangePin} service={service} />
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="mt-4">
                <span className="font-medium">Tags:</span>{" "}
                {product.tags.map((tag) => (
                  <span key={tag} className="inline-block bg-gray-200 rounded px-2 py-0.5 mx-1">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {product.isFeatured && (
              <div className="mt-2">
                <span className="bg-yellow-300 text-yellow-900 px-2 py-0.5 rounded text-xs font-bold">
                  Featured
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
