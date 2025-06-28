import { create } from 'zustand';

export const useCheckoutStore = create((set) => ({
  // selectedAddress is the full address object, not an ID
  selectedAddress: null,
  setSelectedAddress: (address) => set({ selectedAddress: address }),
  clearSelectedAddress: () => set({ selectedAddress: null }),
}));
