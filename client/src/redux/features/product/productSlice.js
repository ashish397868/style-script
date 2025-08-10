import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productAPI } from "../../../services/api";

export const fetchProducts = createAsyncThunk("fetchProducts", async (params = {}, { getState, rejectWithValue }) => {
  const { filters } = getState().product;
  try {
    const queryParams = {
      ...filters,
      ...params,
      page: params.page || 1,
      limit: params.limit || 12,
    };
    const response = await productAPI.getAllProducts(queryParams);
    return {
      products: response.data.products || [],
      totalPages: response.data.totalPages || 1,
      currentPage: response.data.currentPage || 1,
      totalProducts: response.data.totalProducts || 0,
    };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
  }
});

export const fetchFeaturedProducts = createAsyncThunk("fetchFeaturedProducts", async (_, { rejectWithValue }) => {
  try {
    const response = await productAPI.getFeaturedProducts();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch featured products");
  }
});

export const fetchProductBySlug = createAsyncThunk("fetchProductBySlug", async (slug, { rejectWithValue }) => {
  try {
    const response = await productAPI.getProductBySlug(slug);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch product");
  }
});

export const fetchProductsByCategory = createAsyncThunk("products/fetchByCategory", async (category, { getState, rejectWithValue }) => {
  const state = getState().product;
  const cachedCategory = state.categoryProducts[category];
  const now = Date.now();

  // 5 minutes in ms
  const CACHE_TIME = 5 * 60 * 1000;

  // If cached and fresh, return it
  if (cachedCategory && now - cachedCategory.lastFetched < CACHE_TIME) {
    console.log("Returning cached products for category:", category);
    return { category, products: cachedCategory.products, fromCache: true };
  }

  // Else fetch from API
  try {
    console.log("Fetching products for category:", category);
    const response = await productAPI.getProductsByCategory(category);
    return { category, products: response.data, fromCache: false };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
  }
});

const initialState = {
  categoryProducts: {}, // { [categoryName]: { products: [], lastFetched: 0 } }
  products: [],
  featured: [],
  currentProduct: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    search: "",
    sort: "",
    page: 1,
    limit: 12,
  },
  totalPages: 1,
  currentPage: 1,
  totalProducts: 0,
};

const productSlice = createSlice({
  name: "product",
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

      // fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload.products;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalProducts = action.payload.totalProducts;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // fetch featured Products
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

      //  fetch products by slug
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

      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        const { category, products, fromCache } = action.payload;
        state.loading = false;
        state.error = null;

        // Only update cache if fetched from API
        if (!fromCache) {
          state.categoryProducts[category] = {
            products,
            lastFetched: Date.now(),
          };
        }
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, setPage, clearError } = productSlice.actions;
export default productSlice.reducer;
