import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiBox, FiList, FiShoppingCart, FiMessageSquare, FiLogOut } from 'react-icons/fi';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Determine active tab from location
  const getActiveTab = () => {
    if (location.pathname === '/admin') return 'dashboard';
    if (location.pathname.includes('/admin/orders')) return 'orders';
    if (location.pathname.includes('/admin/add-product')) return 'add-product';
    if (location.pathname.includes('/admin/all-products')) return 'all-products';
    if (location.pathname.includes('/admin/users')) return 'users';
    if (location.pathname.includes('/admin/reviews')) return 'reviews';
    return '';
  };
  const activeTab = getActiveTab();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300 relative`}>
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
          >
            <FiHome className="text-lg" />
            {sidebarOpen && <span className="ml-3">Dashboard</span>}
          </Link>
          <Link 
            to="/admin/orders" 
            className={`flex items-center p-3 ${activeTab === 'orders' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiShoppingCart className="text-lg" />
            {sidebarOpen && <span className="ml-3">Orders</span>}
          </Link>
          <Link 
            to="/admin/add-product" 
            className={`flex items-center p-3 ${activeTab === 'add-product' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiBox className="text-lg" />
            {sidebarOpen && <span className="ml-3">Add Product</span>}
          </Link>
          <Link 
            to="/admin/all-products" 
            className={`flex items-center p-3 ${activeTab === 'all-products' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiList className="text-lg" />
            {sidebarOpen && <span className="ml-3">All Products</span>}
          </Link>
          <Link 
            to="/admin/users" 
            className={`flex items-center p-3 ${activeTab === 'users' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FiUsers className="text-lg" />
            {sidebarOpen && <span className="ml-3">Users</span>}
          </Link>
          <Link 
            to="/admin/reviews" 
            className={`flex items-center p-3 ${activeTab === 'reviews' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
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
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
