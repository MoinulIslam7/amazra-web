"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Category } from "@/types";

const ICONS: Record<string, string> = {
  laptop: "💻",
  desktop: "🖥️",
  monitor: "🖥️",
  phone: "📱",
  tablet: "📱",
  component: "⚙️",
  networking: "🌐",
  storage: "💾",
  printer: "🖨️",
  camera: "📷",
  audio: "🎧",
  gaming: "🎮",
  software: "💿",
  accessory: "🎒",
  security: "🔒",
  office: "🏢",
};

function getCatIcon(slug: string): string {
  for (const [key, icon] of Object.entries(ICONS)) {
    if (slug.toLowerCase().includes(key)) return icon;
  }
  return "📦";
}

const CATEGORY_COLORS = [
  "bg-blue-50 hover:bg-blue-100 text-blue-700",
  "bg-purple-50 hover:bg-purple-100 text-purple-700",
  "bg-green-50 hover:bg-green-100 text-green-700",
  "bg-orange-50 hover:bg-orange-100 text-orange-700",
  "bg-pink-50 hover:bg-pink-100 text-pink-700",
  "bg-teal-50 hover:bg-teal-100 text-teal-700",
  "bg-yellow-50 hover:bg-yellow-100 text-yellow-700",
  "bg-red-50 hover:bg-red-100 text-red-700",
];

export function FeaturedCategories() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoriesApi.list();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const topLevel = categories?.filter((c) => !c.parent_id).slice(0, 8) ?? [];

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h2>
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          : topLevel.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}
              >
                <span className="text-3xl">{getCatIcon(cat.slug)}</span>
                <span className="text-xs font-medium text-center leading-tight line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
      </div>
    </section>
  );
}
