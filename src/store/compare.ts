"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const MAX_COMPARE_ITEMS = 3;

export interface CompareItem {
  product_id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
}

interface CompareState {
  items: CompareItem[];
  toggle: (item: CompareItem) => void;
  remove: (productId: string) => void;
  clear: () => void;
  isComparing: (productId: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (item) => {
        const exists = get().items.some((i) => i.product_id === item.product_id);
        if (exists) {
          set((s) => ({ items: s.items.filter((i) => i.product_id !== item.product_id) }));
          return;
        }
        if (get().items.length >= MAX_COMPARE_ITEMS) return;
        set((s) => ({ items: [...s.items, item] }));
      },

      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.product_id !== productId) })),

      clear: () => set({ items: [] }),

      isComparing: (productId) => get().items.some((i) => i.product_id === productId),
    }),
    {
      name: "compare-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
