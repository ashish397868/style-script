import { useCartStore } from "../../store/cartStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ReviewOrder() {
  const cart = useCartStore((state) => state.cart);
  const subTotal = useCartStore((state) => state.subTotal);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const navigate = useNavigate();
  const [isPaying, setIsPaying] = useState(false);

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

    const options = {
      key: "rzp_test_rcDlQK0nZIkMpa", // 🔁 Replace with your Razorpay key
      amount: subTotal * 100,
      currency: "INR",
      name: "StyleScript Store",
      description: "Order Payment",
      handler: function (response) {
        clearCart();
        navigate("/success");
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

  return (
    <section className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6">Review Order</h2>

      {Object.keys(cart).length === 0 ? (
        <div>Your cart is empty.</div>
      ) : (
        <ul>
          {Object.entries(cart).map(([key, item]) => (
            <li key={key} className="flex items-center justify-between border-b py-2">
              <div>
                <span className="font-semibold">{item.name}</span>{" "}
                <span className="text-sm">({item.size}/{item.color})</span>
                <div className="text-sm text-gray-500">
                  ₹{item.price} x {item.qty}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDecrease(key)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  -
                </button>
                <span>{item.qty}</span>
                <button
                  onClick={() => handleIncrease(key, item)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
                <button
                  onClick={() => handleRemove(key)}
                  className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-between font-bold mt-4">
        <span>Subtotal</span>
        <span>₹{subTotal}</span>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleBuy}
          disabled={Object.keys(cart).length === 0 || isPaying}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPaying ? "Processing..." : "Buy"}
        </button>
      </div>
    </section>
  );
}
