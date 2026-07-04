import type { Metadata } from "next";
import { HeroBanner } from "@/components/home/HeroBanner";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandShowcase } from "@/components/home/BrandShowcase";
import { PromoStrip } from "@/components/home/PromoStrip";

export const metadata: Metadata = {
  title: "Amazra — Tech Products at Best Price in Bangladesh",
};

export default function HomePage() {
  return (
    <div className="container-page py-6 space-y-10">
      {/* Hero */}
      <HeroBanner />

      {/* Promo strip */}
      <PromoStrip />

      {/* Categories */}
      <FeaturedCategories />

      {/* Featured products */}
      <FeaturedProducts
        title="Featured Products"
        subtitle="Hand-picked deals just for you"
        viewAllHref="/products"
        params={{ is_featured: true }}
        limit={8}
      />

      {/* New arrivals */}
      <FeaturedProducts
        title="New Arrivals"
        subtitle="Latest additions to our catalog"
        viewAllHref="/new-arrivals"
        params={{ sort: "newest" }}
        limit={8}
      />

      {/* Brands */}
      <BrandShowcase />

      {/* Best sellers */}
      <FeaturedProducts
        title="Best Sellers"
        subtitle="Most popular products this week"
        viewAllHref="/best-sellers"
        limit={8}
      />
    </div>
  );
}
