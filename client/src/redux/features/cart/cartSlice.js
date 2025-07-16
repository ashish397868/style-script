import { createSlice } from "@reduxjs/toolkit";

const getInitialCart = () => {
  try {
    const cart = localStorage.getItem("cart");
    if (cart) {
      const parsed = JSON.parse(cart);
      return parsed;
    }
  } catch {}
  return {};
};

const calculateSubTotal = (cart) => {
  return Object.keys(cart).reduce((total, itemId) => total + cart[itemId].price * cart[itemId].qty, 0);
};

const initialCart = getInitialCart();

const initialState = {
  cart: initialCart,
  subTotal: calculateSubTotal(initialCart),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { key, qty, itemDetails } = action.payload;
      if (state.cart[key]) {
        state.cart[key].qty += qty; //agr vo product cart mein hai to , uski quantity plus krdo
      } else {
        state.cart[key] = { ...itemDetails, qty }; //nhi to new product add krdo cart mein
      }
      state.subTotal = calculateSubTotal(state.cart);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },

    removeFromCart: (state, action) => {
      const { key, qty } = action.payload;
      if (state.cart[key]) {
        state.cart[key].qty -= qty;
        if (state.cart[key].qty <= 0) { //agr quantity zero se kam hai to us item ko delete krdo cart se
          delete state.cart[key];
        }
      }
      state.subTotal = calculateSubTotal(state.cart);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },

    clearCart: (state) => {
      state.cart = {};
      state.subTotal = 0;
      localStorage.setItem("cart", JSON.stringify(state.cart));
    }

  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;