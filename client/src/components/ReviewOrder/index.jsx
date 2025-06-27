import { useCartStore } from "../../store/cartStore";
import { useCheckoutStore } from "../../store/checkoutStore";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiTruck, FiCreditCard, FiArrowLeft, FiCheck, FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";

export default function ReviewOrder() {
  const cart = useCartStore((state) => state.cart);
  const subTotal = useCartStore((state) => state.subTotal);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const selectedAddress = useCheckoutStore((state) => state.selectedAddress);

  const navigate = useNavigate();
  const [isPaying, setIsPaying] = useState(false);

  // Redirect if no address is selected
  if (!selectedAddress) {
    navigate('/checkout');
    return null;
  }

  const handleIncrease = (key, item) => {
    addToCart(key, 1, item);
  };

  const handleDecrease = (key) => {
    removeFromCart(key, 1);
  };

  const handleRemove = (key) => {
    removeFromCart(key, cart[key].qty);
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

    const res = await loadRazorpayScript();
    if (!res) {
      alert("Failed to load Razorpay SDK. Please try again.");
      setIsPaying(false);
      return;
    }

    // Send order creation request to server
    let orderId = null;
    try {
      const user = JSON.parse(localStorage.getItem('user-storage'))?.state?.user;
      const orderIdStr = `ORD-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      const productsArr = Object.values(cart).map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.qty,
        size: item.size,
        color: item.color
      }));
      if (!productsArr.length) {
        alert("No products in cart.");
        setIsPaying(false);
        return;
      }
      const phone = selectedAddress.phone || user?.phone;
      if (!phone) {
        alert("No phone number found in address or user profile.");
        setIsPaying(false);
        return;
      }
      const orderPayload = {
        email: user?.email,
        name: user?.name,
        phone,
        orderId: orderIdStr,
        products: productsArr,
        address: {
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
        },
        amount: orderTotal,
      };
      const orderRes = await import("../../services/api").then(m => m.orderAPI.createOrder(orderPayload));
      orderId = orderRes.data.order._id;
    } catch (e) {
      alert("Failed to create order. Please try again.");
      setIsPaying(false);
      return;
    }

    const options = {
      key: "rzp_test_rcDlQK0nZIkMpa", // 🔁 Replace with your Razorpay key
      amount: subTotal * 100,
      currency: "INR",
      name: "StyleScript Store",
      description: "Order Payment",
      handler: function (response) {
        clearCart();
        navigate(`/success/${orderId}`);
      },
      prefill: {
        name: "", // Optional: prefill user name
        email: "", // Optional: prefill user email
        contact: "", // Optional: prefill phone
      },
      theme: {
        color: "#6366f1",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setIsPaying(false);
  };

  // Calculate shipping cost (free for orders over ₹999)
  const shippingCost = subTotal >= 999 ? 0 : 99;
  const orderTotal = subTotal + shippingCost;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/checkout')}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
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
                <FiTruck className="text-indigo-600 mr-2" />
                Delivery Address
              </h2>
              <button
                onClick={() => navigate('/checkout')}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Change Address
              </button>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
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
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(cart).map(([key, item]) => (
                  <div 
                    key={key} 
                    className="flex flex-col sm:flex-row items-start sm:items-center border-b border-gray-100 pb-6 last:border-0"
                  >
                    <div className="flex-shrink-0 mb-4 sm:mb-0">
                      <img
                        src={item.image || "/placeholder-image.jpg"}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                      />
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
                            <button
                              onClick={() => handleDecrease(key)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                            >
                              <FiMinus />
                            </button>
                            <span className="px-3 py-1">{item.qty}</span>
                            <button
                              onClick={() => handleIncrease(key, item)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                            >
                              <FiPlus />
                            </button>
                          </div>
                          <p className="font-medium text-gray-900 mt-2">₹{(item.price * item.qty).toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <button
                          onClick={() => handleRemove(key)}
                          className="text-red-600 hover:text-red-800 flex items-center text-sm"
                        >
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
                <span className="font-medium">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `₹${shippingCost.toFixed(2)}`
                  )}
                </span>
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
                <FiCreditCard className="text-indigo-600 mr-2" />
                Payment Method
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-2 rounded mr-3">
                    <FiCreditCard className="text-indigo-600" />
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
              className={`w-full mt-8 py-3 rounded-xl font-bold text-lg flex items-center justify-center ${
                Object.keys(cart).length === 0 || isPaying
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg"
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
            
            <p className="text-center text-gray-500 text-sm mt-4">
              Your personal data will be used to process your order, support your experience throughout this website, 
              and for other purposes described in our privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}