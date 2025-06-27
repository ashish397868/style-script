import { useEffect, useState } from "react";
import { useCartStore } from "../../store/cartStore";
import { useProductStore } from "../../store/productStore";
import { Link, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiShoppingBag, FiTruck } from "react-icons/fi";

function Success() {
  const navigate = useNavigate();
  const { products } = useProductStore();
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const [orderDetails, setOrderDetails] = useState({
    orderId: `#ORD-${Math.floor(Math.random() * 900000 + 100000)}`,
    items: Object.keys(cart).length,
    total: Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0),
    estimatedDelivery: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 4);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    })()
  });

  // Clear cart on mount
  useEffect(() => {
    clearCart();
    // eslint-disable-next-line
  }, []);

  // Get purchased products from cart
  const purchasedProducts = Object.values(cart)
    .map(item => {
      if (products && products.length > 0) {
        return products.find(p => p._id === item.productId) || item;
      }
      return item;
    })
    .slice(0, 4);

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
                  <p className="text-lg font-bold text-indigo-600">{orderDetails.orderId}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Total Items</h4>
                  <p className="text-lg font-bold">{orderDetails.items} items</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Total Amount</h4>
                  <p className="text-lg font-bold">₹{orderDetails.total.toLocaleString()}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Estimated Delivery</h4>
                  <div className="flex items-center">
                    <FiTruck className="text-indigo-600 mr-2" />
                    <p className="text-lg font-bold">{orderDetails.estimatedDelivery}</p>
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
        
        {/* Purchased Products */}
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Purchased Items</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {purchasedProducts.length > 0 ? purchasedProducts.map((item, i) => (
            <Link
              key={item.productId || item._id || i}
              to={item.slug ? `/product/${item.slug}` : '#'}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                <img
                  src={item.image || (item.images && item.images[0]) || "/placeholder-image.jpg"}
                  alt={item.name || item.title}
                  className="w-full h-40 object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">
                  {item.name || item.title}
                </h4>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2 h-10">
                  {item.description || ''}
                </p>
                <span className="font-bold text-gray-900">₹{item.price}</span>
              </div>
            </Link>
          )) : (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-40" />
                </div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Success;