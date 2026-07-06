"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart";

export function CartIcon() {
  const { getItemCount, toggleCart } = useCartStore();
  const count = getItemCount();

  return (
    <button
      onClick={toggleCart}
      className="relative flex items-center gap-1.5 text-gray-700 hover:text-primary-700 transition-colors p-1"
      aria-label="Open cart"
    >
      <ShoppingCart size={22} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
