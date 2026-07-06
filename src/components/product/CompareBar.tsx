"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Scale } from "lucide-react";
import { useCompareStore } from "@/store/compare";
import { getImageUrl } from "@/lib/utils";

export function CompareBar() {
  const { items, remove, clear } = useCompareStore();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="container-page py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0">
          <Scale size={18} className="text-primary-700" />
          Compare ({items.length}/3)
        </div>

        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex items-center gap-2 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-md pl-1 pr-2 py-1"
            >
              <div className="w-8 h-8 bg-white dark:bg-gray-900 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={getImageUrl(item.image_url)}
                  alt={item.name}
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="text-xs text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                {item.name}
              </span>
              <button
                onClick={() => remove(item.product_id)}
                aria-label={`Remove ${item.name} from comparison`}
                className="text-gray-400 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clear}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2"
          >
            Clear
          </button>
          <Link
            href="/compare"
            className="btn-primary text-sm h-9 px-4"
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}
