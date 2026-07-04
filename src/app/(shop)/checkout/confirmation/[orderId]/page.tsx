"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Package, Truck, Home, ChevronRight } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { formatPrice, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/utils";
import type { Order } from "@/types";

const ORDER_STEPS = [
  { key: "placed", label: "Order Placed", icon: CheckCircle2 },
  { key: "confirmed", label: "Confirmed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

const STATUS_INDEX: Record<string, number> = {
  placed: 0, confirmed: 1, packed: 1, shipped: 2, delivered: 3,
};

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await ordersApi.getById(orderId);
      return data;
    },
    refetchInterval: (query) =>
      query.state.data?.status === "delivered" ? false : 30000,
  });

  if (isLoading) {
    return (
      <div className="container-page py-16 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-700 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Loading your order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-gray-600">Order not found.</p>
        <Link href="/" className="text-primary-700 hover:underline mt-2 block">Go Home</Link>
      </div>
    );
  }

  const currentStep = STATUS_INDEX[order.status] ?? 0;

  return (
    <div className="container-page py-8 max-w-2xl mx-auto">
      {/* Success header */}
      <div className="text-center mb-8">
        <CheckCircle2 size={56} className="mx-auto text-green-500 mb-3" />
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Placed Successfully!</h1>
        <p className="text-gray-500 text-sm">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          You&apos;ll receive a confirmation SMS shortly
        </p>
      </div>

      {/* Status tracker */}
      <div className="card p-6 mb-4">
        <h2 className="font-bold text-gray-900 mb-5">Order Status</h2>
        <div className="flex items-start justify-between relative">
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0">
            <div
              className="h-full bg-primary-700 transition-all"
              style={{ width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }}
            />
          </div>
          {ORDER_STEPS.map(({ key, label, icon: Icon }, i) => (
            <div key={key} className="flex flex-col items-center gap-2 z-10 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  i <= currentStep
                    ? "bg-primary-700 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <Icon size={18} />
              </div>
              <span className={`text-xs text-center leading-tight ${i <= currentStep ? "text-primary-700 font-semibold" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order details */}
      <div className="card p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-4">Order Details</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Payment Method</p>
            <p className="font-medium text-gray-900">
              {PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Payment Status</p>
            <p className={`font-medium ${order.payment_status === "paid" ? "text-green-600" : "text-orange-600"}`}>
              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">Delivery Address</p>
            <p className="font-medium text-gray-900">
              {order.delivery_address.full_name}, {order.delivery_address.address_line1},{" "}
              {order.delivery_address.city}, {order.delivery_address.district}
            </p>
          </div>
          {order.tracking_number && (
            <div className="col-span-2">
              <p className="text-gray-500">Tracking Number</p>
              <p className="font-medium text-gray-900">{order.tracking_number}</p>
            </div>
          )}
          <div className="col-span-2 border-t border-gray-100 pt-3">
            <div className="flex justify-between font-bold text-gray-900 text-base">
              <span>Total Paid</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/account/orders/${order.id}`}
          className="flex-1 flex items-center justify-center gap-2 btn-outline py-3 text-sm font-semibold rounded-lg"
        >
          View Order Details
        </Link>
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 btn-primary py-3 text-sm font-semibold rounded-lg"
        >
          Continue Shopping
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
