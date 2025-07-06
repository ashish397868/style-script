import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "../../components/Loader"; 
import { orderAPI } from "../../services/api";
import { FiChevronLeft, FiTruck, FiShoppingBag } from "react-icons/fi";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      try {
        const res = await orderAPI.getOrderById(id);
        setOrder(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
 <Loader />
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        {error || "Order not found."}
      </div>
    );
  }

  const { _id, products = [], amount, deliveryStatus, estimatedDelivery, createdAt, address } = order;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/orders" className="inline-flex items-center text-pink-600 hover:underline mb-6">
          <FiChevronLeft className="mr-1" /> Back to Orders
        </Link>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 text-white flex items-center justify-between">
            <div className="flex items-center">
              <FiShoppingBag className="h-8 w-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Order #{_id}</h2>
                <div className="text-pink-100 text-sm">Placed on {createdAt ? new Date(createdAt).toLocaleDateString() : "-"}</div>
              </div>
            </div>
            <div className="flex items-center">
              <FiTruck className="mr-2" />
              <span className="font-semibold">{deliveryStatus || "Processing"}</span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Products</h3>
            <div className="divide-y divide-gray-100 mb-6">
              {products.map((product) => (
                <div key={product._id} className="flex items-center py-4 gap-4">
                  <img
                    src={product.image || "/placeholder.png"}
                    alt={product.name || "Product image"}
                    className="w-16 h-16 object-contain rounded-lg border"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{product.name || "Product"}</div>
                    <div className="text-gray-500 text-sm">Qty: {product.quantity || 1}</div>
                  </div>
                  <div className="font-semibold text-gray-900">₹{product.price?.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="mb-2 flex justify-between items-center">
              <span className="font-medium text-gray-700">Delivery Charges</span>
              <span className="text-gray-900 font-semibold">₹99</span>
            </div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-1">Shipping Address</h4>
              <div className="text-gray-900 text-sm">
                {address?.name && <div>{address.name}</div>}
                {address?.street && <div>{address.street}</div>}
                {address?.city && address?.state && (
                  <div>{address.city}, {address.state}</div>
                )}
                {address?.pincode && <div>Pincode: {address.pincode}</div>}
                {address?.phone && <div>Phone: {address.phone}</div>}
              </div>
            </div>
            <div className="flex justify-between items-center border-t pt-4">
              <div className="font-bold text-lg">Total Paid</div>
              <div className="font-bold text-pink-600 text-lg">₹{amount?.toLocaleString()}</div>
            </div>
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
