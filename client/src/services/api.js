import axios from 'axios';

// Create a custom event for authentication errors
export const AUTH_EVENTS = {
  UNAUTHORIZED: 'auth:unauthorized',
  AUTH_ERROR: 'auth:error'
};

const api = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL : 'http://192.168.1.7:5000/api', // Home wifi
  // baseURL : 'http://192.168.2.25:5000/api', // Replace with your actual IP
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
      // headers: config.headers,
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

    // Don't redirect immediately for 401 errors
    if (error.response?.status === 401) {
      // Only clear auth state if not already trying to authenticate
      const isAuthEndpoint = error.config?.url.includes('/login') || 
                             error.config?.url.includes('/signup') || 
                             error.config?.url.includes('/users/profile');
      
      // If this is an auth endpoint failure, we should clear the token
      if (isAuthEndpoint) {
        localStorage.removeItem('token');
        // Dispatch a custom event for authentication errors
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
      }
    }
    return Promise.reject(error);
  }
);

// Auth Routes
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  signup: (userData) => api.post('/signup', userData),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  resetPassword: (data) => api.post('/reset-password', data)
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.patch('/users/profile', userData),
  changePassword: (passwordData) => api.post('/users/change-password', passwordData),
};

// address Routes
export const addressAPI = {
  addAddress: (addressData) => api.post('/users/me/addresses', addressData),
  updateAddress: (addressId, addressData) => api.patch(`/users/me/addresses/${addressId}`, addressData),
  deleteAddress: (addressId) => api.delete(`/users/me/addresses/${addressId}`),
};

// Pincode Routes
export const pincodeAPI = {
  getPincodes: () => api.get('/get-pincode'),
};

// Product Routes
export const productAPI = {
  getAllProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getProductsByCategory: (category) => api.get(`/products/category/${category}`),
  getProductsByTheme: (theme) => api.get(`/products/theme/${theme}`),
  searchProducts: (query) => api.get(`/products/search`, { params: { q: query } }),
  getProductReviews: (productId) => api.get(`/products/${productId}/reviews`),
  createProduct: (productData) => api.post('/products', productData),
  deleteProduct: (productId) => api.delete(`/products/${productId}`),
  updateProduct: (productId, productData) => api.put(`/products/${productId}`, productData),
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
  createPaymentIntent: (orderData) => api.post('/payments/create', orderData),
  verifyPayment: (paymentData) => api.post('/payments/verify', paymentData)
};

// Media Routes
export const mediaAPI = {
  uploadImage: (formData) => api.post('/media/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
};

export default api;