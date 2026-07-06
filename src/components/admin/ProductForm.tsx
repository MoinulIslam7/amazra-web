"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { productsApi, categoriesApi, brandsApi, getErrorMessage } from "@/lib/api";
import type { Category, Brand, Product } from "@/types";

interface SpecEntry {
  key: string;
  value: string;
}

function specsToEntries(specs: Record<string, unknown> | null | undefined): SpecEntry[] {
  if (!specs) return [];
  return Object.entries(specs).map(([key, value]) => ({ key, value: String(value) }));
}

function entriesToSpecs(entries: SpecEntry[]): Record<string, string> {
  const specs: Record<string, string> = {};
  for (const { key, value } of entries) {
    if (key.trim()) specs[key.trim()] = value;
  }
  return specs;
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [brandId, setBrandId] = useState(product?.brand_id ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [originalPrice, setOriginalPrice] = useState(
    product?.original_price ? String(product.original_price) : ""
  );
  const [status, setStatus] = useState(product?.status ?? "active");
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [metaTitle, setMetaTitle] = useState(product?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(product?.meta_description ?? "");
  const [specEntries, setSpecEntries] = useState<SpecEntry[]>(specsToEntries(product?.specs));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await categoriesApi.list()).data,
  });
  const { data: brandsData } = useQuery<{ items: Brand[] }>({
    queryKey: ["brands", "all"],
    queryFn: async () => (await brandsApi.list({ page_size: 100 })).data,
  });
  const brands = brandsData?.items ?? [];

  function addSpecRow() {
    setSpecEntries((s) => [...s, { key: "", value: "" }]);
  }

  function updateSpecRow(index: number, field: "key" | "value", value: string) {
    setSpecEntries((s) => s.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function removeSpecRow(index: number) {
    setSpecEntries((s) => s.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      slug: slug || undefined,
      brand_id: brandId || undefined,
      category_id: categoryId || undefined,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : undefined,
      status,
      is_featured: isFeatured,
      meta_title: metaTitle || undefined,
      meta_description: metaDescription || undefined,
      specs: specEntries.length > 0 ? entriesToSpecs(specEntries) : undefined,
    };

    try {
      if (isEdit) {
        await productsApi.update(product!.id, payload);
        toast.success("Product updated");
      } else {
        const { data } = await productsApi.create(payload);
        toast.success("Product created");
        router.push(`/admin/products/${data.id}`);
        return;
      }
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    setUploading(true);
    try {
      await productsApi.uploadImage(product.id, file);
      toast.success("Image uploaded");
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSetPrimary(imageSetId: string) {
    if (!product) return;
    try {
      await productsApi.setPrimaryImage(product.id, imageSetId);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleDeleteImage(imageSetId: string) {
    if (!product) return;
    try {
      await productsApi.deleteImage(product.id, imageSetId);
      toast.success("Image removed");
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const inputClass =
    "w-full h-9 px-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500";
  const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Slug (auto if blank)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className={inputClass}>
              <option value="">— None —</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Price (BDT) *</label>
            <input required type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Original Price (for discount)</label>
            <input type="number" min="0" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "active" | "draft" | "discontinued")}
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="is_featured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="is_featured" className="text-sm text-gray-700 dark:text-gray-300">Featured product</label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Meta Title (SEO)</label>
            <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Meta Description (SEO)</label>
            <input value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Spec editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}>Specifications</label>
            <button type="button" onClick={addSpecRow} className="flex items-center gap-1 text-xs text-primary-700 hover:underline">
              <Plus size={13} /> Add Spec
            </button>
          </div>
          <div className="space-y-2">
            {specEntries.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  placeholder="Key (e.g. ram)"
                  value={entry.key}
                  onChange={(e) => updateSpecRow(i, "key", e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Value (e.g. 16GB)"
                  value={entry.value}
                  onChange={(e) => updateSpecRow(i, "value", e.target.value)}
                  className={inputClass}
                />
                <button type="button" onClick={() => removeSpecRow(i)} className="text-gray-400 hover:text-red-600 flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary text-sm h-10 px-6">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
      </form>

      {isEdit && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Images</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            {(product!.images ?? []).filter((img) => img.size === "medium" || !img.size).map((img) => (
              <div key={img.image_set_id ?? img.url} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-contain bg-gray-50" />
                {img.is_primary && (
                  <span className="absolute top-1 left-1 text-[10px] bg-primary-700 text-white px-1.5 py-0.5 rounded">Primary</span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2 py-1">
                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(img.image_set_id)}
                      className="text-[10px] text-white hover:underline"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.image_set_id)}
                    className="text-[10px] text-red-300 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <label className="btn-outline text-sm h-9 px-4 inline-flex items-center cursor-pointer">
            {uploading ? "Uploading…" : "Upload Image"}
            <input type="file" accept="image/jpeg,image/png" onChange={handleImageUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      )}
    </div>
  );
}
