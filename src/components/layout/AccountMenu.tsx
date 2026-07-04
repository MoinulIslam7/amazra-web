"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, ChevronDown, LogOut, Package, Heart, MapPin } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export function AccountMenu() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors"
        >
          Login
        </Link>
        <span className="text-gray-300">|</span>
        <Link
          href="/register"
          className="text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors"
      >
        <User size={20} />
        <span className="hidden lg:block max-w-[100px] truncate">{user?.name}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.phone}</p>
          </div>
          <nav className="py-1">
            {[
              { href: "/account", icon: User, label: "My Account" },
              { href: "/account/orders", icon: Package, label: "My Orders" },
              { href: "/account/wishlist", icon: Heart, label: "Wishlist" },
              { href: "/account/addresses", icon: MapPin, label: "Addresses" },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
