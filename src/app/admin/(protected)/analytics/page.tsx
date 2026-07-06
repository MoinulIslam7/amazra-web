"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, TrendingUp, ShoppingBag, Wallet } from "lucide-react";
import { analyticsApi, couponsApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { exportToCsv } from "@/lib/csv";
import { BarChart } from "@/components/admin/BarChart";
import type {
  SalesSummary,
  CategoryRevenue,
  BranchRevenue,
  TopProduct,
  CustomerAcquisitionDay,
  Coupon,
} from "@/types";

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function Tile({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent: string }) {
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

function SectionHeader({ title, onExport }: { title: string; onExport: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      <button onClick={onExport} className="flex items-center gap-1 text-xs text-primary-700 hover:underline">
        <Download size={13} /> Export CSV
      </button>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [startDate, setStartDate] = useState(isoDaysAgo(30));
  const [endDate, setEndDate] = useState(isoDaysAgo(0));

  const range = [`${startDate}T00:00:00`, `${endDate}T23:59:59`] as const;

  const { data: sales, isLoading: salesLoading } = useQuery<SalesSummary>({
    queryKey: ["analytics", "sales", startDate, endDate],
    queryFn: async () => (await analyticsApi.sales(range[0], range[1])).data,
  });

  const { data: byCategory = [], isLoading: categoryLoading } = useQuery<CategoryRevenue[]>({
    queryKey: ["analytics", "category", startDate, endDate],
    queryFn: async () => (await analyticsApi.byCategory(range[0], range[1])).data,
  });

  const { data: byBranch = [], isLoading: branchLoading } = useQuery<BranchRevenue[]>({
    queryKey: ["analytics", "branch", startDate, endDate],
    queryFn: async () => (await analyticsApi.byBranch(range[0], range[1])).data,
  });

  const { data: topProducts = [], isLoading: productsLoading } = useQuery<TopProduct[]>({
    queryKey: ["analytics", "top-products", startDate, endDate],
    queryFn: async () => (await analyticsApi.topProducts(range[0], range[1], 20)).data,
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery<CustomerAcquisitionDay[]>({
    queryKey: ["analytics", "customers", startDate, endDate],
    queryFn: async () => (await analyticsApi.customers(range[0], range[1])).data,
  });

  const { data: coupons = [], isLoading: couponsLoading } = useQuery<Coupon[]>({
    queryKey: ["admin", "coupons"],
    queryFn: async () => (await couponsApi.list()).data,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Analytics & Reports</h1>
        <div className="flex items-center gap-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 px-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 px-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" />
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Tile icon={ShoppingBag} label="Total Orders" value={salesLoading ? "…" : String(sales?.total_orders ?? 0)} accent="bg-blue-600" />
        <Tile icon={Wallet} label="Total Revenue" value={salesLoading ? "…" : formatPrice(Number(sales?.total_revenue ?? 0))} accent="bg-green-600" />
        <Tile icon={TrendingUp} label="Avg. Order Value" value={salesLoading ? "…" : formatPrice(Number(sales?.average_order_value ?? 0))} accent="bg-purple-600" />
      </div>

      {/* Daily revenue chart */}
      <div className="card p-5">
        <SectionHeader
          title="Revenue Trend"
          onExport={() =>
            exportToCsv(
              `sales_${startDate}_${endDate}.csv`,
              ["date", "order_count", "revenue"],
              (sales?.daily ?? []).map((d) => [d.date, d.order_count, d.revenue])
            )
          }
        />
        {salesLoading ? (
          <div className="skeleton h-56 rounded-lg" />
        ) : (
          <BarChart
            data={(sales?.daily ?? []).map((d) => ({
              label: d.date.slice(5),
              value: Number(d.revenue),
            }))}
            valueFormatter={(v) => formatPrice(v)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by category */}
        <div className="card p-5">
          <SectionHeader
            title="Revenue by Category"
            onExport={() =>
              exportToCsv(
                `revenue_by_category_${startDate}_${endDate}.csv`,
                ["category", "units_sold", "revenue"],
                byCategory.map((c) => [c.category_name, c.units_sold, c.revenue])
              )
            }
          />
          {categoryLoading ? (
            <div className="skeleton h-56 rounded-lg" />
          ) : (
            <BarChart
              data={byCategory.slice(0, 8).map((c) => ({ label: c.category_name, value: Number(c.revenue) }))}
              valueFormatter={(v) => formatPrice(v)}
            />
          )}
        </div>

        {/* Revenue by branch */}
        <div className="card p-5">
          <SectionHeader
            title="Revenue by Branch"
            onExport={() =>
              exportToCsv(
                `revenue_by_branch_${startDate}_${endDate}.csv`,
                ["branch", "order_count", "revenue"],
                byBranch.map((b) => [b.branch_name, b.order_count, b.revenue])
              )
            }
          />
          {branchLoading ? (
            <div className="skeleton h-56 rounded-lg" />
          ) : (
            <BarChart
              data={byBranch.map((b) => ({ label: b.branch_name, value: Number(b.revenue) }))}
              valueFormatter={(v) => formatPrice(v)}
            />
          )}
        </div>
      </div>

      {/* Customer acquisition */}
      <div className="card p-5">
        <SectionHeader
          title="Customer Acquisition (New vs Returning)"
          onExport={() =>
            exportToCsv(
              `customer_acquisition_${startDate}_${endDate}.csv`,
              ["date", "new_customers", "returning_customers"],
              customers.map((c) => [c.date, c.new_customers, c.returning_customers])
            )
          }
        />
        {customersLoading ? (
          <div className="skeleton h-56 rounded-lg" />
        ) : (
          <>
            <BarChart
              data={customers.map((c) => ({
                label: c.date.slice(5),
                value: c.new_customers,
                secondaryValue: c.returning_customers,
              }))}
            />
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#cc0000] inline-block" /> New</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f8b4b4] inline-block" /> Returning</span>
            </div>
          </>
        )}
      </div>

      {/* Top products */}
      <div className="card p-5">
        <SectionHeader
          title="Top Products"
          onExport={() =>
            exportToCsv(
              `top_products_${startDate}_${endDate}.csv`,
              ["product", "units_sold", "revenue"],
              topProducts.map((p) => [p.product_name, p.units_sold, p.revenue])
            )
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left py-2">#</th>
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">Units Sold</th>
                <th className="text-left py-2">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {productsLoading ? (
                <tr><td colSpan={4} className="py-6 text-center text-gray-400">Loading…</td></tr>
              ) : topProducts.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-gray-400">No sales in this range.</td></tr>
              ) : (
                topProducts.map((p, i) => (
                  <tr key={p.product_id}>
                    <td className="py-2 text-gray-400">{i + 1}</td>
                    <td className="py-2 font-medium text-gray-900 dark:text-gray-100">{p.product_name}</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{p.units_sold}</td>
                    <td className="py-2 font-semibold text-gray-900 dark:text-gray-100">{formatPrice(Number(p.revenue))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon usage */}
      <div className="card p-5">
        <SectionHeader
          title="Coupon Usage"
          onExport={() =>
            exportToCsv(
              "coupon_usage.csv",
              ["code", "type", "value", "usage_count", "max_uses", "is_active"],
              coupons.map((c) => [c.code, c.type, c.value, c.usage_count, c.max_uses ?? "unlimited", c.is_active ? "yes" : "no"])
            )
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left py-2">Code</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Used</th>
                <th className="text-left py-2">Limit</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {couponsLoading ? (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">Loading…</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No coupons created yet.</td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 font-medium text-gray-900 dark:text-gray-100">{c.code}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400 capitalize">{c.type.replace("_", " ")}</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{c.usage_count}</td>
                    <td className="py-2 text-gray-500">{c.max_uses ?? "Unlimited"}</td>
                    <td className="py-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
