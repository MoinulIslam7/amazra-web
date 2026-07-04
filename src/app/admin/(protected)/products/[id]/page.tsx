"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["admin", "product", id],
    queryFn: async () => {
      const { data } = await productsApi.adminGet(id);
      return data;
    },
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Product</h1>
      {isLoading ? (
        <div className="skeleton h-96 rounded-lg" />
      ) : product ? (
        <ProductForm product={product} />
      ) : (
        <p className="text-sm text-gray-500">Product not found.</p>
      )}
    </div>
  );
}
