"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { formatPrice, getImageUrl } from "@/lib/utils";

export default function WishlistPage() {
  const { items, remove } = useWishlistStore();
  const { addItem, openCart } = useCartStore();

  function handleAddToCart(item: (typeof items)[number]) {
    addItem({
      product_id: item.product_id,
      product_name: item.name,
      product_slug: item.slug,
      image_url: item.image_url,
      price: item.price,
      stock: 99,
    });
    openCart();
    toast.success("Added to cart!");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Heart size={20} className="text-primary-700" />
        <h1 className="text-xl font-bold text-gray-900">Wishlist</h1>
        <span className="text-sm text-gray-500">({items.length} items)</span>
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <Heart size={40} className="mx-auto text-gray-200 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">Your wishlist is empty</h3>
          <p className="text-sm text-gray-500 mb-4">Save products you love to your wishlist</p>
          <Link href="/products" className="btn-primary px-5 py-2 text-sm">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.product_id} className="card p-4 flex gap-3">
              <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                  <Image
                    src={getImageUrl(item.image_url)}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="object-contain w-full h-full p-1"
                  />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.slug}`}
                  className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-700"
                >
                  {item.name}
                </Link>
                <p className="text-base font-bold text-primary-700 mt-1">{formatPrice(item.price)}</p>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-primary-700 text-white hover:bg-primary-800 transition-colors"
                  >
                    <ShoppingCart size={13} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => remove(item.product_id)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-2"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
