import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-extrabold text-primary-200 mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
          <Home size={16} />
          Go Home
        </Link>
        <Link href="/search" className="btn-outline flex items-center gap-2 px-5 py-2.5 text-sm">
          <Search size={16} />
          Search
        </Link>
      </div>
    </div>
  );
}
