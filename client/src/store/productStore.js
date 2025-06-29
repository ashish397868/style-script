import { create } from 'zustand';
import { productAPI } from '../services/api';

export const useProductStore = create((set, get) => ({
  products: [],
  featured: [],
  currentProduct: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    search: '',
    sort: '',
    page: 1,
    limit: 12
  },
  totalPages: 1,

  // Fetch all products with filters
  fetchProducts: async (force = false) => {
    const { filters, products } = get();
    // Only fetch if products are not loaded or force is true
    if (!force && products && products.length > 0) {
      return products;
    }
    set({ loading: true });
    try {
      const response = await productAPI.getAllProducts(filters);
      set({
        products: Array.isArray(response.data) ? response.data : response.data.products || [],
        totalPages: 1,
        loading: false
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch products', loading: false });
      throw error;
    }
  },

  // Fetch featured products
  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await productAPI.getFeaturedProducts();
      set({ featured: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch featured products', loading: false });
      throw error;
    }
  },

  // Fetch single product
  fetchProductBySlug: async (slug) => {
    set({ loading: true });
    try {
      const response = await productAPI.getProductBySlug(slug);
      set({ currentProduct: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch product', loading: false });
      throw error;
    }
  },

  // Search products
  searchProducts: async (query) => {
    set({ loading: true, filters: { ...get().filters, search: query, page: 1 } });
    try {
      const response = await productAPI.searchProducts(query);
      set({ products: response.data.products, totalPages: response.data.totalPages, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Search failed', loading: false });
      throw error;
    }
  },

  // Update filters
  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters, page: 1 } });
    get().fetchProducts();
  },

  // Update page
  setPage: (page) => {
    set({ filters: { ...get().filters, page } });
    get().fetchProducts();
  },

  // Delete a product by ID
  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await productAPI.deleteProduct(productId);
      set({
        products: get().products.filter((p) => p._id !== productId && p.id !== productId),
        loading: false
      });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete product', loading: false });
      throw error;
    }
  },
  // Clear errors
  clearError: () => set({ error: null }),
}));
