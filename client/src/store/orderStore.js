import { create } from 'zustand';
import { orderAPI, paymentAPI } from '../services/api';

export const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  paymentStatus: null,

  // Create new order
  createOrder: async (orderData) => {
    set({ loading: true });
    try {
      const response = await orderAPI.createOrder(orderData);
      set({ currentOrder: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create order', loading: false });
      throw error;
    }
  },

  // Fetch user's orders
  fetchMyOrders: async () => {
    set({ loading: true });
    try {
      const response = await orderAPI.getMyOrders();
      set({ orders: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch orders', loading: false });
      throw error;
    }
  },

  // Fetch single order
  fetchOrderById: async (orderId) => {
    set({ loading: true });
    try {
      const response = await orderAPI.getOrderById(orderId);
      set({ currentOrder: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch order', loading: false });
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    set({ loading: true });
    try {
      const response = await orderAPI.cancelOrder(orderId);
      set(state => ({
        orders: state.orders.map(order =>
          order._id === orderId ? response.data : order
        ),
        currentOrder: response.data,
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to cancel order', loading: false });
      throw error;
    }
  },

  // Payment integration
  createPayment: async (orderData) => {
    set({ loading: true });
    try {
      const response = await paymentAPI.createPaymentIntent(orderData);
      set({ paymentStatus: 'pending', loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Payment failed', loading: false });
      throw error;
    }
  },

  verifyPayment: async (paymentId, paymentData) => {
    set({ loading: true });
    try {
      const response = await paymentAPI.verifyPayment(paymentId, paymentData);
      set({ paymentStatus: 'completed', loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Payment verification failed', loading: false });
      throw error;
    }
  },

  // Clear payment status
  clearPaymentStatus: () => set({ paymentStatus: null }),

  // Clear errors
  clearError: () => set({ error: null }),
}));
