"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Order } from "@/types";

export default function OrdersPage() {
  const { data, isLoading } = useQuery<{ items: Order[] }>({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await ordersApi.list();
      return data;
    },
  });

  const orders = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package size={20} className="text-primary-700" />
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="card p-10 text-center">
          <Package size={40} className="mx-auto text-gray-200 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No orders yet</h3>
          <p className="text-sm text-gray-500 mb-4">Start shopping to see your orders here</p>
          <Link href="/products" className="btn-primary px-5 py-2 text-sm">
            Shop Now
          </Link>
        </div>
      )}

      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="card p-4 block hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(order.created_at).toLocaleDateString("en-BD", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}
            >
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-gray-600">
              {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
            </p>
            <p className="font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
