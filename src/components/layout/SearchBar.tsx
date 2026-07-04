"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { searchApi } from "@/lib/api";
import { formatPrice, getImageUrl, debounce } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import type { Product } from "@/types";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSuggestions = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setResults([]); setLoading(false); return; }
      try {
        const { data } = await searchApi.autocomplete(q);
        setResults(data.items ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query.length >= 2) {
      setLoading(true);
      fetchSuggestions(query);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    trackEvent("search", { search_term: query.trim() });
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function handleClear() {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search for laptops, phones, accessories..."
          className="w-full h-10 pl-4 pr-20 rounded-md border border-gray-300 bg-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center rounded-r-md bg-primary-700 text-white hover:bg-primary-800 transition-colors"
        >
          <Search size={18} />
        </button>
      </form>

      {isOpen && (query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {loading && (
            <div className="p-4 text-center text-sm text-gray-500">Searching…</div>
          )}
          {!loading && results.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No results for &quot;{query}&quot;
            </div>
          )}
          {!loading && results.length > 0 && (
            <>
              <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {results.slice(0, 6).map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={getImageUrl(product.images?.[0]?.url)}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-primary-700 font-semibold">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="block px-4 py-2.5 text-center text-sm text-primary-700 font-medium bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                See all results for &quot;{query}&quot;
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
