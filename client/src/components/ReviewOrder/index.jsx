import { useSelector } from "react-redux";
import useCartHook from "../../redux/features/cart/useCartHook"
import { paymentAPI, orderAPI } from "../../services/api";

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiTruck, FiCreditCard, FiArrowLeft, FiCheck, FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import useUser from "../../redux/features/user/useUserHook";

export default function ReviewOrder() {
  const cartHook = useCartHook();
  const { addItem, removeItem, clearItems, cart ,subTotal } = cartHook;

  const selectedAddress = useSelector((state) => state.checkout.selectedAddress);
  const { user, isAuthenticated, initializeAuth } = useUser();

  const navigate = useNavigate();
  const [isPaying, setIsPaying] = useState(false);

  // On mount, check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem("token")) {
      initializeAuth();
    } else if (!isAuthenticated && !localStorage.getItem("token")) {
      // Redirect to login if not authenticated and no token
      navigate("/login", { state: { from: "/review-order" } });
    }
  }, [isAuthenticated, initializeAuth, navigate]);

  // Redirect if no address is selected
  if (!selectedAddress) {
    navigate("/checkout");
    return null;
  }

  // Redirect if not authenticated
  if (!isAuthenticated && !user) {
    return null; // Return null while checking auth or redirecting
  }

  const handleIncrease = (key, item) => {
    addItem(key, 1 , item );
  };

  const handleDecrease = (key) => {
    removeItem(key, 1);
  };

  const handleRemove = (key) => {
    removeItem(key, cart[key].qty);
  };

  // Function to load Razorpay SDK dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

