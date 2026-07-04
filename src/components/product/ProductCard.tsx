"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { Rating } from "@/components/ui/Rating";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { formatPrice, calculateDiscount, getImageUrl, cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();

  const discount = calculateDiscount(product.price, product.original_price ?? 0);
  const inStock = (product.stock ?? 1) > 0;
  const wishlisted = isWishlisted(product.id);
  const imageUrl = imgError ? "/placeholder-product.svg" : getImageUrl(product.images?.[0]?.url);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!inStock) return;
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      image_url: product.images?.[0]?.url ?? null,
      price: product.price,
      stock: product.stock ?? 99,
    });
    openCart();
    toast.success("Added to cart!");
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggle({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.images?.[0]?.url ?? null,
    });
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn("card product-card-hover group flex flex-col", className)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        {discount > 0 && (
          <span className="badge-sale">-{discount}%</span>
        )}
        {!inStock && (
          <span className="badge-out-of-stock">Out of Stock</span>
        )}

        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-3 transition-transform group-hover:scale-105"
          onError={() => setImgError(true)}
        />

        {/* Hover actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlist}
            className={cn(
              "w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-primary-50 transition-colors",
              wishlisted && "text-primary-700"
            )}
            aria-label="Add to wishlist"
          >
            <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
          </button>
          <Link
            href={`/products/${product.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-primary-50 transition-colors"
            aria-label="Quick view"
          >
            <Eye size={15} />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        {product.brand_name && (
          <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
            {product.brand_name}
          </span>
        )}

        <h3 className="text-sm text-gray-800 font-medium leading-snug line-clamp-2 flex-1">
          {product.name}
        </h3>

        {(product.average_rating ?? 0) > 0 && (
          <Rating
            value={product.average_rating!}
            size="sm"
            showCount
            count={product.review_count}
          />
        )}

        <div className="flex items-center gap-2 mt-auto">
          <span className="text-base font-bold text-primary-700">
            {formatPrice(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="mt-1 w-full flex items-center justify-center gap-1.5 h-9 text-sm font-semibold rounded-md bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingCart size={15} />
          {inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </Link>
  );
}
