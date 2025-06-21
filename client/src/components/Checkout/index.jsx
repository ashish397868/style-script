import { useState } from "react";
import { useUserStore } from "../../store/userStore";
import { useCartStore } from "../../store/cartStore";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from '../../services/api';

export default function Checkout() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const cart = useCartStore((state) => state.cart);
  const subTotal = useCartStore((state) => state.subTotal);

  // Pre-fill form with user info if available
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    addressLine1: user?.address?.addressLine1 || "",
    addressLine2: user?.address?.addressLine2 || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      const orderId = 'ORD-' + Date.now();
      const orderPayload = {
        email: form.email,
        name: form.name,
        orderId,
        products: Object.entries(cart).map(([key, item]) => ({
          productId: item._id || item.productId || key,
          name: item.name,
          price: item.price,
          quantity: item.qty,
          size: item.size,
          color: item.color,
        })),
        phone: form.phone,
        address: {
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        amount: subTotal,
      };
      await api.post('/orders', orderPayload);
      toast.success("Order placed successfully!");
      setTimeout(() => {
        navigate("/review-order");
      }, 1000);
    } catch (err) {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <section className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-10">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium">Address Line 1</label>
          <input name="addressLine1" value={form.addressLine1} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium">Address Line 2</label>
          <input name="addressLine2" value={form.addressLine2} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">City</label>
          <input name="city" value={form.city} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">State</label>
          <input name="state" value={form.state} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium">Pincode</label>
          <input name="pincode" value={form.pincode} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
        </div>
        <div className="col-span-2 mt-6">
          <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
          <div className="bg-gray-50 p-4 rounded">
            {Object.keys(cart).length === 0 ? (
              <div>Your cart is empty.</div>
            ) : (
              <ul>
                {Object.entries(cart).map(([key, item]) => (
                  <li key={key} className="flex justify-between border-b py-1">
                    <span>{item.name} ({item.size}/{item.color}) x {item.qty}</span>
                    <span>₹{item.price * item.qty}</span>
                  </li>
                ))}
                <li className="flex justify-between font-bold mt-2">
                  <span>Subtotal</span>
                  <span>₹{subTotal}</span>
                </li>
              </ul>
            )}
          </div>
        </div>
        <div className="col-span-2 flex justify-end mt-6">
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">Place Order</button>
        </div>
      </form>
    </section>
  );
}
