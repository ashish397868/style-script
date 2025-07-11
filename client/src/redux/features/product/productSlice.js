import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI } from '../../../services/api';

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (force = false, { getState, rejectWithValue }) => {
    const { products } = getState().product;
    if (!force && products && products.length > 0) {
      return products;
    }
    try {
      const response = await productAPI.getAllProducts(getState().product.filters);
      return Array.isArray(response.data) ? response.data : response.data.products || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'product/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getFeaturedProducts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'product/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProductBySlug(slug);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

const initialState = {
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
    limit: 12,
  },
  totalPages: 1,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.totalPages = 1;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featured = action.payload;
        state.loading = false;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
  },
});

export const { setFilters, setPage, clearError } = productSlice.actions;
export default productSlice.reducer;
