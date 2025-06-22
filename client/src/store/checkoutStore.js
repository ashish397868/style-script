import { create } from 'zustand';

export const useCheckoutStore = create((set) => ({
  selectedAddress: null,
  setSelectedAddress: (address) => set({ selectedAddress: address }),
  clearSelectedAddress: () => set({ selectedAddress: null }),
}));
