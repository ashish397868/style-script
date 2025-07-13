import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiSettings, FiLogOut, FiBox, FiShoppingCart, FiCheckCircle, FiXCircle, FiMessageSquare, FiDollarSign, FiList, FiMenu, FiX } from 'react-icons/fi';
import Loader from '../Loader';

import api from '../../services/api';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle screen resize to toggle sidebar automatically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Set initial state based on screen size
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get active tab from current location
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'dashboard';
    if (path.includes('/admin/orders')) return 'orders';
    if (path.includes('/admin/add-product')) return 'add-product';
    if (path.includes('/admin/all-products')) return 'all-products';
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/reviews')) return 'reviews';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          api.get('/orders'),
          api.get('/products'),
          api.get('/users')
        ]);

        const orders = ordersRes.data;
        // Total sales: sum of amount for paid orders
        const totalSales = orders.reduce((sum, order) =>
          order.status === 'Paid' ? sum + (order.amount || 0) : sum, 0);

        setStats({
          totalSales,
          totalOrders: orders.length,
          totalProducts: productsRes.data.length,
          totalUsers: usersRes.data.length,
          deliveredOrders: orders.filter(order => order.deliveryStatus === 'delivered').length,
          cancelledOrders: orders.filter(order => order.status === 'Cancelled').length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // You might want to add toast notification here
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    // After logout, the protected route will handle the redirect to login
    // with the current location preserved in state
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg transform transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
          <p className="mt-1 text-xl sm:text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${color}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const isOnDashboard = activeTab === 'dashboard';

  // Mobile sidebar toggle
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Close mobile sidebar when navigating
  const handleNavigation = () => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-800 text-white p-4 flex items-center justify-between shadow-md z-20">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button 
          onClick={toggleMobileSidebar}
          className="p-2 rounded-md hover:bg-gray-700 focus:outline-none"
        >
          {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar for desktop */}
      <div className={`hidden md:block ${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold">Admin Panel</h1>
          ) : (
            <h1 className="text-xl font-bold">AP</h1>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md hover:bg-gray-700 focus:outline-none"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="mt-6">
          <Link 
            to="/admin" 
            onClick={handleNavigation}
            className={`flex items-center p-3 ${activeTab === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiHome className="text-lg" />
            {sidebarOpen && <span className="ml-3">Dashboard</span>}
          </Link>
          <Link 
            to="/admin/orders" 
            onClick={handleNavigation}
            className={`flex items-center p-3 ${activeTab === 'orders' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiShoppingCart className="text-lg" />
            {sidebarOpen && <span className="ml-3">Orders</span>}
          </Link>

          <Link 
            to="/admin/add-product" 
            onClick={handleNavigation}
            className={`flex items-center p-3 ${activeTab === 'add-product' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiBox className="text-lg" />
            {sidebarOpen && <span className="ml-3">Add Product</span>}
          </Link>

          <Link 
            to="/admin/all-products" 
            onClick={handleNavigation}
            className={`flex items-center p-3 ${activeTab === 'all-products' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiList className="text-lg" />
            {sidebarOpen && <span className="ml-3">All Products</span>}
          </Link>

          <Link 
            to="/admin/users" 
            onClick={handleNavigation}
            className={`flex items-center p-3 ${activeTab === 'users' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiUsers className="text-lg" />
            {sidebarOpen && <span className="ml-3">Users</span>}
          </Link>
          <Link 
            to="/admin/reviews" 
            onClick={handleNavigation}
            className={`flex items-center p-3 ${activeTab === 'reviews' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiMessageSquare className="text-lg" />
            {sidebarOpen && <span className="ml-3">Reviews</span>}
          </Link>
        </nav>
        <div className="absolute bottom-0 p-4" style={{ width: sidebarOpen ? '16rem' : '5rem' }}>
          <button 
            onClick={handleLogout}
            className="flex items-center p-2 text-red-400 hover:bg-gray-700 rounded-md"
          >
            <FiLogOut className="text-lg" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar - Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div 
        className={`md:hidden fixed inset-y-0 left-0 w-64 bg-gray-800 text-white z-20 transform transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ marginTop: '64px' }}
      >
        <nav className="mt-6">
          <Link 
            to="/admin" 
            onClick={handleNavigation}
            className={`flex items-center p-3 ${activeTab === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiHome className="text-lg" />
            <span className="ml-3">Dashboard</span>
          </Link>
          <Link 
            to="/admin/orders" 
            onClick={handleNavigation}
            className={`flex items-center p-3 ${activeTab === 'orders' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiShoppingCart className="text-lg" />
            <span className="ml-3">Orders</span>
          </Link>

          <Link 
            to="/admin/add-product" 
            onClick={handleNavigation}
            className={`flex items-center p-3 ${activeTab === 'add-product' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiBox className="text-lg" />
            <span className="ml-3">Add Product</span>
          </Link>

          <Link 
            to="/admin/all-products" 
            onClick={handleNavigation}
            className={`flex items-center p-3 ${activeTab === 'all-products' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiList className="text-lg" />
            <span className="ml-3">All Products</span>
          </Link>

          <Link 
            to="/admin/users" 
            onClick={handleNavigation}
            className={`flex items-center p-3 ${activeTab === 'users' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiUsers className="text-lg" />
            <span className="ml-3">Users</span>
          </Link>
          <Link 
            to="/admin/reviews" 
            onClick={handleNavigation}
            className={`flex items-center p-3 ${activeTab === 'reviews' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiMessageSquare className="text-lg" />
            <span className="ml-3">Reviews</span>
          </Link>
        </nav>
        <div className="absolute bottom-0 p-4 w-full">
          <button 
            onClick={handleLogout}
            className="flex items-center p-2 text-red-400 hover:bg-gray-700 rounded-md w-full"
          >
            <FiLogOut className="text-lg" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-0 md:pt-0">
        {/* Only show dashboard header and stats when on dashboard route */}
        {isOnDashboard && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-600 to-purple-700 p-4 md:p-6 text-white rounded-t-lg md:rounded-t-2xl">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11.93V14a1 1 0 11-2 0v-.07A6.002 6.002 0 014 10a6 6 0 1112 0 6.002 6.002 0 01-5 5.93zM10 4a6 6 0 100 12A6 6 0 0010 4z" clipRule="evenodd" />
                </svg>
                Dashboard Overview
              </h1>
              <Link to ="/" className="text-lg md:text-2xl text-pink-200 hover:underline decoration-none">
                Go to Store
              </Link>
              <p className="mt-2 text-sm md:text-base text-pink-200">Quick stats and insights for your store</p>
            </div>
            
            {/* Stats */}
            {loading ? (
              <Loader/>
            ) : (
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <StatCard
                    title="Total Sales"
                    value={`₹${stats.totalSales.toLocaleString()}`}
                    icon={FiDollarSign}
                    color="bg-green-500"
                  />
                  <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={FiShoppingCart}
                    color="bg-pink-500"
                  />
                  <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={FiBox}
                    color="bg-purple-500"
                  />
                  <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={FiUsers}
                    color="bg-yellow-500"
                  />
                  <StatCard
                    title="Delivered Orders"
                    value={stats.deliveredOrders}
                    icon={FiCheckCircle}
                    color="bg-cyan-500"
                  />
                  <StatCard
                    title="Cancelled Orders"
                    value={stats.cancelledOrders}
                    icon={FiXCircle}
                    color="bg-red-500"
                  />
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Outlet for child routes */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;