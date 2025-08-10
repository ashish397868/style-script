import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  addToCart,
  removeFromCart,
  clearCart
} from "./cartSlice";

const useCart = () => {
  const dispatch = useDispatch();

  // extract state
  const { cart, subTotal } = useSelector((state) => state.cart);

  // wrap all dispatches with useCallback
  const addItem = useCallback((key, qty, itemDetails) => {
    if (!key || !qty || !itemDetails) {
      console.error("Missing required parameters for adding item to cart");
      return;
    }
    dispatch(addToCart({ key, qty, itemDetails }));
  }, [dispatch]);

  const removeItem = useCallback((key, qty = 1) => {
    if (!key) {
      console.error("Missing key for removing item from cart");
      return;
    }
    dispatch(removeFromCart({ key, qty }));
  }, [dispatch]);

  const clearItems = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);


  // computed values
  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.qty, 0); //total quantity calculate krra hai yeah

  return {
    // state values
    cart,
    subTotal,
    totalItems,

    // functions to manipulate cart
    addItem,
    removeItem,
    clearItems
  };
};

export default useCart;