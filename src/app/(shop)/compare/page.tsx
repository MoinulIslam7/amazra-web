"use client";

import Image from "next/image";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { Scale, X } from "lucide-react";
import { productsApi } from "@/lib/api";
import { useCompareStore } from "@/store/compare";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import type { Product } from "@/types";

export default function ComparePage() {
  const { items, remove, clear } = useCompareStore();

  const results = useQueries({
    queries: items.map((item) => ({
      queryKey: ["product", item.slug],
      queryFn: async () => {
        const { data } = await productsApi.getBySlug(item.slug);
        return data as Product;
      },
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const products = results.map((r) => r.data).filter(Boolean) as Product[];

  const specKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specs ?? {})))
  );

  return (
    <div className="container-page py-4">
      <Breadcrumb items={[{ label: "Compare Products" }]} />

      <div className="flex items-center justify-between mt-4 mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Scale size={22} className="text-primary-700" />
          Compare Products
        </h1>
        {items.length > 0 && (
          <button onClick={clear} className="text-sm text-gray-500 hover:text-red-600">
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Scale size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            No products to compare yet
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Use the compare icon on a product card to add up to 3 items here.
          </p>
          <Link href="/products" className="btn-primary inline-flex">
            Browse Products
          </Link>
        </div>
      ) : isLoading ? (
        <ProductGridSkeleton count={items.length} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="w-40" />
                {products.map((p) => (
                  <th key={p.id} className="p-3 align-top text-left">
                    <div className="relative">
                      <button
                        onClick={() => remove(p.id)}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center text-gray-400 hover:text-red-600"
                        aria-label={`Remove ${p.name}`}
                      >
                        <X size={13} />
                      </button>
                      <Link href={`/products/${p.slug}`} className="block">
                        <div className="aspect-square w-32 mx-auto bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden mb-2">
                          <Image
                            src={getImageUrl(p.images?.[0]?.url)}
                            alt={p.name}
                            width={128}
                            height={128}
                            className="object-contain w-full h-full p-3"
                          />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 text-center">
                          {p.name}
                        </p>
                        <p className="text-sm font-bold text-primary-700 text-center mt-1">
                          {formatPrice(p.price)}
                        </p>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200 dark:border-gray-800">
                <td className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Brand</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                    {p.brand_name ?? "—"}
                  </td>
                ))}
              </tr>
              {specKeys.map((key, i) => (
                <tr
                  key={key}
                  className={`border-t border-gray-200 dark:border-gray-800 ${i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/50" : ""}`}
                >
                  <td className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/_/g, " ")}
                  </td>
                  {products.map((p) => {
                    const value = (p.specs ?? {})[key];
                    return (
                      <td key={p.id} className="p-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                        {value === undefined || value === null || value === ""
                          ? "—"
                          : typeof value === "boolean"
                          ? value
                            ? "Yes"
                            : "No"
                          : String(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
