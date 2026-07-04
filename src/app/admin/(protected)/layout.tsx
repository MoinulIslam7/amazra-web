"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Upload,
  LogOut,
} from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { getAdminRole, isAdminUser } from "@/lib/admin-auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/import", label: "Bulk Import", icon: Upload },
];

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAdminUser()) {
      router.replace("/admin/login");
      return;
    }
    setChecked(true);
  }, [router]);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    }
    logout();
    router.push("/admin/login");
  }

  if (!checked) {
    return <div className="min-h-screen bg-gray-950" />;
  }

  const role = getAdminRole();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex">
      <aside className="w-60 flex-shrink-0 bg-gray-900 text-gray-300 min-h-screen hidden md:flex flex-col">
        <div className="px-5 py-5 border-b border-gray-800">
          <span className="text-xl font-extrabold tracking-tight text-white">
            amaz<span className="text-primary-500">ra</span>
          </span>
          <p className="text-xs text-gray-500 mt-0.5">Admin Dashboard</p>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active ? "bg-primary-700 text-white" : "hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-2">
            {user?.name ?? "Admin"} · <span className="uppercase">{role ?? "staff"}</span>
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={15} />
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6">{children}</main>
    </div>
  );
}
