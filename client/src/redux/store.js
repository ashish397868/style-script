import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // localStorage
import storageSession from 'redux-persist/lib/storage/session'; // <-- ye sessionStorage hota hai

import userReducer from './features/user/userSlice';
import checkoutReducer from './features/checkout/checkoutSlice';
import productReducer from './features/product/productSlice';
import cartReducer from './features/cart/cartSlice';

const persistConfig = {
  key: 'product',
  // storage,
  storage: storageSession, // sessionStorage use kar rahe hain
  whitelist: ['categoryProducts'] // sirf yahi persist hoga
};

const persistedProductReducer = persistReducer(persistConfig, productReducer);

export const store = configureStore({
  reducer: {
    user: userReducer,
    checkout: checkoutReducer,
    product: persistedProductReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
