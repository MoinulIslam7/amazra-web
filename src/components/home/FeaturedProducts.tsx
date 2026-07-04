"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import type { Product } from "@/types";

interface FeaturedProductsProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  params?: Record<string, unknown>;
  limit?: number;
}

export function FeaturedProducts({
  title,
  subtitle,
  viewAllHref,
  params = {},
  limit = 8,
}: FeaturedProductsProps) {
  const { data, isLoading } = useQuery<{ items: Product[] }>({
    queryKey: ["products", "featured", params],
    queryFn: async () => {
      const { data } = await productsApi.list({ page_size: limit, ...params });
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const products = data?.items ?? [];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm text-primary-700 font-medium hover:underline"
          >
            View All <ChevronRight size={16} />
          </Link>
        )}
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={limit} />
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
