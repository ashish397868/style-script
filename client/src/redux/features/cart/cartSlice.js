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
      // Validate itemDetails has all required fields
      if (!itemDetails.productId || !itemDetails.size || !itemDetails.color) {
        console.error("Invalid item details provided to cart");
        return;
      }
      
      if (state.cart[key]) {
        state.cart[key].qty += qty;
      } else {
        state.cart[key] = {
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

    updateCartItemQty: (state, action) => {
      const { key, qty } = action.payload;
      if (state.cart[key] && qty > 0) {
        state.cart[key].qty = qty;
        state.subTotal = calculateSubTotal(state.cart);
        localStorage.setItem("cart", JSON.stringify(state.cart));
      }
    },

    clearCart: (state) => {
      state.cart = {};
      state.subTotal = 0;
      localStorage.setItem("cart", JSON.stringify(state.cart));
    }

  },
});

export const { addToCart, removeFromCart, clearCart , updateCartItemQty} = cartSlice.actions;
export default cartSlice.reducer;