// redux-utility/index.js
import { createAsyncThunk } from '@reduxjs/toolkit';

/*
 * ✅ handlePending
 * - Jab API request start hoti hai
 * - loading ko true karta hai (for loader)
 * - error ko reset karta hai
 */
const handlePending = (state) => {
  state.loading = true;
  state.error = null;
};

/*
 * ❌ handleRejected
 * - Jab API request fail hoti hai
 * - loading ko false karta hai
 * - error payload ko set karta hai (for showing errors)
 */
const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

/*
 * ✅ handleFulfilled
 * - Jab API request success hoti hai
 * - loading ko false karta hai
 * - error ko null karta hai
 * - aur handlerFn ko call karta hai (agar diya ho to), for custom state updates
 */
const handleFulfilled = (handlerFn) => (state, action) => {
  state.loading = false;
  state.error = null;
  handlerFn?.(state, action);
};

/*
 * 🔁 createAsyncThunkHandler
 * - Ye ek reusable thunk creator hai
 * - Tujhe bas type aur API function dena hai
 * - Ye try/catch handle karega, aur error ko nicely reject karega
 */
const createAsyncThunkHandler = (type, apiCall) =>
  createAsyncThunk(type, async (data, { rejectWithValue }) => {
    try {
      const response = await apiCall(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  });

export {
  handlePending,
  handleRejected,
  handleFulfilled,
  createAsyncThunkHandler
};
