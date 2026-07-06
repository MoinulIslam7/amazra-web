"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { returnsApi, warrantyApi, getErrorMessage } from "@/lib/api";
import type { ReturnRequest, WarrantyClaim } from "@/types";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  completed: "bg-gray-200 text-gray-600",
};

function ActionButtons({
  status,
  onAction,
}: {
  status: string;
  onAction: (status: string) => void;
}) {
  if (status === "pending") {
    return (
      <div className="flex gap-2">
        <button onClick={() => onAction("approved")} className="text-xs font-semibold text-green-700 hover:underline">Approve</button>
        <button onClick={() => onAction("rejected")} className="text-xs font-semibold text-red-700 hover:underline">Reject</button>
      </div>
    );
  }
  if (status === "approved") {
    return (
      <button onClick={() => onAction("completed")} className="text-xs font-semibold text-primary-700 hover:underline">
        Mark Completed
      </button>
    );
  }
  return <span className="text-xs text-gray-400">—</span>;
}

export default function AdminReturnsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"returns" | "warranty">("returns");

  const { data: returns = [], isLoading: returnsLoading } = useQuery<ReturnRequest[]>({
    queryKey: ["admin", "returns"],
    queryFn: async () => (await returnsApi.adminList()).data,
    enabled: tab === "returns",
  });

  const { data: warranty = [], isLoading: warrantyLoading } = useQuery<WarrantyClaim[]>({
    queryKey: ["admin", "warranty"],
    queryFn: async () => (await warrantyApi.adminList()).data,
    enabled: tab === "warranty",
  });

  async function handleReturnAction(id: string, status: string) {
    try {
      await returnsApi.adminUpdateStatus(id, status);
      toast.success(`Return marked as ${status}`);
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleWarrantyAction(id: string, status: string) {
    try {
      await warrantyApi.adminUpdateStatus(id, status);
      toast.success(`Warranty claim marked as ${status}`);
      queryClient.invalidateQueries({ queryKey: ["admin", "warranty"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Returns & Warranty Claims</h1>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {(["returns", "warranty"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold capitalize ${
              tab === t ? "border-b-2 border-primary-700 text-primary-700" : "text-gray-500"
            }`}
          >
            {t === "returns" ? "Return Requests" : "Warranty Claims"}
          </button>
        ))}
      </div>

      {tab === "returns" ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {returnsLoading ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-400">Loading…</td></tr>
              ) : returns.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-400">No return requests.</td></tr>
              ) : (
                returns.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{r.order_reference}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{r.customer_name}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{r.reason ?? "—"}</td>
                    <td className="p-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="p-3 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right"><ActionButtons status={r.status} onAction={(s) => handleReturnAction(r.id, s)} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Issue</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {warrantyLoading ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-400">Loading…</td></tr>
              ) : warranty.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-400">No warranty claims.</td></tr>
              ) : (
                warranty.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{w.order_reference}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{w.product_name}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{w.customer_name}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400 max-w-[220px] truncate">{w.issue_desc}</td>
                    <td className="p-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[w.status]}`}>{w.status}</span>
                    </td>
                    <td className="p-3 text-right"><ActionButtons status={w.status} onAction={(s) => handleWarrantyAction(w.id, s)} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
