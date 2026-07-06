import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Product</h1>
      <ProductForm />
    </div>
  );
}
