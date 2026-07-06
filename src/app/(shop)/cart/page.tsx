"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingCart, Tag } from "lucide-react";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/cart";
import { cartApi } from "@/lib/api";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import type { Metadata } from "next";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, couponCode, discount, applyCoupon, removeCoupon, getSubtotal, getTotal } = useCartStore();
  const [coupon, setCoupon] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const total = getTotal();
  const shipping = subtotal >= 5000 ? 0 : 80;

  async function handleApplyCoupon() {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await cartApi.applyCoupon(coupon.trim());
      applyCoupon(coupon.trim(), data.discount ?? 0);
      toast.success("Coupon applied!");
    } catch {
      toast.error("Invalid or expired coupon code");
    } finally {
      setCouponLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <ShoppingCart size={56} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mb-6">Browse products and add items to your cart</p>
        <Link href="/products" className="btn-primary px-6 py-3 text-sm">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-4">
      <Breadcrumb items={[{ label: "Cart" }]} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-end">
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear Cart
            </button>
          </div>

          {items.map((item) => (
            <div key={item.product_id} className="card p-4 flex gap-4">
              <Link href={`/products/${item.product_slug}`} className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  <Image
                    src={getImageUrl(item.image_url)}
                    alt={item.product_name}
                    width={80}
                    height={80}
                    className="object-contain w-full h-full p-1"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product_slug}`}
                  className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-700"
                >
                  {item.product_name}
                </Link>
                <p className="text-base font-bold text-primary-700 mt-1">
                  {formatPrice(item.price)}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Tag size={16} className="text-primary-700" />
              Coupon Code
            </h3>
            {couponCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
                <span className="text-sm text-green-700 font-medium">{couponCode}</span>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !coupon}
                  className="btn-outline px-3 py-2 text-xs rounded-md"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="card p-4">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              {subtotal < 5000 && (
                <p className="text-xs text-orange-600">
                  Add {formatPrice(5000 - subtotal)} more for free shipping
                </p>
              )}
              <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{formatPrice(total + shipping)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center btn-primary py-3 text-sm font-bold rounded-lg mt-4"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/products"
              className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
