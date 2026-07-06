import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductBySlug } from "@/lib/server-api";
import { getImageUrl } from "@/lib/utils";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import type { Product } from "@/types";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product: Product | null = await fetchProductBySlug(params.slug);
  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = product.meta_title || product.name;
  const description =
    product.meta_description ||
    `Buy ${product.name} at the best price in Bangladesh. Free delivery, easy returns, bKash/Nagad accepted.`;
  const image = product.images?.[0]?.url ? getImageUrl(product.images[0].url) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product: Product | null = await fetchProductBySlug(params.slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.meta_description ?? undefined,
    image: product.images?.map((img) => getImageUrl(img.url)),
    brand: product.brand_name ? { "@type": "Brand", name: product.brand_name } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: product.price,
      availability:
        (product.stock ?? 1) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.review_count
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.average_rating,
            reviewCount: product.review_count,
          },
        }
      : {}),
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
