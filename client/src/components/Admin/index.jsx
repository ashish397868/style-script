import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';

const Admin = () => {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                <p className="text-3xl font-bold text-indigo-600">0</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
                <p className="text-3xl font-bold text-indigo-600">0</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Total Products</h3>
                <p className="text-3xl font-bold text-indigo-600">0</p>
              </div>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">User Management</h2>
            {/* User management content will go here */}
          </div>
        );
      case 'products':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Product Management</h2>
            {/* Product management content will go here */}
          </div>
        );
      case 'orders':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Order Management</h2>
            {/* Order management content will go here */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
          </div>
          <nav className="mt-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-2 ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-4 py-2 ${
                activeTab === 'users'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-4 py-2 ${
                activeTab === 'products'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-2 ${
                activeTab === 'orders'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Orders
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Admin;