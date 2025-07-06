import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderAPI, paymentAPI } from '../../../services/api';

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderAPI.createOrder(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'order/fetchMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getMyOrders();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrderById(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderAPI.cancelOrder(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

export const createPayment = createAsyncThunk(
  'order/createPayment',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.createPaymentIntent(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment failed');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'order/verifyPayment',
  async ({ paymentId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.verifyPayment(paymentId, paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  paymentStatus: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearPaymentStatus: (state) => {
      state.paymentStatus = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.loading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.orders = state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        );
        state.loading = false;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.paymentStatus = 'pending';
      })
      .addCase(createPayment.fulfilled, (state) => {
        state.loading = false;
        state.paymentStatus = 'pending';
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        state.paymentStatus = null;
      })
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.loading = false;
        state.paymentStatus = 'completed';
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        state.paymentStatus = null;
      });
  },
});

export const { clearPaymentStatus, clearError } = orderSlice.actions;
export default orderSlice.reducer;
