import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import checkoutReducer from './features/checkout/checkoutSlice';
import productReducer from './features/product/productSlice';
import orderReducer from './features/order/orderSlice';
import cartReducer from './features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    checkout: checkoutReducer,
    product: productReducer,
    order: orderReducer,
    cart: cartReducer,
  }
});

export default store;