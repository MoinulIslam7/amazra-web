"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { formatPrice, getImageUrl, PAYMENT_METHOD_LABELS } from "@/lib/utils";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

const addressSchema = z.object({
  full_name: z.string().min(2, "Name required"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid BD phone number"),
  address_line1: z.string().min(5, "Address required"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "City required"),
  district: z.string().min(2, "District required"),
});

type AddressForm = z.infer<typeof addressSchema>;

const PAYMENT_METHODS = [
  { id: "bkash", label: "bKash", color: "bg-pink-600", icon: "📱" },
  { id: "nagad", label: "Nagad", color: "bg-orange-500", icon: "📱" },
  { id: "rocket", label: "Rocket", color: "bg-purple-600", icon: "📱" },
  { id: "card", label: "Credit/Debit Card", color: "bg-blue-600", icon: "💳" },
  { id: "cod", label: "Cash on Delivery", color: "bg-green-600", icon: "💵" },
];

const BD_DISTRICTS = [
  "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna",
  "Barisal", "Rangpur", "Mymensingh", "Comilla", "Gazipur",
  "Narayanganj", "Tangail", "Jessore", "Cox's Bazar",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, getSubtotal, discount, couponCode, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  });

  const subtotal = getSubtotal();
  const total = getTotal();
  const shipping = subtotal >= 5000 ? 0 : 80;
  const grandTotal = total + shipping;

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  async function onSubmit(address: AddressForm) {
    setLoading(true);
    try {
      const { data } = await ordersApi.create({
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        delivery_address: address,
        payment_method: paymentMethod,
        coupon_code: couponCode,
        notes: "",
      });

      clearCart();

      if (paymentMethod !== "cod" && data.payment_url && typeof window !== "undefined") {
        window.location.href = data.payment_url;
      } else {
        router.push(`/checkout/confirmation/${data.id}`);
      }
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-4">
      <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Address + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    {...register("full_name")}
                    placeholder="Your full name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                  />
                  {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    {...register("phone")}
                    placeholder="01XXXXXXXXX"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                  <input
                    {...register("address_line1")}
                    placeholder="House, Road, Area"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                  />
                  {errors.address_line1 && <p className="text-xs text-red-500 mt-1">{errors.address_line1.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2 <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    {...register("address_line2")}
                    placeholder="Landmark, Floor, etc."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    {...register("city")}
                    placeholder="City / Thana"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <select
                    {...register("district")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500 bg-white"
                  >
                    <option value="">Select district</option>
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === method.id
                        ? "border-primary-700 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="text-primary-700"
                    />
                    <span className="text-xl">{method.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{method.label}</span>
                    {paymentMethod === method.id && (
                      <CheckCircle2 size={18} className="ml-auto text-primary-700" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="font-bold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product_id} className="flex gap-2">
                    <div className="w-12 h-12 bg-gray-50 rounded border border-gray-100 flex-shrink-0 overflow-hidden">
                      <Image
                        src={getImageUrl(item.image_url)}
                        alt={item.product_name}
                        width={48}
                        height={48}
                        className="object-contain w-full h-full p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 line-clamp-2">{item.product_name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 btn-primary py-3 text-sm font-bold rounded-lg"
            >
              {loading ? "Placing Order…" : (
                <>
                  Place Order
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By placing this order you agree to our Terms & Conditions
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
