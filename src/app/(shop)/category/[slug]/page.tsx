"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { productsApi, categoriesApi } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import type { Product, Category } from "@/types";

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

const DEFAULT_FILTERS: FilterState = {
  brands: [],
  minPrice: "",
  maxPrice: "",
  inStock: false,
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => { setPage(1); }, [filters, sort]);

  const { data: category } = useQuery<Category>({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data } = await categoriesApi.getBySlug(slug);
      return data;
    },
  });

  const queryParams = {
    category: slug,
    sort,
    page,
    page_size: 16,
    ...(filters.brands.length && { brand: filters.brands.join(",") }),
    ...(filters.minPrice && { min_price: filters.minPrice }),
    ...(filters.maxPrice && { max_price: filters.maxPrice }),
    ...(filters.inStock && { in_stock: true }),
  };

  const { data, isLoading } = useQuery<{ items: Product[]; total: number; total_pages: number }>({
    queryKey: ["products", "category", slug, queryParams],
    queryFn: async () => {
      const { data } = await productsApi.list(queryParams);
      return data;
    },
    staleTime: 60 * 1000,
  });

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;

  return (
    <div className="container-page py-4">
      <Breadcrumb items={[{ label: category?.name ?? slug, href: `/category/${slug}` }]} />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {category?.name ?? "Products"}
          {!isLoading && <span className="ml-2 text-sm font-normal text-gray-500">({total})</span>}
        </h1>

        <div className="flex items-center gap-2">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-1.5 text-sm font-medium border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-primary-500 bg-white"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <ProductFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        </div>

        {/* Mobile filter drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>✕</button>
              </div>
              <ProductFilters
                filters={filters}
                onChange={(f) => { setFilters(f); setShowMobileFilters(false); }}
                onReset={() => { setFilters(DEFAULT_FILTERS); setShowMobileFilters(false); }}
              />
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <ProductGridSkeleton count={16} />
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">😕</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 text-sm rounded-md font-medium transition-colors ${
                      page === pageNum
                        ? "bg-primary-700 text-white"
                        : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
