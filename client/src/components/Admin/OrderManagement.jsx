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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-700 p-4 md:p-6 text-white rounded-t-lg md:rounded-t-2xl">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h2a1 1 0 011 1v1h6V3a1 1 0 011-1h2a1 1 0 011 1v1h1a1 1 0 011 1v2a1 1 0 01-1 1h-1v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7H2a1 1 0 01-1-1V4a1 1 0 011-1h1V3zm2 2V4H4v1h1zm10 0V4h-1v1h1zM4 7v8a1 1 0 001 1h10a1 1 0 001-1V7H4z" clipRule="evenodd" />
            </svg>
            Order Management
          </h1>
          <p className="mt-1 text-sm md:text-base text-pink-200">View, filter, and manage all customer orders</p>
        </div>
        <div className="bg-white rounded-b-lg md:rounded-b-2xl shadow-xl overflow-hidden p-4 md:p-6">

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

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  <div className="flex flex-col items-center justify-center">
                    <svg 
                      className="h-16 w-16 text-gray-300 mb-4" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No orders found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentOrders.map(order => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">#{order.orderId}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(order.createdAt), 'PP')}
                      </div>
                      <div className="text-sm font-medium text-gray-900 mt-1">₹{order.amount}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.products.map((p, i) => (
                        <div key={i} className="mb-1">
                          {p.name} ({p.size}, {p.color}) x {p.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.name}</div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                          order.status === 'Failed' ? 'bg-red-100 text-red-800' : 
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {order.status}
                      </span>
                      
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' : 
                          order.deliveryStatus === 'shipped' || order.deliveryStatus === 'out for delivery' ? 'bg-blue-100 text-blue-800' : 
                          order.deliveryStatus === 'returned' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {order.deliveryStatus ? order.deliveryStatus.charAt(0).toUpperCase() + order.deliveryStatus.slice(1) : 'Unshipped'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => openShippingModal(order)}
                        className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        <FiTruck className="inline mr-1" /> 
                        {order.deliveryStatus === 'unshipped' || !order.deliveryStatus ? 'Ship' : 'Update'}
                      </button>
                      
                      {order.status !== 'Cancelled' && (
                        <button
                          onClick={() => openCancelModal(order)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                        >
                          <FiAlertTriangle className="inline mr-1" /> 
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Order Cards */}
      <div className="md:hidden">
        {currentOrders.length === 0 ? (
          <div className="text-center py-6">
            <div className="flex flex-col items-center justify-center">
              <svg 
                className="h-16 w-16 text-gray-300 mb-4" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No orders found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map(order => (
              <div key={order._id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">#{order.orderId}</span>
                    <p className="text-xs text-gray-500">
                      {format(new Date(order.createdAt), 'PP')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">₹{order.amount}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                    ${order.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Failed' ? 'bg-red-100 text-red-800' : 
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                  
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                    ${order.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' : 
                      order.deliveryStatus === 'shipped' || order.deliveryStatus === 'out for delivery' ? 'bg-blue-100 text-blue-800' : 
                      order.deliveryStatus === 'returned' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {order.deliveryStatus ? order.deliveryStatus.charAt(0).toUpperCase() + order.deliveryStatus.slice(1) : 'Unshipped'}
                  </span>
                </div>
                
                <div className="border-t border-gray-100 pt-2 mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Customer:</p>
                  <p className="text-sm text-gray-600">{order.name}</p>
                  <p className="text-sm text-gray-500">{order.email}</p>
                </div>
                
                <div className="border-t border-gray-100 pt-2 mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Products:</p>
                  {order.products.map((p, i) => (
                    <div key={i} className="text-sm text-gray-600">
                      {p.name} ({p.size}, {p.color}) x {p.quantity}
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-100 pt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => openShippingModal(order)}
                    className="inline-flex items-center px-3 py-1 border border-indigo-600 text-sm leading-4 font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none transition-colors"
                  >
                    <FiTruck className="mr-1" /> 
                    {order.deliveryStatus === 'unshipped' || !order.deliveryStatus ? 'Ship' : 'Update'}
                  </button>
                  
                  {order.status !== 'Cancelled' && (
                    <button
                      onClick={() => openCancelModal(order)}
                      className="inline-flex items-center px-3 py-1 border border-red-600 text-sm leading-4 font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none transition-colors"
                    >
                      <FiAlertTriangle className="mr-1" /> 
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastOrder, filteredOrders.length)}
                </span>{' '}
                of <span className="font-medium">{filteredOrders.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">First</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 5) return true;
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis
                    if (index > 0 && page > array[index - 1] + 1) {
                      return (
                        <span key={`ellipsis-${page}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      );
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Last</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
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
                  <option value="unshipped">Unshipped</option>
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
    </div>
  );
};

export default OrderManagement;