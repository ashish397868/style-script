import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import { orderAPI } from "../../services/api";
import { FiShoppingBag, FiTruck, FiChevronRight } from "react-icons/fi";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await orderAPI.getMyOrders();
        setOrders(res.data || []);
        setError(null);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to fetch orders. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BeatLoader color="#6366f1" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <FiShoppingBag className="text-indigo-600 mr-2" />
          My Orders
        </h2>
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-lg text-gray-600 mb-4">You have not placed any orders yet.</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow flex flex-col md:flex-row items-center md:items-stretch p-6 gap-6 border border-gray-100"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {order.products?.slice(0, 3).map((product) => (
                      <img
                        key={product._id}
                        src={product.image || product.images?.[0] || "/placeholder.png"}
                        alt={product.name || "Product image"}
                        className="w-16 h-16 object-cover rounded-lg border bg-gray-100"
                        onError={e => { e.target.onerror = null; e.target.src = "/placeholder.png"; }}
                      />
                    ))}
                    {order.products?.length > 3 && (
                      <span className="ml-2 text-gray-500 text-sm self-center">+{order.products.length - 3} more</span>
                    )}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium text-gray-700">Order #</span>
                    <span className="font-mono text-indigo-600 ml-1 break-all">{order._id}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-medium text-gray-700">Total:</span>
                    <span className="text-gray-900 ml-1">₹{order.amount?.toLocaleString()}</span>
                  </div>
                  <div className="mb-1 flex items-center">
                    <FiTruck className="text-indigo-600 mr-1" />
                    <span className="text-gray-700">{order.deliveryStatus || "Processing"}</span>
                  </div>
                  <div className="mb-1 text-gray-500 text-sm">
                    Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <Link
                    to={`/order/${order._id}`}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium"
                  >
                    View Details <FiChevronRight className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}