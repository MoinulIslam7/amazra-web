"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import type { Product } from "@/types";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

interface FilterState {
  brands: string[];
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
}

const DEFAULT_FILTERS: FilterState = { brands: [], minPrice: "", maxPrice: "", inStock: false };

export default function AllProductsPage() {
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const queryParams = {
    sort,
    page,
    page_size: 20,
    ...(filters.brands.length && { brand: filters.brands.join(",") }),
    ...(filters.minPrice && { min_price: filters.minPrice }),
    ...(filters.maxPrice && { max_price: filters.maxPrice }),
    ...(filters.inStock && { in_stock: true }),
  };

  const { data, isLoading } = useQuery<{ items: Product[]; total: number; total_pages: number }>({
    queryKey: ["products", "all", queryParams],
    queryFn: async () => {
      const { data } = await productsApi.list(queryParams);
      return data;
    },
  });

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;

  return (
    <div className="container-page py-4">
      <Breadcrumb items={[{ label: "All Products" }]} />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">
          All Products
          {!isLoading && <span className="ml-2 text-sm font-normal text-gray-500">({total})</span>}
        </h1>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-primary-500 bg-white"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-6">
        <div className="hidden lg:block w-56 flex-shrink-0">
          <ProductFilters
            filters={filters}
            onChange={(f) => { setFilters(f); setPage(1); }}
            onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
          />
        </div>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <ProductGridSkeleton count={20} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const n = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return <button key={n} onClick={() => setPage(n)}
                  className={`w-9 h-9 text-sm rounded-md font-medium ${page === n ? "bg-primary-700 text-white" : "border border-gray-300 hover:bg-gray-50 text-gray-700"}`}>{n}</button>;
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
