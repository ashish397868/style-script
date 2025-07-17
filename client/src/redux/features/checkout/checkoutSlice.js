import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedAddress: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    }
  },
});

export const { setSelectedAddress } = checkoutSlice.actions;
export default checkoutSlice.reducer;