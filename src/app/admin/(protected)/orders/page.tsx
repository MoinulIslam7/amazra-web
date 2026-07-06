"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Download, Search } from "lucide-react";
import { ordersApi, branchesApi } from "@/lib/api";
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import type { Branch } from "@/types";

interface AdminOrderRow {
  id: string;
  reference: string;
  status: string;
  total_amount: string;
  payment_status: string;
  created_at: string;
}

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("");
  const [branchId, setBranchId] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const params = {
    status: status || undefined,
    branch_id: branchId || undefined,
    search: search || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    per_page: 100,
  };

  const { data: orders = [], isLoading } = useQuery<AdminOrderRow[]>({
    queryKey: ["admin", "orders", "list", params],
    queryFn: async () => (await ordersApi.adminList(params)).data,
  });

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["branches"],
    queryFn: async () => (await branchesApi.list()).data,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Orders</h1>
        <a
          href={ordersApi.adminExportUrl(params)}
          className="btn-outline text-sm h-9 px-4 flex items-center gap-1.5"
        >
          <Download size={15} /> Export CSV
        </a>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference…"
            className="w-full h-9 pl-8 pr-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 px-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
          <option value="">All Statuses</option>
          {Object.keys(ORDER_STATUS_LABELS).map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="h-9 px-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
          <option value="">All Branches</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 px-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 px-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Reference</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">No orders found.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                  <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{o.reference}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {ORDER_STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400 capitalize">{o.payment_status}</td>
                  <td className="p-3 font-semibold text-gray-900 dark:text-gray-100">{formatPrice(Number(o.total_amount))}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-primary-700 hover:underline text-xs font-medium">
                      View
                    </Link>
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