const handleBuy = async () => {
  setIsPaying(true);

  // First, verify we have authenticated user with email
  if (!isAuthenticated || !user) {
    alert("Please log in before checking out.");
    setIsPaying(false);
    navigate("/login", { state: { from: "/review-order" } });
    return;
  }

  if (!user.email) {
    alert("User email is required. Please update your profile.");
    setIsPaying(false);
    return;
  }

  // 1️⃣ Load SDK
  const res = await loadRazorpayScript();
  if (!res) {
    alert("Failed to load Razorpay SDK. Please try again.");
    setIsPaying(false);
    return;
  }

  // 2️⃣ Prepare to call your APIs
  let orderRes;
  let paymentOrderRes;
  let receiptId;
  try {
    // Check if user and email exist
    if (!user || !user.email) {
      throw new Error("User email not found. Please log in again.");
    }
    
    receiptId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    console.log("Cart at the time of checkout:", cart);

    // build products array from cart
    const productsArr = Object.values(cart).map((item) => ({
      _id: item.productId,             // Use _id as expected by the server
      productId: item.productId,       // Also include productId for compatibility
      size: item.size.toUpperCase().trim(),  // Server expects uppercase size
      color: item.color.toLowerCase().trim(), // Server expects lowercase color
      quantity: Number(item.qty),
      name: item.name,
      price: Number(item.price),
      image: item.image || ''
    }));
    if (!productsArr.length) {
      throw new Error("No products in cart");
    }
    
    // Validate each product has required fields
    productsArr.forEach(item => {
      console.log(item);
      if (!item._id || !item.size || !item.color || item.quantity <= 0) {
        throw new Error("Missing required product details");
      }
    });

    // ensure phone exists
    const phone = selectedAddress.phone || user?.phone;
    if (!phone) {
      throw new Error("No phone number found");
    }

    // 2a️⃣ – create your internal order record (orderId: receiptId)
    orderRes = await orderAPI.createOrder({
      email: user.email,
      name: user.name,
      phone,
      orderId: receiptId,
      products: productsArr,
      address: {
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        country: selectedAddress.country,
      },
      amount: orderTotal,
    });

    console.log("Order created:", orderRes.data);

    // 2b️⃣ – ask your backend to create the Razorpay order (receipt: receiptId)
    paymentOrderRes = await paymentAPI.createPaymentIntent({
      amount: orderTotal,
      currency: "INR",
      receipt: receiptId,
    });


    console.log("Razorpay Order:", paymentOrderRes.data.razorpayOrder);
  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to create order. Please try again.");
    setIsPaying(false);
    return;
  }

  // 3️⃣ Build Razorpay checkout options
  const { razorpayOrder: rzOrder } = paymentOrderRes.data;
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: rzOrder.amount,
    currency: rzOrder.currency,
    order_id: rzOrder.id,      // razorpay_order_id
    name: "StyleScript Store",
    description: "Order Payment",
    prefill: {
      name: user?.name || "",
      email: user?.email || "",
      contact: selectedAddress.phone || user?.phone || "",
    },
    theme: { color: "#6366f1" },
    handler: async (response) => {
      try {
        await paymentAPI.verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          receipt: receiptId, // always use the original receiptId
          email: user.email,
        });
        clearItems();
        navigate(`/success/${orderRes.data.order._id}`);
      } catch (verifyErr) {
        console.error(verifyErr);
        alert("Payment verification failed. Please contact support.");
        setIsPaying(false);
      }
    },
    modal: {
      ondismiss: () => {
        // This handles when user closes the modal
        setIsPaying(false);
      }
    }
  };

  // 4️⃣ Open checkout
  const rzp = new window.Razorpay(options);
  
  // Handle payment failure
  rzp.on('payment.failed', (response) => {
    console.error('Payment failed:', response.error);
    alert(`Payment failed: ${response.error.description}`);
    setIsPaying(false);
  });

  rzp.open();
};


  // Calculate shipping cost (free for orders over ₹999)
  const shippingCost = subTotal >= 999 ? 0 : 99;
  const orderTotal = subTotal + shippingCost;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate("/checkout")} className="flex items-center text-pink-600 hover:text-pink-800">
          <FiArrowLeft className="mr-2" /> Back to Checkout
        </button>
        <h1 className="text-3xl font-bold ml-4">Review Your Order</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <FiTruck className="text-pink-600 mr-2" />
                Delivery Address
              </h2>
              <button onClick={() => navigate("/checkout")} className="text-pink-600 hover:text-pink-800 text-sm font-medium">
                Change Address
              </button>
            </div>

            <div className="bg-pink-50 rounded-lg p-5 border border-pink-100">
              <p className="font-bold text-gray-900">{selectedAddress.name}</p>
              <p className="text-gray-700 mt-2">
                {selectedAddress.addressLine1}
                {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
              </p>
              <p className="text-gray-700">
                {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.pincode}
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-medium">Phone:</span> {selectedAddress.phone}
              </p>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {Object.keys(cart).length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Your cart is empty</h3>
                <p className="text-gray-600 mt-2">Add items to your cart to proceed</p>
                <button onClick={() => navigate("/")} className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-700">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(cart).map(([key, item]) => (
                  <div key={key} className="flex flex-col sm:flex-row items-start sm:items-center border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex-shrink-0 mb-4 sm:mb-0">
                      <img src={item.image || "/placeholder-image.jpg"} alt={item.name} className="w-24 h-24 object-contain rounded-xl border border-gray-200" />
                    </div>

                    <div className="flex-1 sm:ml-6">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Size: {item.size} | Color: {item.color}
                          </p>
                          <p className="font-medium text-gray-900 mt-2">₹{item.price}</p>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="flex items-center border border-gray-200 rounded-lg">
                            <button onClick={() => handleDecrease(key)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg">
                              <FiMinus />
                            </button>
                            <span className="px-3 py-1">{item.qty}</span>
                            <button onClick={() => handleIncrease(key, item)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg">
                              <FiPlus />
                            </button>
                          </div>
                          <p className="font-medium text-gray-900 mt-2">₹{(item.price * item.qty).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <button onClick={() => handleRemove(key)} className="text-red-600 hover:text-red-800 flex items-center text-sm">
                          <FiTrash2 className="mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-6">
            <h2 className="text-xl font-bold mb-6">Order Total</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{shippingCost === 0 ? <span className="text-green-600">Free</span> : `₹${shippingCost.toFixed(2)}`}</span>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <FiCreditCard className="text-pink-600 mr-2" />
                Payment Method
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-pink-100 p-2 rounded mr-3">
                    <FiCreditCard className="text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-gray-500 mt-1">Secured by Razorpay</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={Object.keys(cart).length === 0 || isPaying}
              className={`cursor-pointer w-full mt-8 py-3 rounded-xl font-bold text-lg flex items-center justify-center ${
                Object.keys(cart).length === 0 || isPaying ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 shadow-lg"
              }`}
            >
              {isPaying ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  <span>Pay ₹{orderTotal.toFixed(2)}</span>
                </>
              )}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
