import { Truck, RotateCcw, ShieldCheck, CreditCard } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Delivery",
    subtitle: "On orders above ৳5,000",
    color: "text-blue-600",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    subtitle: "7-day hassle-free return",
    color: "text-green-600",
  },
  {
    icon: ShieldCheck,
    title: "Genuine Products",
    subtitle: "100% authentic guarantee",
    color: "text-purple-600",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    subtitle: "bKash, Nagad, Card & COD",
    color: "text-orange-600",
  },
];

export function PromoStrip() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
      {features.map(({ icon: Icon, title, subtitle, color }) => (
        <div key={title} className="flex items-center gap-3">
          <div className={`${color} flex-shrink-0`}>
            <Icon size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
