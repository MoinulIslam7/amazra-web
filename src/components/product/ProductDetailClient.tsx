"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Truck,
  RotateCcw,
  ShieldCheck,
  Scale,
} from "lucide-react";
import { toast } from "react-toastify";
import { formatPrice, calculateDiscount, getImageUrl, cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useCompareStore, MAX_COMPARE_ITEMS } from "@/store/compare";
import { Rating } from "@/components/ui/Rating";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Reviews } from "@/components/product/Reviews";
import { QASection } from "@/components/product/QASection";
import { PriceHistoryChart } from "@/components/product/PriceHistoryChart";
import type { Product } from "@/types";

function ImageGallery({ images, name }: { images: { url: string }[]; name: string }) {
  const [active, setActive] = useState(0);
  const [imgError, setImgError] = useState(false);

  if (!images.length) {
    return (
      <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center">
        <span className="text-gray-400 text-5xl">📦</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden relative border border-gray-100 dark:border-gray-800">
        <Image
          src={imgError ? "/placeholder-product.svg" : getImageUrl(images[active]?.url)}
          alt={name}
          fill
          className="object-contain p-6"
          priority
          onError={() => setImgError(true)}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full shadow flex items-center justify-center hover:bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full shadow flex items-center justify-center hover:bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                i === active ? "border-primary-700" : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
              )}
            >
              <Image
                src={getImageUrl(img.url)}
                alt={`${name} ${i + 1}`}
                width={64}
                height={64}
                className="object-contain w-full h-full p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecsTable({ specs }: { specs: Record<string, unknown> }) {
  const entries = Object.entries(specs).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!entries.length) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([key, value], i) => (
            <tr key={key} className={i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/50" : "bg-white dark:bg-gray-900"}>
              <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300 w-2/5 capitalize">
                {key.replace(/_/g, " ")}
              </td>
              <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">
                {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TABS = ["specs", "reviews", "qa", "price-history"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  specs: "Specifications",
  reviews: "Reviews",
  qa: "Q&A",
  "price-history": "Price History",
};

export function ProductDetailClient({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("specs");

  const { addItem, openCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { toggle: toggleCompare, isComparing, items: compareItems } = useCompareStore();

  const discount = calculateDiscount(product.price, product.original_price ?? 0);
  const inStock = (product.stock ?? 1) > 0;
  const wishlisted = isWishlisted(product.id);
  const comparing = isComparing(product.id);

  function handleAddToCart() {
    if (!inStock) return;
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      image_url: product.images?.[0]?.url ?? null,
      price: product.price,
      stock: product.stock ?? 99,
      quantity: qty,
    });
    trackEvent("add_to_cart", {
      currency: "BDT",
      value: product.price * qty,
      items: [{ item_id: product.id, item_name: product.name, quantity: qty, price: product.price }],
    });
    openCart();
    toast.success("Added to cart!");
  }

  function handleWishlist() {
    toggle({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.images?.[0]?.url ?? null,
    });
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist!");
  }

  function handleCompare() {
    if (!comparing && compareItems.length >= MAX_COMPARE_ITEMS) {
      toast.info(`You can compare up to ${MAX_COMPARE_ITEMS} products`);
      return;
    }
    toggleCompare({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.images?.[0]?.url ?? null,
    });
  }

  async function handleShare() {
    try {
      await navigator.share({ title: product.name, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  }

  return (
    <div className="container-page py-4">
      <Breadcrumb
        items={[
          ...(product.category_name
            ? [{ label: product.category_name, href: `/category/${product.category_id}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <div>
          <ImageGallery images={product.images ?? []} name={product.name} />
        </div>

        <div className="space-y-4">
          {product.brand_name && (
            <Link
              href={`/brand/${product.brand_id}`}
              className="text-sm text-primary-700 font-semibold uppercase tracking-wide hover:underline"
            >
              {product.brand_name}
            </Link>
          )}

          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{product.name}</h1>

          {(product.average_rating ?? 0) > 0 && (
            <div className="flex items-center gap-2">
              <Rating value={product.average_rating!} size="md" />
              <span className="text-sm text-gray-500">
                {product.average_rating?.toFixed(1)} ({product.review_count} reviews)
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-primary-700">
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.original_price)}
                </span>
                <Badge variant="danger">{discount}% OFF</Badge>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {inStock ? (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle2 size={16} />
                In Stock
              </span>
            ) : (
              <span className="text-sm text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-lg font-medium"
              >
                −
              </button>
              <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold border-x border-gray-300 dark:border-gray-700 dark:text-gray-100">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(q + 1, product.stock ?? 99))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-lg font-medium"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex-1 flex items-center justify-center gap-2 h-10 font-semibold text-sm rounded-md bg-primary-700 text-white hover:bg-primary-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleWishlist}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm border rounded-md transition-colors",
                wishlisted
                  ? "border-primary-700 text-primary-700 bg-primary-50"
                  : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
              {wishlisted ? "Wishlisted" : "Wishlist"}
            </button>
            <button
              onClick={handleCompare}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm border rounded-md transition-colors",
                comparing
                  ? "border-primary-700 text-primary-700 bg-primary-50"
                  : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <Scale size={16} />
              {comparing ? "Comparing" : "Compare"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2.5 text-sm">
            {[
              { icon: Truck, text: "Free delivery on orders above ৳5,000" },
              { icon: RotateCcw, text: "7-day easy return policy" },
              { icon: ShieldCheck, text: "Genuine product guaranteed" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Icon size={15} className="text-green-600 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <div className="border-b border-gray-200 dark:border-gray-800 flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors",
                activeTab === tab
                  ? "border-b-2 border-primary-700 text-primary-700"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              {TAB_LABELS[tab]}
              {tab === "reviews" && product.review_count ? ` (${product.review_count})` : ""}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {activeTab === "specs" &&
            (product.specs ? (
              <SpecsTable specs={product.specs as Record<string, unknown>} />
            ) : (
              <p className="text-sm text-gray-500">No specifications available.</p>
            ))}
          {activeTab === "reviews" && <Reviews productId={product.id} />}
          {activeTab === "qa" && <QASection productId={product.id} />}
          {activeTab === "price-history" && <PriceHistoryChart productSlug={product.slug} />}
        </div>
      </div>

      {/* Related products */}
      <div className="mt-12">
        <FeaturedProducts
          title="Related Products"
          params={{ category: product.category_id ?? undefined, page_size: 4 }}
          limit={4}
        />
      </div>

      {product.brand_id && (
        <div className="mt-12">
          <FeaturedProducts
            title="You May Also Like"
            subtitle={product.brand_name ? `More from ${product.brand_name}` : undefined}
            params={{ brand: product.brand_id, page_size: 4 }}
            limit={4}
          />
        </div>
      )}
    </div>
  );
}
