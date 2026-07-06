"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";
import { productsApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { PriceHistoryResponse } from "@/types";

export function PriceHistoryChart({ productSlug }: { productSlug: string }) {
  const { data, isLoading } = useQuery<PriceHistoryResponse>({
    queryKey: ["price-history", productSlug],
    queryFn: async () => {
      const { data } = await productsApi.priceHistory(productSlug);
      return data;
    },
  });

  if (isLoading) {
    return <div className="skeleton h-40 rounded-lg" />;
  }

  const history = data?.history ?? [];
  if (history.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-2">
        No price changes in the last 6 months
        {data?.current_price ? ` — currently ${formatPrice(Number(data.current_price))}.` : "."}
      </p>
    );
  }

  const points = history.map((h) => Number(h.new_price));
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const width = 600;
  const height = 160;
  const padX = 12;
  const padY = 16;

  const coords = points.map((p, i) => {
    const x = padX + (i / Math.max(points.length - 1, 1)) * (width - padX * 2);
    const y = height - padY - ((p - min) / range) * (height - padY * 2);
    return { x, y, price: p, date: history[i].changed_at };
  });

  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const trendDown = last < first;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-sm">
        {trendDown ? (
          <TrendingDown size={16} className="text-green-600" />
        ) : (
          <TrendingUp size={16} className="text-red-600" />
        )}
        <span className={trendDown ? "text-green-600" : "text-red-600"}>
          {trendDown ? "Price dropped" : "Price increased"} from {formatPrice(first)} to{" "}
          {formatPrice(last)} over the last 6 months
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40" preserveAspectRatio="none">
        <path d={path} fill="none" stroke="#cc0000" strokeWidth={2} />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={3} fill="#cc0000">
            <title>
              {formatPrice(c.price)} — {new Date(c.date).toLocaleDateString()}
            </title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{new Date(history[0].changed_at).toLocaleDateString()}</span>
        <span>{new Date(history[history.length - 1].changed_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
