"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { toast } from "react-toastify";
import { productsApi, categoriesApi, brandsApi, getErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Product, Category, Brand } from "@/types";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  discontinued: "bg-gray-200 text-gray-600",
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["admin", "products", { page, status, category, brand }],
    queryFn: async () => {
      const { data } = await productsApi.adminList({
        page,
        per_page: 24,
        status: status || undefined,
        category: category || undefined,
        brand: brand || undefined,
      });
      return data;
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await categoriesApi.list()).data,
    staleTime: 5 * 60 * 1000,
  });

  const { data: brandsData } = useQuery<{ items: Brand[] }>({
    queryKey: ["brands", "all"],
    queryFn: async () => (await brandsApi.list({ page_size: 100 })).data,
    staleTime: 5 * 60 * 1000,
  });
  const brands = brandsData?.items ?? [];

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  function toggleSelect(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function handleBulkStatus(newStatus: string) {
    if (selected.length === 0) return;
    try {
      await Promise.all(selected.map((id) => productsApi.updateStatus(id, newStatus)));
      toast.success(`Updated ${selected.length} product(s) to ${newStatus}`);
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
        <Link href="/admin/products/new" className="btn-primary text-sm h-9 px-4 flex items-center gap-1.5">
          <Plus size={16} /> New Product
        </Link>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full h-9 pl-8 pr-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 px-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="discontinued">Discontinued</option>
        </select>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="h-9 px-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={brand}
          onChange={(e) => { setBrand(e.target.value); setPage(1); }}
          className="h-9 px-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-md px-4 py-2">
          <span className="text-sm text-primary-800 font-medium">{selected.length} selected</span>
          <button onClick={() => handleBulkStatus("active")} className="text-xs font-semibold text-green-700 hover:underline">Activate</button>
          <button onClick={() => handleBulkStatus("draft")} className="text-xs font-semibold text-yellow-700 hover:underline">Set Draft</button>
          <button onClick={() => handleBulkStatus("discontinued")} className="text-xs font-semibold text-red-700 hover:underline">Discontinue</button>
          <button onClick={() => setSelected([])} className="text-xs text-gray-500 hover:underline ml-auto">Clear</button>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-3 w-8"><input type="checkbox" disabled /></th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Featured</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">No products found.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/products/${p.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-700">
                      {p.name}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{formatPrice(p.price)}</td>
                  <td className="p-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{p.is_featured ? "Yes" : "—"}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/products/${p.id}`} className="text-primary-700 hover:underline text-xs font-medium">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-gray-500">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={products.length < 24}
          className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
