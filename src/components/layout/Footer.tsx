import Link from "next/link";
import { Facebook, Youtube, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

const footerLinks = {
  "Customer Service": [
    { label: "Track Order", href: "/track-order" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "Warranty Policy", href: "/warranty" },
    { label: "EMI Policy", href: "/emi" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
  "Quick Links": [
    { label: "PC Builder", href: "/pc-builder" },
    { label: "Laptop Finder", href: "/laptop-finder" },
    { label: "Compare Products", href: "/compare" },
    { label: "Offers & Deals", href: "/offers" },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Best Sellers", href: "/best-sellers" },
  ],
  "About Amazra": [
    { label: "About Us", href: "/about" },
    { label: "Branch Locations", href: "/branches" },
    { label: "Career", href: "/career" },
    { label: "Blog", href: "/blog" },
    { label: "Contact Us", href: "/contact" },
    { label: "Sitemap", href: "/sitemap" },
  ],
};

const paymentMethods = [
  { name: "bKash", color: "bg-pink-600" },
  { name: "Nagad", color: "bg-orange-500" },
  { name: "Rocket", color: "bg-purple-600" },
  { name: "Visa", color: "bg-blue-700" },
  { name: "MasterCard", color: "bg-red-600" },
  { name: "COD", color: "bg-green-600" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      {/* Main footer */}
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand + contact */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-extrabold text-white">
                amaz<span className="text-primary-500">ra</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              Bangladesh&apos;s trusted tech e-commerce — from laptops and phones to PC components
              and networking gear. Best prices, authentic products.
            </p>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-primary-500 flex-shrink-0" />
                <span>Dhaka, Chittagong, Sylhet, Rajshahi &amp; more</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary-500 flex-shrink-0" />
                <a href="tel:+8801234567890" className="hover:text-white transition-colors">
                  +880 1234-567890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary-500 flex-shrink-0" />
                <a href="mailto:support@amazra.com.bd" className="hover:text-white transition-colors">
                  support@amazra.com.bd
                </a>
              </li>
            </ul>

            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Youtube, href: "#", label: "YouTube" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Payment methods */}
      <div className="border-t border-gray-800">
        <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 mr-1">We accept:</span>
            {paymentMethods.map(({ name, color }) => (
              <span
                key={name}
                className={`${color} text-white text-[10px] font-bold px-2 py-0.5 rounded`}
              >
                {name}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Amazra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
