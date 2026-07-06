"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Printer } from "lucide-react";
import { toast } from "react-toastify";
import { ordersApi, getErrorMessage } from "@/lib/api";
import {
  formatPrice,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/utils";
import type { AdminOrderDetail } from "@/types";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["packed"],
  packed: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  returned: [],
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [printing, setPrinting] = useState(false);

  const { data: order, isLoading } = useQuery<AdminOrderDetail>({
    queryKey: ["admin", "order", id],
    queryFn: async () => (await ordersApi.adminGet(id)).data,
  });

  async function handleStatusUpdate() {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await ordersApi.adminUpdateStatus(id, newStatus, note || undefined);
      toast.success("Order status updated");
      setNote("");
      setNewStatus("");
      queryClient.invalidateQueries({ queryKey: ["admin", "order", id] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  }

  async function handlePrintInvoice() {
    setPrinting(true);
    try {
      const response = await ordersApi.adminInvoice(id);
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPrinting(false);
    }
  }

  if (isLoading) return <div className="skeleton h-96 rounded-lg" />;
  if (!order) return <p className="text-sm text-gray-500">Order not found.</p>;

  const options = ALLOWED_TRANSITIONS[order.status] ?? [];

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-2">
        <Link href="/admin/orders" className="text-gray-400 hover:text-gray-700">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{order.reference}</h1>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
        <button
          onClick={handlePrintInvoice}
          disabled={printing}
          className="ml-auto btn-outline text-sm h-9 px-4 flex items-center gap-1.5"
        >
          <Printer size={15} /> {printing ? "Preparing…" : "Print Invoice"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Items</h2>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{item.product_name} × {item.quantity}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatPrice(Number(item.total_price))}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 mt-3 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Discount</span><span>-{formatPrice(Number(order.discount_amount))}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping</span><span>{formatPrice(Number(order.shipping_amount))}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 text-base">
              <span>Total</span><span>{formatPrice(Number(order.total_amount))}</span>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Customer</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">{order.customer_name}</p>
          <p className="text-sm text-gray-500">{order.customer_email}</p>
          <p className="text-sm text-gray-500">{order.customer_phone}</p>
          {order.branch_name && <p className="text-xs text-gray-400 pt-1">Branch: {order.branch_name}</p>}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Payment: {PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method} ({order.payment_status})
            </p>
            {order.tracking_number && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">Tracking: {order.tracking_number}</p>
            )}
          </div>
        </div>
      </div>

      {options.length > 0 && (
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Change Status</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="h-9 px-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">Select new status…</option>
              {options.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_LABELS[s] ?? s}</option>
              ))}
            </select>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="h-9 px-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 flex-1 min-w-[160px]"
            />
            <button onClick={handleStatusUpdate} disabled={!newStatus || updating} className="btn-primary text-sm h-9 px-5">
              {updating ? "Updating…" : "Update"}
            </button>
          </div>
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Status Timeline</h2>
        <ul className="space-y-3">
          {order.status_history.map((h, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-primary-700 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{h.status}</p>
                <p className="text-xs text-gray-500">
                  {new Date(h.changed_at).toLocaleString()}
                  {h.changed_by_name ? ` · by ${h.changed_by_name}` : ""}
                  {h.note ? ` · ${h.note}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
