const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchProductBySlug(slug: string) {
  const res = await fetch(`${BASE_URL}/api/v1/products/${slug}`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);
  return res.json();
}
