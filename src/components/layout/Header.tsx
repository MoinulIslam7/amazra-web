import Link from "next/link";
import { Heart, Bell } from "lucide-react";
import { TopBar } from "./TopBar";
import { SearchBar } from "./SearchBar";
import { CartIcon } from "./CartIcon";
import { AccountMenu } from "./AccountMenu";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm dark:bg-gray-950 dark:shadow-gray-900">
      <TopBar />

      <div className="bg-white border-b border-gray-100 dark:bg-gray-950 dark:border-gray-800">
        <div className="container-page flex items-center gap-4 h-16">
          {/* Mobile menu trigger */}
          <MobileMenu />

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-extrabold tracking-tight text-primary-700">
              amaz<span className="text-gray-900">ra</span>
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 hidden sm:block">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <Link
              href="/account/wishlist"
              className="relative text-gray-700 hover:text-primary-700 transition-colors hidden sm:flex"
              aria-label="Wishlist"
            >
              <Heart size={22} />
            </Link>
            <Link
              href="/account/notifications"
              className="relative text-gray-700 hover:text-primary-700 transition-colors hidden sm:flex"
              aria-label="Notifications"
            >
              <Bell size={22} />
            </Link>
            <ThemeToggle />
            <CartIcon />
            <AccountMenu />
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-4 pb-3">
          <SearchBar />
        </div>
      </div>

      <MegaMenu />
    </header>
  );
}
