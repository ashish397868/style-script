import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import checkoutReducer from './features/checkout/checkoutSlice';
import productReducer from './features/product/productSlice';
import cartReducer from './features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    checkout: checkoutReducer,
    product: productReducer,
    cart: cartReducer,
  }
});

export default store;