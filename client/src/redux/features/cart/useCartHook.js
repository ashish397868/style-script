import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  addToCart,
  removeFromCart,
  clearCart,
  loadCart
} from "./cartSlice";

const useCart = () => {
  const dispatch = useDispatch();

  // extract state
  const { cart, subTotal } = useSelector((state) => state.cart);

  // wrap all dispatches with useCallback
  const addItem = useCallback((key, qty, itemDetails) => {
    dispatch(addToCart({ key, qty, itemDetails }));
  }, [dispatch]);

  const removeItem = useCallback((key, qty) => {
    dispatch(removeFromCart({ key, qty }));
  }, [dispatch]);

  const clearItems = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const reloadCart = useCallback(() => {
    dispatch(loadCart());
  }, [dispatch]);

  // computed values
  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);

  return {
    // state values
    cart,
    subTotal,
    totalItems,

    // functions to manipulate cart
    addItem,
    removeItem,
    clearItems,
    reloadCart,
  };
};

export default useCart;