"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Wallet, AlertTriangle, PackageSearch } from "lucide-react";
import { adminApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { LowStockItem } from "@/types";

interface AdminOrderSummary {
  id: string;
  reference: string;
  status: string;
  total_amount: string;
  payment_status: string;
  created_at: string;
}

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
  return { start, end };
}

function Tile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { start, end } = todayRange();

  const { data: todaysOrders = [], isLoading: ordersLoading } = useQuery<AdminOrderSummary[]>({
    queryKey: ["admin", "orders", "today"],
    queryFn: async () => {
      const { data } = await adminApi.orders({ start_date: start, end_date: end, per_page: 200 });
      return data;
    },
  });

  const { data: lowStock = [], isLoading: lowStockLoading } = useQuery<LowStockItem[]>({
    queryKey: ["admin", "low-stock"],
    queryFn: async () => {
      const { data } = await adminApi.lowStock();
      return data;
    },
  });

  const revenueToday = todaysOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500">Today at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Tile
          icon={ShoppingBag}
          label="Today's Orders"
          value={ordersLoading ? "…" : String(todaysOrders.length)}
          accent="bg-blue-600"
        />
        <Tile
          icon={Wallet}
          label="Today's Revenue"
          value={ordersLoading ? "…" : formatPrice(revenueToday)}
          accent="bg-green-600"
        />
        <Tile
          icon={AlertTriangle}
          label="Low Stock Alerts"
          value={lowStockLoading ? "…" : String(lowStock.length)}
          accent="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Orders</h2>
          {ordersLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-10 rounded" />)}</div>
          ) : todaysOrders.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No orders placed today yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {todaysOrders.slice(0, 8).map((o) => (
                <li key={o.id} className="py-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{o.reference}</span>
                  <span className="text-gray-500 capitalize">{o.status}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatPrice(Number(o.total_amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <PackageSearch size={16} className="text-orange-500" />
            Low Stock Products
          </h2>
          {lowStockLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-10 rounded" />)}</div>
          ) : lowStock.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">All products are well stocked.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {lowStock.slice(0, 8).map((item) => (
                <li key={`${item.product_id}-${item.branch_id}`} className="py-2 flex items-center justify-between text-sm">
                  <Link
                    href={`/admin/products/${item.product_id}`}
                    className="font-medium text-gray-800 dark:text-gray-200 hover:text-primary-700 truncate max-w-[180px]"
                  >
                    {item.product_name}
                  </Link>
                  <span className="text-gray-500">{item.branch_name}</span>
                  <span className="font-semibold text-orange-600">{item.available_qty} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
