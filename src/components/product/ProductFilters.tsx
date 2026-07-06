"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { brandsApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Brand } from "@/types";

interface FilterState {
  brands: string[];
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-2"
      >
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && children}
    </div>
  );
}

export function ProductFilters({ filters, onChange, onReset }: ProductFiltersProps) {
  const { data } = useQuery<{ items: Brand[] }>({
    queryKey: ["brands", "all"],
    queryFn: async () => {
      const { data } = await brandsApi.list({ page_size: 50 });
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const brands = data?.items ?? [];

  const toggleBrand = (slug: string) => {
    const next = filters.brands.includes(slug)
      ? filters.brands.filter((b) => b !== slug)
      : [...filters.brands, slug];
    onChange({ ...filters, brands: next });
  };

  const hasFilters =
    filters.brands.length > 0 ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock;

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Filter size={16} />
          Filters
        </h3>
        {hasFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-primary-700 hover:underline"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Availability */}
      <Section title="Availability">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onChange({ ...filters, inStock: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
          />
          In Stock Only
        </label>
      </Section>

      {/* Price range */}
      <Section title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary-500"
          />
          <span className="text-gray-400 text-sm">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            { label: "Under ৳10K", min: "", max: "10000" },
            { label: "৳10K–25K", min: "10000", max: "25000" },
            { label: "৳25K–50K", min: "25000", max: "50000" },
            { label: "৳50K+", min: "50000", max: "" },
          ].map(({ label, min, max }) => (
            <button
              key={label}
              onClick={() => onChange({ ...filters, minPrice: min, maxPrice: max })}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                filters.minPrice === min && filters.maxPrice === max
                  ? "bg-primary-700 text-white border-primary-700"
                  : "border-gray-300 text-gray-600 hover:border-primary-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      {/* Brands */}
      {brands.length > 0 && (
        <Section title="Brand">
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-hide">
            {brands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
              >
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                />
                {brand.name}
              </label>
            ))}
          </div>
        </Section>
      )}
    </aside>
  );
}
