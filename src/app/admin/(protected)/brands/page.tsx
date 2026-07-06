"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, X } from "lucide-react";
import { toast } from "react-toastify";
import { brandsApi, getErrorMessage } from "@/lib/api";
import type { Brand } from "@/types";

interface FormState {
  id?: string;
  name: string;
  slug: string;
  is_active: boolean;
  logo_url: string;
}

const EMPTY_FORM: FormState = { name: "", slug: "", is_active: true, logo_url: "" };

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery<{ items: Brand[] }>({
    queryKey: ["admin", "brands"],
    queryFn: async () => (await brandsApi.list({ page_size: 200 })).data,
  });
  const brands = data?.items ?? [];

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
    queryClient.invalidateQueries({ queryKey: ["brands"] });
  }

  function openEdit(brand?: Brand) {
    setLogoFile(null);
    setForm(
      brand
        ? { id: brand.id, name: brand.name, slug: brand.slug, is_active: brand.is_active, logo_url: brand.logo_url ?? "" }
        : { ...EMPTY_FORM }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      let brandId = form.id;
      const payload = { name: form.name, slug: form.slug || undefined, is_active: form.is_active };
      if (brandId) {
        await brandsApi.update(brandId, payload);
      } else {
        const { data } = await brandsApi.create(payload);
        brandId = data.id;
      }
      if (logoFile && brandId) {
        await brandsApi.uploadLogo(brandId, logoFile);
      }
      toast.success(form.id ? "Brand updated" : "Brand created");
      setForm(null);
      invalidate();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full h-9 px-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500";

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Brands</h1>
        <button onClick={() => openEdit()} className="btn-primary text-sm h-9 px-4 flex items-center gap-1.5">
          <Plus size={16} /> New Brand
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Logo</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">Loading…</td></tr>
            ) : brands.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">No brands yet.</td></tr>
            ) : (
              brands.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                  <td className="p-3">
                    {b.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.logo_url} alt={b.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800" />
                    )}
                  </td>
                  <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{b.name}</td>
                  <td className="p-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                      {b.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(b)} className="text-primary-700 hover:underline text-xs font-medium flex items-center gap-1 ml-auto">
                      <Pencil size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-gray-100">{form.id ? "Edit Brand" : "New Brand"}</h2>
              <button onClick={() => setForm(null)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Slug (auto if blank)</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Logo</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="brand_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="brand_active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setForm(null)} className="text-sm px-4 py-2 text-gray-600 dark:text-gray-400">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary text-sm h-9 px-5">
                  {saving ? "Saving…" : form.id ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
