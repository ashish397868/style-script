import { createSlice } from '@reduxjs/toolkit';

const getInitialCart = () => {
  try {
    const cart = localStorage.getItem('cart');
    if (cart) {
      const parsed = JSON.parse(cart);
      return parsed;
    }
  } catch {}
  return {};
};

const calculateSubTotal = (cart) => {
  return Object.keys(cart).reduce(
    (total, k) => total + (cart[k].price * cart[k].qty),
    0
  );
};

const initialCart = getInitialCart();
const initialState = {
  cart: initialCart,
  subTotal: calculateSubTotal(initialCart),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { key, qty, itemDetails } = action.payload;
      if (state.cart[key]) {
        state.cart[key].qty += qty;
      } else {
        state.cart[key] = { ...itemDetails, qty };
      }
      state.subTotal = calculateSubTotal(state.cart);
      localStorage.setItem('cart', JSON.stringify(state.cart));
    },
    removeFromCart: (state, action) => {
      const { key, qty } = action.payload;
      if (state.cart[key]) {
        state.cart[key].qty -= qty;
        if (state.cart[key].qty <= 0) {
          delete state.cart[key];
        }
      }
      state.subTotal = calculateSubTotal(state.cart);
      localStorage.setItem('cart', JSON.stringify(state.cart));
    },
    clearCart: (state) => {
      state.cart = {};
      state.subTotal = 0;
      localStorage.setItem('cart', JSON.stringify(state.cart));
    },
    loadCart: (state) => {
      const cart = getInitialCart();
      state.cart = cart;
      state.subTotal = calculateSubTotal(cart);
    },
  },
});

export const { addToCart, removeFromCart, clearCart, loadCart } = cartSlice.actions;
export default cartSlice.reducer;
