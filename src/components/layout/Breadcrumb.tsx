import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 py-3" aria-label="Breadcrumb">
      <Link href="/" className="flex items-center text-gray-400 hover:text-primary-700 transition-colors">
        <Home size={14} />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <ChevronRight size={14} className="text-gray-300" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-primary-700 transition-colors truncate max-w-[150px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
