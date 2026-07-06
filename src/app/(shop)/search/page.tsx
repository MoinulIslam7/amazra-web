"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { searchApi } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { trackEvent } from "@/lib/analytics";
import type { Product, SearchFacets } from "@/types";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  useEffect(() => { setPage(1); setSelectedBrands([]); }, [q]);

  const params = {
    q,
    sort,
    page,
    page_size: 16,
    ...(selectedBrands.length && { brand: selectedBrands.join(",") }),
  };

  const { data, isLoading } = useQuery<{
    items: Product[];
    total: number;
    total_pages: number;
    facets: SearchFacets;
  }>({
    queryKey: ["search", params],
    queryFn: async () => {
      const { data } = await searchApi.search(params);
      return data;
    },
    enabled: q.length > 0,
    staleTime: 30 * 1000,
  });

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;
  const facets = data?.facets;

  useEffect(() => {
    if (!isLoading && q) {
      trackEvent("view_search_results", { search_term: q, results_count: total });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, isLoading, total]);

  if (!q) {
    return (
      <div className="py-16 text-center">
        <Search size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Start searching</h2>
        <p className="text-sm text-gray-500 mt-1">Enter a product name to find what you&apos;re looking for</p>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: `Search: "${q}"` }]} />

      <div className="flex items-center justify-between mb-5 mt-2">
        <h1 className="text-lg font-bold text-gray-900">
          {isLoading ? "Searching…" : (
            <>{total} results for &quot;<span className="text-primary-700">{q}</span>&quot;</>
          )}
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
        {facets && (
          <aside className="hidden lg:block w-48 flex-shrink-0">
            {facets.brands.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Brand</h3>
                <div className="space-y-1.5">
                  {facets.brands.map((b) => (
                    <label key={b.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b.key)}
                        onChange={() => {
                          setSelectedBrands((prev) =>
                            prev.includes(b.key) ? prev.filter((x) => x !== b.key) : [...prev, b.key]
                          );
                          setPage(1);
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-primary-700"
                      />
                      <span className="flex-1">{b.label}</span>
                      <span className="text-xs text-gray-400">({b.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <ProductGridSkeleton count={16} />
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Search size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No results for &quot;{q}&quot;</h3>
              <p className="text-sm text-gray-500">Try different keywords or check your spelling</p>
            </div>
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
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="container-page py-4">
      <Suspense fallback={<ProductGridSkeleton count={16} />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
