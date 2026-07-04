"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Grid3X3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import type { Category } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  laptop: "💻",
  desktop: "🖥️",
  monitor: "🖥️",
  phone: "📱",
  tablet: "📱",
  component: "🔧",
  networking: "🌐",
  storage: "💾",
  printer: "🖨️",
  camera: "📷",
  audio: "🎧",
  gaming: "🎮",
  software: "📀",
  accessory: "🎒",
  security: "🔒",
  office: "🏢",
};

function getCategoryIcon(slug: string): string {
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (slug.includes(key)) return icon;
  }
  return "📦";
}

export function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoriesApi.list();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const topLevel = categories.filter((c) => !c.parent_id);
  const getChildren = (parentId: string) => categories.filter((c) => c.parent_id === parentId);

  return (
    <nav className="bg-white border-b border-gray-200 hidden lg:block">
      <div className="container-page">
        <ul className="flex items-center gap-0 relative">
          <li
            className="group relative"
            onMouseEnter={() => setActiveCategory(null)}
          >
            <button className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-white bg-primary-700 hover:bg-primary-800 transition-colors h-full">
              <Grid3X3 size={16} />
              All Categories
            </button>
          </li>

          {topLevel.slice(0, 9).map((cat) => (
            <li
              key={cat.id}
              className="relative group"
              onMouseEnter={() => setActiveCategory(cat)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <Link
                href={`/category/${cat.slug}`}
                className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-gray-700 hover:text-primary-700 hover:bg-primary-50 transition-colors whitespace-nowrap"
              >
                <span>{getCategoryIcon(cat.slug)}</span>
                {cat.name}
                {getChildren(cat.id).length > 0 && <ChevronRight size={14} />}
              </Link>

              {activeCategory?.id === cat.id && getChildren(cat.id).length > 0 && (
                <div className="absolute top-full left-0 z-50 w-64 bg-white border border-gray-200 shadow-xl rounded-b-lg pt-1 pb-2">
                  {getChildren(cat.id).map((child) => (
                    <Link
                      key={child.id}
                      href={`/category/${child.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}

          <li className="ml-auto">
            <Link
              href="/pc-builder"
              className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
            >
              🔧 PC Builder
            </Link>
          </li>
          <li>
            <Link
              href="/offers"
              className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              🔥 Offers
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
