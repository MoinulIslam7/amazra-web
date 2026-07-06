"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Best Laptops at Unbeatable Prices",
    subtitle: "Get the latest laptops from Asus, HP, Dell, Lenovo & more",
    cta: { label: "Shop Laptops", href: "/category/laptop" },
    bg: "from-blue-900 to-blue-700",
    imageSrc: null,
    badge: "Up to 20% OFF",
  },
  {
    id: 2,
    title: "Gaming Setup Sale",
    subtitle: "Build your dream rig — GPUs, monitors, keyboards & more",
    cta: { label: "Shop Gaming", href: "/category/gaming" },
    bg: "from-gray-900 to-primary-900",
    imageSrc: null,
    badge: "Limited Offer",
  },
  {
    id: 3,
    title: "Smartphone Mega Deals",
    subtitle: "Samsung, Apple, Xiaomi & more — best prices guaranteed",
    cta: { label: "Shop Phones", href: "/category/phone" },
    bg: "from-emerald-900 to-emerald-700",
    imageSrc: null,
    badge: "New Arrivals",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative overflow-hidden rounded-lg h-56 sm:h-72 md:h-80">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          } bg-gradient-to-r ${slide.bg} flex items-center`}
        >
          <div className="px-8 md:px-14 flex-1">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
              {slide.badge}
            </span>
            <h2 className="text-white text-2xl md:text-3xl font-extrabold leading-tight mb-2 max-w-md">
              {slide.title}
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-5 max-w-sm">{slide.subtitle}</p>
            <Link
              href={slide.cta.href}
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {slide.cta.label}
            </Link>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "w-5 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
