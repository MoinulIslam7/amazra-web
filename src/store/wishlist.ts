"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistItem {
  product_id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  isWishlisted: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (item) => {
        const exists = get().items.some((i) => i.product_id === item.product_id);
        if (exists) {
          set((s) => ({ items: s.items.filter((i) => i.product_id !== item.product_id) }));
        } else {
          set((s) => ({ items: [...s.items, item] }));
        }
      },

      isWishlisted: (productId) => get().items.some((i) => i.product_id === productId),

      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.product_id !== productId) })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
