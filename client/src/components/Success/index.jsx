import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheckCircle, FiShoppingBag, FiTruck } from "react-icons/fi";
import { BeatLoader } from "react-spinners";
import { orderAPI } from "../../services/api";

export function Success() {
  const { id } = useParams();
  // const id="6856f82a8176d9964b05db41"
  console.log("Id  -   ",id)
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      try {
        const res = await orderAPI.getOrderById(id);
        setOrderDetails(res.data);
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
      <div className="min-h-screen flex items-center justify-center">
        <BeatLoader color="#6366f1" />
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        {error || "Order not found."}
      </div>
    );
  }

  const { _id, items, deliveryStatus, amount, estimatedDelivery, products = [] } = orderDetails;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
            <div className="inline-block bg-white p-4 rounded-full mb-6">
              <FiCheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Order Placed Successfully!</h2>
            <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
              Thank you for your purchase. Your order has been placed and is being processed.
            </p>
          </div>
          {console.log(orderDetails)}
          <div className="p-8">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FiShoppingBag className="text-indigo-600 mr-2" />
                Order Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Order Number</h4>
                  <p className="text-lg font-bold text-indigo-600">{_id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Total Items</h4>
                  <p className="text-lg font-bold">{products?.length || 0} items</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Total Amount</h4>
                  <p className="text-lg font-bold">₹{amount?.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Estimated Delivery</h4>
                  <div className="flex items-center">
                    <FiTruck className="text-indigo-600 mr-2" />
                    <p className="text-lg font-bold">{estimatedDelivery || "3-5 business days"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Next Steps */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-indigo-100 text-indigo-600 rounded-full p-2 mr-4">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Order Confirmation</h4>
                    <p className="text-gray-600">We've sent a confirmation email with your order details.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-indigo-100 text-indigo-600 rounded-full p-2 mr-4">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Order Processing</h4>
                    <p className="text-gray-600">Your order is being prepared for shipment.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-indigo-100 text-indigo-600 rounded-full p-2 mr-4">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Delivery</h4>
                    <p className="text-gray-600">Your order will be shipped and delivered within 3-5 business days.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/" 
                className="flex-1 text-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium"
              >
                Continue Shopping
              </Link>
              <Link 
                to="/orders" 
                className="flex-1 text-center px-6 py-3 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium"
              >
                View Order Details
              </Link>
            </div>
          </div>
        </div>
        

      </div>
    </div>
  );
}

export default Success;