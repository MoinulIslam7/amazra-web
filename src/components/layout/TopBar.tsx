import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";

export function TopBar() {
  return (
    <div className="bg-primary-700 text-white text-xs py-1.5 hidden md:block">
      <div className="container-page flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Phone size={11} />
            <a href="tel:+8801234567890" className="hover:underline">
              +880 1234-567890
            </a>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            <span>10:00 AM – 8:00 PM (Sat–Thu)</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/branches" className="flex items-center gap-1 hover:underline">
            <MapPin size={11} />
            Find a Branch
          </Link>
          <Link href="/track-order" className="hover:underline">
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
