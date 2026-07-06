"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice, getImageUrl } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal, getItemCount } =
    useCartStore();

  const subtotal = getSubtotal();
  const count = getItemCount();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={20} />
            Cart
            {count > 0 && (
              <span className="bg-primary-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart size={48} className="text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mb-5">Add products to get started</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="btn-primary px-5 py-2 text-sm"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                  {/* Image */}
                  <Link href={`/products/${item.product_slug}`} onClick={closeCart}>
                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                      <Image
                        src={getImageUrl(item.image_url)}
                        alt={item.product_name}
                        width={64}
                        height={64}
                        className="object-contain w-full h-full p-1"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product_slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-primary-700"
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-sm font-bold text-primary-700 mt-1">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty controls */}
                      <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-500">
              Shipping calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center btn-primary py-3 text-sm font-bold rounded-lg"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full text-center text-sm text-gray-600 hover:text-gray-900 py-1"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
