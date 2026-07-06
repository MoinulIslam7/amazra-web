"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ArrowRightLeft, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { inventoryApi, productsApi, branchesApi, getErrorMessage } from "@/lib/api";
import type { InventoryLevel, InventoryTransfer, LowStockItem, Branch, Product } from "@/types";

const TRANSFER_STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  in_transit: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
};

const NEXT_TRANSFER_STATUS: Record<string, string> = {
  pending: "approved",
  approved: "in_transit",
  in_transit: "completed",
};

function LowStockTab() {
  const { data: items = [], isLoading } = useQuery<LowStockItem[]>({
    queryKey: ["admin", "low-stock"],
    queryFn: async () => (await inventoryApi.lowStock()).data,
  });

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-xs uppercase">
          <tr>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Branch</th>
            <th className="p-3 text-left">Available</th>
            <th className="p-3 text-left">Threshold</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {isLoading ? (
            <tr><td colSpan={4} className="p-6 text-center text-gray-400">Loading…</td></tr>
          ) : items.length === 0 ? (
            <tr><td colSpan={4} className="p-6 text-center text-gray-400">All products are well stocked.</td></tr>
          ) : (
            items.map((item) => (
              <tr key={`${item.product_id}-${item.branch_id}`} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{item.product_name}</td>
                <td className="p-3 text-gray-600 dark:text-gray-400">{item.branch_name}</td>
                <td className="p-3 font-semibold text-orange-600">{item.available_qty}</td>
                <td className="p-3 text-gray-500">{item.low_stock_threshold}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function StockLookupTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustBranch, setAdjustBranch] = useState<string | null>(null);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: searchResults = [] } = useQuery<Product[]>({
    queryKey: ["admin", "product-search", search],
    queryFn: async () => (await productsApi.adminList({ per_page: 10 })).data,
    enabled: search.length >= 2,
    select: (data) => data.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
  });

  const { data: levels = [], isLoading: levelsLoading } = useQuery<InventoryLevel[]>({
    queryKey: ["admin", "inventory", selectedProduct?.id],
    queryFn: async () => (await inventoryApi.getByProduct(selectedProduct!.id)).data,
    enabled: !!selectedProduct,
  });

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct || !adjustBranch || !delta || !reason) return;
    setSubmitting(true);
    try {
      await inventoryApi.adjust({
        product_id: selectedProduct.id,
        branch_id: adjustBranch,
        delta: Number(delta),
        reason,
      });
      toast.success("Stock adjusted");
      setDelta("");
      setReason("");
      setAdjustBranch(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory", selectedProduct.id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "low-stock"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedProduct(null); }}
          placeholder="Search product by name…"
          className="w-full h-9 pl-8 pr-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500"
        />
        {search.length >= 2 && !selectedProduct && searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-56 overflow-y-auto">
            {searchResults.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedProduct(p); setSearch(p.name); }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="p-3 text-left">Branch</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-left">Reserved</th>
                <th className="p-3 text-left">Available</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {levelsLoading ? (
                <tr><td colSpan={5} className="p-6 text-center text-gray-400">Loading…</td></tr>
              ) : levels.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-gray-400">No inventory records for this product.</td></tr>
              ) : (
                levels.map((lvl) => (
                  <tr key={lvl.branch_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{lvl.branch_name}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{lvl.quantity}</td>
                    <td className="p-3 text-gray-500">{lvl.reserved_qty}</td>
                    <td className={`p-3 font-semibold ${lvl.available_qty < lvl.low_stock_threshold ? "text-orange-600" : "text-green-600"}`}>
                      {lvl.available_qty}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setAdjustBranch(adjustBranch === lvl.branch_id ? null : lvl.branch_id)}
                        className="text-xs text-primary-700 hover:underline font-medium"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {adjustBranch && (
            <form onSubmit={handleAdjust} className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2">
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                placeholder="± Quantity"
                className="h-9 w-32 px-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (required)"
                className="h-9 flex-1 min-w-[180px] px-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
              <button type="submit" disabled={submitting} className="btn-primary text-sm h-9 px-5">
                {submitting ? "Saving…" : "Apply Adjustment"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function TransfersTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: transfers = [], isLoading } = useQuery<InventoryTransfer[]>({
    queryKey: ["admin", "transfers"],
    queryFn: async () => (await inventoryApi.listTransfers({ per_page: 50 })).data,
  });

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["branches"],
    queryFn: async () => (await branchesApi.list()).data,
  });

  const { data: productResults = [] } = useQuery<Product[]>({
    queryKey: ["admin", "product-search-transfer", productSearch],
    queryFn: async () => (await productsApi.adminList({ per_page: 10 })).data,
    enabled: productSearch.length >= 2,
    select: (data) => data.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase())),
  });

  function branchName(id: string) {
    return branches.find((b) => b.id === id)?.name ?? id.slice(0, 8);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !fromBranch || !toBranch || !quantity) return;
    setSubmitting(true);
    try {
      await inventoryApi.createTransfer({
        product_id: productId,
        from_branch_id: fromBranch,
        to_branch_id: toBranch,
        quantity: Number(quantity),
      });
      toast.success("Transfer requested");
      setShowForm(false);
      setProductId("");
      setProductSearch("");
      setFromBranch("");
      setToBranch("");
      setQuantity("");
      queryClient.invalidateQueries({ queryKey: ["admin", "transfers"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function advanceStatus(transfer: InventoryTransfer) {
    const next = NEXT_TRANSFER_STATUS[transfer.status];
    if (!next) return;
    try {
      await inventoryApi.updateTransferStatus(transfer.id, next);
      toast.success(`Transfer moved to ${next.replace("_", " ")}`);
      queryClient.invalidateQueries({ queryKey: ["admin", "transfers"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm((s) => !s)} className="btn-primary text-sm h-9 px-4 flex items-center gap-1.5 w-fit">
        <Plus size={16} /> Request Transfer
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-4 space-y-3">
          <div className="relative">
            <input
              value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); setProductId(""); }}
              placeholder="Search product…"
              className="w-full h-9 px-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            {productSearch.length >= 2 && !productId && productResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {productResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setProductId(p.id); setProductSearch(p.name); }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={fromBranch} onChange={(e) => setFromBranch(e.target.value)} className="h-9 px-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
              <option value="">From branch…</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <ArrowRightLeft size={14} className="text-gray-400" />
            <select value={toBranch} onChange={(e) => setToBranch(e.target.value)} className="h-9 px-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
              <option value="">To branch…</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Qty"
              className="h-9 w-24 px-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            <button type="submit" disabled={submitting || !productId} className="btn-primary text-sm h-9 px-5">
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Route</th>
              <th className="p-3 text-left">Qty</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">Loading…</td></tr>
            ) : transfers.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">No transfers yet.</td></tr>
            ) : (
              transfers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                  <td className="p-3 text-gray-700 dark:text-gray-300">{branchName(t.from_branch_id)} → {branchName(t.to_branch_id)}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{t.quantity}</td>
                  <td className="p-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${TRANSFER_STATUS_BADGE[t.status]}`}>
                      {t.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {NEXT_TRANSFER_STATUS[t.status] && (
                      <button onClick={() => advanceStatus(t)} className="text-xs text-primary-700 hover:underline font-medium">
                        Mark {NEXT_TRANSFER_STATUS[t.status].replace("_", " ")}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminInventoryPage() {
  const [tab, setTab] = useState<"low-stock" | "lookup" | "transfers">("low-stock");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Inventory</h1>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {([
          ["low-stock", "Low Stock"],
          ["lookup", "Stock Lookup"],
          ["transfers", "Transfers"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold ${tab === key ? "border-b-2 border-primary-700 text-primary-700" : "text-gray-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "low-stock" && <LowStockTab />}
      {tab === "lookup" && <StockLookupTab />}
      {tab === "transfers" && <TransfersTab />}
    </div>
  );
}
