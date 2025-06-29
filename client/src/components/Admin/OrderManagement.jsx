import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiTrash2, FiSearch, FiAlertTriangle, FiTruck } from 'react-icons/fi';
import { format } from 'date-fns';
import showToast from "../..//utils/toastUtils";
import Loader from '../Loader';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingData, setShippingData] = useState({
    shippingProvider: '',
    trackingId: '',
    deliveryStatus: 'shipped',
    status: '' // optional, for admin to update order status if needed
  });
  const ordersPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      showToast("Please provide a cancellation reason", "error");
      return;
    }

    try {
      await api.patch(
        `/orders/${selectedOrder._id}`,
        { 
          status: 'Cancelled',
          cancellationReason: cancelReason
        }
      );

      setOrders(orders.map(order => 
        order._id === selectedOrder._id ? { 
          ...order, 
          status: 'Cancelled',
          cancellationReason: cancelReason
        } : order
      ));

      setShowCancelModal(false);
      setCancelReason('');
      setSelectedOrder(null);
      showToast("Order cancelled successfully", "success");
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast("Failed to cancel order", "error");
    }
  };

  const handleUpdateShipping = async () => {
    if (!shippingData.shippingProvider.trim() || !shippingData.trackingId.trim()) {
      showToast("Please provide shipping provider and tracking ID", "error");
      return;
    }

    try {
      // Only send fields that are set (avoid sending empty status)
      const updatePayload = {
        deliveryStatus: shippingData.deliveryStatus,
        shippingProvider: shippingData.shippingProvider,
        trackingId: shippingData.trackingId
      };
      if (shippingData.status && shippingData.status.trim()) {
        updatePayload.status = shippingData.status;
      }
      await api.patch(
        `/orders/${selectedOrder._id}`,
        updatePayload
      );

      setOrders(orders.map(order => 
        order._id === selectedOrder._id ? { 
          ...order, 
          deliveryStatus: shippingData.deliveryStatus,
          shippingProvider: shippingData.shippingProvider,
          trackingId: shippingData.trackingId,
          ...(shippingData.status && shippingData.status.trim() ? { status: shippingData.status } : {})
        } : order
      ));

      setShowShippingModal(false);
      setShippingData({
        shippingProvider: '',
        trackingId: '',
        deliveryStatus: 'shipped',
        status: ''
      });
      setSelectedOrder(null);
      showToast("Shipping information updated successfully", "success");
    } catch (error) {
      console.error('Error updating shipping:', error);
      showToast("Failed to update shipping information", "error");
    }
  };

  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const openShippingModal = (order) => {
    setSelectedOrder(order);
    setShippingData({
      shippingProvider: order.shippingProvider || '',
      trackingId: order.trackingId || '',
      deliveryStatus: order.deliveryStatus || 'shipped',
      status: order.status || ''
    });
    setShowShippingModal(true);
  };

  const closeModal = () => {
    setShowCancelModal(false);
    setShowShippingModal(false);
    setCancelReason('');
    setShippingData({
      shippingProvider: '',
      trackingId: '',
      deliveryStatus: 'shipped',
      status: ''
    });
    setSelectedOrder(null);
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDelivery = deliveryFilter === 'all' || order.deliveryStatus === deliveryFilter;
    
    return matchesSearch && matchesStatus && matchesDelivery;
  });

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-700 p-6 text-white rounded-t-2xl">
        <h1 className="text-3xl font-bold flex items-center">
          <FiTruck className="h-8 w-8 mr-3" />
          Order Management
        </h1>
        <p className="mt-2 text-pink-200">View, filter, and manage all orders</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search Input */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Orders</label>
          <div className="relative">
            <div className="absolute top-1/2 left-3 transform -translate-y-1/2 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Initiated">Initiated</option>
            <option value="Processing">Processing</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Delivery Status Filter */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Delivery</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
          >
            <option value="all">All Delivery Statuses</option>
            <option value="unshipped">Unshipped</option>
            <option value="shipped">Shipped</option>
            <option value="out for delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.orderId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(order.createdAt), 'MMM dd, yyyy hh:mm a')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.products.map(p => p.name).join(', ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.products.reduce((sum, p) => sum + p.quantity, 0)} items
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      order.status === 'Cancelled' || order.status === 'Failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.deliveryStatus === 'returned' ? 'bg-red-100 text-red-800' :
                      order.deliveryStatus === 'unshipped' ? 'bg-gray-100 text-gray-800' :
                      'bg-pink-100 text-pink-800'
                    }`}>
                      {order.deliveryStatus}
                    </span>
                    {order.trackingId && (
                      <div className="text-xs text-gray-500 mt-1">
                        {order.shippingProvider}: {order.trackingId}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {order.status !== 'Cancelled' && order.status !== 'Failed' && (
                      <>
                        <button
                          onClick={() => openShippingModal(order)}
                          className="text-pink-600 hover:text-pink-900 flex items-center"
                        >
                          <FiTruck className="inline mr-1" /> Ship
                        </button>
                        <button
                          onClick={() => openCancelModal(order)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <FiAlertTriangle className="inline mr-1" /> Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Cancel Order</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              <div className="mb-4">
                <p className="mb-2">You are about to cancel this order:</p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p><strong>Order ID:</strong> #{selectedOrder.orderId}</p>
                  <p><strong>Customer:</strong> {selectedOrder.name}</p>
                  <p><strong>Products:</strong> {selectedOrder.products.map(p => p.name).join(', ')}</p>
                  <p><strong>Amount:</strong> ₹{selectedOrder.amount}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter the reason for cancellation..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Update Shipping</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              <div className="mb-4">
                <p className="mb-2">Shipping details for order:</p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p><strong>Order ID:</strong> #{selectedOrder.orderId}</p>
                  <p><strong>Customer:</strong> {selectedOrder.name}</p>
                  <p><strong>Address:</strong> {selectedOrder.address?.addressLine1}, {selectedOrder.address?.city}, {selectedOrder.address?.pincode}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Provider
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={shippingData.shippingProvider}
                  onChange={(e) => setShippingData({...shippingData, shippingProvider: e.target.value})}
                  placeholder="e.g., Shiprocket, Delhivery"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status (optional)
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={shippingData.status}
                  onChange={(e) => setShippingData({...shippingData, status: e.target.value})}
                >
                  <option value="">(No Change)</option>
                  <option value="Initiated">Initiated</option>
                  <option value="Processing">Processing</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking ID
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={shippingData.trackingId}
                  onChange={(e) => setShippingData({...shippingData, trackingId: e.target.value})}
                  placeholder="Enter tracking ID"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Status
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={shippingData.deliveryStatus}
                  onChange={(e) => setShippingData({...shippingData, deliveryStatus: e.target.value})}
                >
                  <option value="shipped">Shipped</option>
                  <option value="out for delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateShipping}
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                >
                  Update Shipping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default OrderManagement;