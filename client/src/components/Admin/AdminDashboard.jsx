import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiSettings, FiLogOut, FiBox, FiShoppingCart, FiCheckCircle, FiXCircle, FiMessageSquare, FiDollarSign } from 'react-icons/fi';
import api from '../../services/api';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          api.get('/orders'),
          api.get('/products'),
          api.get('/users')
        ]);

        const orders = ordersRes.data;
        const totalSales = orders.reduce((sum, order) => 
          order.status === 'delivered' ? sum + order.totalAmount : sum, 0);
        
        setStats({
          totalSales,
          totalOrders: orders.length,
          totalProducts: productsRes.data.length,
          totalUsers: usersRes.data.length,
          deliveredOrders: orders.filter(order => order.status === 'delivered').length,
          cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
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
    navigate('/login');
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-6 shadow-lg transform transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold">Admin Panel</h1>
          ) : (
            <h1 className="text-xl font-bold">AP</h1>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md hover:bg-gray-700"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="mt-6">
          <Link 
            to="/admin" 
            className={`flex items-center p-3 ${activeTab === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FiHome className="text-lg" />
            {sidebarOpen && <span className="ml-3">Dashboard</span>}
          </Link>
          <Link 
            to="orders" 
            className={`flex items-center p-3 ${activeTab === 'orders' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            onClick={() => setActiveTab('orders')}
          >
            <FiShoppingCart className="text-lg" />
            {sidebarOpen && <span className="ml-3">Orders</span>}
          </Link>
          <Link 
            to="products" 
            className={`flex items-center p-3 ${activeTab === 'products' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            onClick={() => setActiveTab('products')}
          >
            <FiBox className="text-lg" />
            {sidebarOpen && <span className="ml-3">Products</span>}
          </Link>
          <Link 
            to="users" 
            className={`flex items-center p-3 ${activeTab === 'users' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            onClick={() => setActiveTab('users')}
          >
            <FiUsers className="text-lg" />
            {sidebarOpen && <span className="ml-3">Users</span>}
          </Link>
          <Link 
            to="reviews" 
            className={`flex items-center p-3 ${activeTab === 'reviews' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            onClick={() => setActiveTab('reviews')}
          >
            <FiMessageSquare className="text-lg" />
            {sidebarOpen && <span className="ml-3">Reviews</span>}
          </Link>
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <button 
            onClick={handleLogout}
            className="flex items-center p-2 text-red-400 hover:bg-gray-700 rounded-md"
          >
            <FiLogOut className="text-lg" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard Overview</h2>
        </header>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                color="bg-blue-500"
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
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;