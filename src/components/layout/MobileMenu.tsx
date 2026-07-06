"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import type { Category } from "@/types";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoriesApi.list();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const topLevel = categories.filter((c) => !c.parent_id);

  return (
    <>
      <button
        className="lg:hidden p-1 text-gray-700 hover:text-primary-700"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-primary-700">
              <span className="text-lg font-bold text-white">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Categories
              </div>
              {topLevel.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <span>{cat.name}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </Link>
              ))}

              <div className="mt-4 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Quick Links
              </div>
              {[
                { href: "/pc-builder", label: "🔧 PC Builder" },
                { href: "/offers", label: "🔥 Offers" },
                { href: "/track-order", label: "📦 Track Order" },
                { href: "/branches", label: "📍 Find Branch" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100 flex gap-2">
              <Link
                href="/login"
                className="flex-1 btn-outline text-center py-2 rounded-md text-sm font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex-1 btn-primary text-center py-2 rounded-md text-sm font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
