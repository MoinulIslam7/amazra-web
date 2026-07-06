"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, CheckCircle2, Package, Truck, Home, MapPin } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_METHOD_LABELS, getImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Order } from "@/types";

const ORDER_STEPS = [
  { key: "placed", label: "Placed", icon: CheckCircle2 },
  { key: "confirmed", label: "Confirmed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

const STATUS_INDEX: Record<string, number> = {
  placed: 0, confirmed: 1, packed: 1, shipped: 2, delivered: 3,
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await ordersApi.getById(orderId);
      return data;
    },
    refetchInterval: (query) => query.state.data?.status === "delivered" ? false : 30000,
  });

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>;
  }

  if (!order) {
    return <div className="text-center py-10"><p className="text-gray-500">Order not found.</p></div>;
  }

  const currentStep = STATUS_INDEX[order.status] ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/account/orders" className="text-gray-500 hover:text-primary-700">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Tracker */}
      <div className="card p-5">
        <div className="flex items-start justify-between relative">
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0">
            <div className="h-full bg-primary-700 transition-all"
              style={{ width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }} />
          </div>
          {ORDER_STEPS.map(({ key, label, icon: Icon }, i) => (
            <div key={key} className="flex flex-col items-center gap-2 z-10 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= currentStep ? "bg-primary-700 text-white" : "bg-gray-200 text-gray-400"}`}>
                <Icon size={18} />
              </div>
              <span className={`text-xs text-center ${i <= currentStep ? "text-primary-700 font-semibold" : "text-gray-400"}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-3">Items</h2>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-3">
              <Link href={`/products/${item.product_slug}`} className="flex-shrink-0">
                <div className="w-14 h-14 bg-gray-50 rounded border border-gray-100 overflow-hidden">
                  <Image
                    src={getImageUrl(item.image_url)}
                    alt={item.product_name}
                    width={56}
                    height={56}
                    className="object-contain w-full h-full p-1"
                  />
                </div>
              </Link>
              <div className="flex-1">
                <Link href={`/products/${item.product_slug}`} className="text-sm font-medium text-gray-900 hover:text-primary-700 line-clamp-2">
                  {item.product_name}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
              </div>
              <p className="font-semibold text-sm text-gray-900">{formatPrice(item.total_price)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-primary-700" />
            Delivery Address
          </h2>
          <address className="not-italic text-sm text-gray-700 space-y-0.5">
            <p className="font-medium">{order.delivery_address.full_name}</p>
            <p>{order.delivery_address.phone}</p>
            <p>{order.delivery_address.address_line1}</p>
            {order.delivery_address.address_line2 && <p>{order.delivery_address.address_line2}</p>}
            <p>{order.delivery_address.city}, {order.delivery_address.district}</p>
          </address>
        </div>

        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-3">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Method</span>
              <span>{PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Status</span>
              <span className={order.payment_status === "paid" ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
