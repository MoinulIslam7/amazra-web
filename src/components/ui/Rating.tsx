import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
  className?: string;
}

const sizes = { sm: 12, md: 16, lg: 20 };

export function Rating({ value, max = 5, size = "md", showCount, count, className }: RatingProps) {
  const px = sizes[size];
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="flex">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(value);
          const partial = !filled && i < value;
          return (
            <span key={i} className="relative" style={{ width: px, height: px }}>
              <Star
                size={px}
                className="text-gray-300"
                fill="currentColor"
                strokeWidth={0}
              />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? "100%" : `${(value % 1) * 100}%` }}
                >
                  <Star
                    size={px}
                    className="text-yellow-400"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </span>
              )}
            </span>
          );
        })}
      </span>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </span>
  );
}
