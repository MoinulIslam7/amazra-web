"use client";

import { useAuthStore } from "@/store/auth";
import { Package, Heart, Star, Gift } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { user } = useAuthStore();

  const stats = [
    { icon: Package, label: "Total Orders", value: "—", href: "/account/orders" },
    { icon: Heart, label: "Wishlist Items", value: "—", href: "/account/wishlist" },
    { icon: Star, label: "Loyalty Points", value: user?.loyalty_points?.toLocaleString() ?? "0", href: "#" },
    { icon: Gift, label: "Rewards", value: "—", href: "#" },
  ];

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h1 className="text-xl font-bold text-gray-900 mb-4">My Account</h1>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ icon: Icon, label, value, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Full Name</p>
            <p className="font-medium text-gray-900 mt-0.5">{user?.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium text-gray-900 mt-0.5">{user?.phone}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-900 mt-0.5">{user?.email ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-gray-500">Account Type</p>
            <p className="font-medium text-gray-900 mt-0.5 capitalize">{user?.type}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
