import { createSlice } from "@reduxjs/toolkit";

const getInitialCart = () => {
  try {
    const cart = localStorage.getItem("cart");
    if (cart) {
      const parsed = JSON.parse(cart);
      return parsed;
    }
  } catch {
    console.warn("Corrupted cart data in localStorage, resetting.");
  }
  return {}
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
        state.cart[key].qty += qty; //increase the quantity
      } else {
        state.cart[key] = { //create new cart item
          ...itemDetails,
          qty,
          variantInfo: {
            size: itemDetails.size,
            color: itemDetails.color
          }
        };
      }

      state.subTotal = calculateSubTotal(state.cart);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },

    removeFromCart: (state, action) => {
      const { key, qty } = action.payload;
      if (state.cart[key]) {
        const newQty = state.cart[key].qty - qty;
        if (newQty <= 0) {
          delete state.cart[key];
        } else {
          state.cart[key].qty = newQty;
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