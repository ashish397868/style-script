import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: {},
      subTotal: 0,
  
      addToCart: (key, qty) => {
        set((state) => {
          const newCart = { ...state.cart };
          if (key in newCart) {
            newCart[key].qty += qty;
          } else {
            newCart[key] = { qty };
          }
          
          // Calculate new subtotal
          const newSubTotal = Object.keys(newCart).reduce(
            (total, k) => total + (newCart[k].price * newCart[k].qty), 
            0
          );
  
          return { cart: newCart, subTotal: newSubTotal };
        });
      },
  
      removeFromCart: (key, qty) => {
        set((state) => {
          const newCart = { ...state.cart };
          if (key in newCart) {
            newCart[key].qty -= qty;
            if (newCart[key].qty <= 0) {
              delete newCart[key];
            }
          }
  
          // Calculate new subtotal
          const newSubTotal = Object.keys(newCart).reduce(
            (total, k) => total + (newCart[k].price * newCart[k].qty), 
            0
          );
  
          return { cart: newCart, subTotal: newSubTotal };
        });
      },
  
      clearCart: () => {
        set({ cart: {}, subTotal: 0 });
      },
  
      saveCart: () => {
        const state = get();
        localStorage.setItem('cart', JSON.stringify(state.cart));
      },
  
      loadCart: () => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const cart = JSON.parse(savedCart);
          const subTotal = Object.keys(cart).reduce(
            (total, k) => total + (cart[k].price * cart[k].qty), 
            0
          );
          set({ cart, subTotal });
        }
      }
    }),
    {
      name: 'cart-storage', // name of the item in the storage (must be unique)
      getStorage: () => localStorage, // (optional) by default the 'localStorage' is used
    }
  )
);