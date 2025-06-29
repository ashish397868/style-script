import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiBox, FiUsers, FiDollarSign, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../services/api';
import Loader from '../Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-700 p-6 text-white rounded-t-2xl">
        <h1 className="text-3xl font-bold flex items-center">
          <FiShoppingCart className="h-8 w-8 mr-3" />
          Dashboard Overview
        </h1>
        <p className="mt-2 text-pink-200">Admin summary and quick stats</p>
      </div>
      <div className="p-6">
        {loading ? (
          <Loader />
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
