import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log the request for debugging
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log the response for debugging
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Log the error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Routes
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  signup: (userData) => api.post('/signup', userData),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  resetPassword: (data) => api.post('/reset-password', data),
  verifyEmail: (token) => api.get(`/users/verify-email/${token}`),
  getProfile: () => api.get('/users/profile'),
};

// User Routes
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.patch('/users/profile', userData),
  changePassword: (passwordData) => api.post('/users/change-password', passwordData),
  deleteAccount: () => api.delete('/users/profile'),
};

// Product Routes
export const productAPI = {
  getAllProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getProductsByCategory: (category) => api.get(`/products/category/${category}`),
  searchProducts: (query) => api.get('/products/search', { params: { q: query } }),
  getProductReviews: (productId) => api.get(`/products/${productId}/reviews`),
};

// Order Routes
export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my'),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  updateOrderStatus: (orderId, status) => api.patch(`/orders/${orderId}/status`, { status }),
  cancelOrder: (orderId) => api.post(`/orders/${orderId}/cancel`),
  getOrderDetails: (orderId) => api.get(`/orders/${orderId}/details`),
};

// Review Routes
export const reviewAPI = {
  createReview: (productId, reviewData) => api.post(`/reviews/${productId}`, reviewData),
  updateReview: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
  getMyReviews: () => api.get('/reviews/my'),
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
};

// Payment Routes
export const paymentAPI = {
  createPaymentIntent: (orderData) => api.post('/payments/create-payment-intent', orderData),
  verifyPayment: (paymentId, paymentData) => api.post(`/payments/verify/${paymentId}`, paymentData),
  getPaymentStatus: (paymentId) => api.get(`/payments/status/${paymentId}`),
  refundPayment: (paymentId) => api.post(`/payments/refund/${paymentId}`),
};

// Media Routes
export const mediaAPI = {
  uploadImage: (formData) => api.post('/media/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  uploadBulk: (formData) => api.post('/media/upload/bulk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteMedia: (mediaId) => api.delete(`/media/${mediaId}`),
};

// Bulk Upload Routes
export const bulkUploadAPI = {
  uploadProducts: (formData) => api.post('/bulk-upload/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getUploadStatus: (uploadId) => api.get(`/bulk-upload/status/${uploadId}`),
  downloadTemplate: () => api.get('/bulk-upload/template', {
    responseType: 'blob',
  }),
};

export default api;