"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { brandsApi } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Brand } from "@/types";

export function BrandShowcase() {
  const { data: brands, isLoading } = useQuery<{ items: Brand[] }>({
    queryKey: ["brands", "showcase"],
    queryFn: async () => {
      const { data } = await brandsApi.list({ page_size: 12 });
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const items = brands?.items ?? [];

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Top Brands</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))
          : items.map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                className="flex items-center justify-center h-16 bg-white rounded-lg border border-gray-100 px-4 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                {brand.logo_url ? (
                  <Image
                    src={getImageUrl(brand.logo_url)}
                    alt={brand.name}
                    width={80}
                    height={36}
                    className="object-contain max-h-9"
                  />
                ) : (
                  <span className="text-sm font-bold text-gray-700">{brand.name}</span>
                )}
              </Link>
            ))}
      </div>
    </section>
  );
}
