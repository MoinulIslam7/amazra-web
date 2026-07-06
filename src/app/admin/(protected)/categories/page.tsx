"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, X } from "lucide-react";
import { toast } from "react-toastify";
import { categoriesApi, getErrorMessage } from "@/lib/api";
import type { Category } from "@/types";

interface FormState {
  id?: string;
  name: string;
  slug: string;
  parent_id: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM: FormState = { name: "", slug: "", parent_id: "", sort_order: 0, is_active: true };

function flatten(categories: Category[]): Category[] {
  const all: Category[] = [];
  function walk(list: Category[]) {
    for (const c of list) {
      all.push(c);
      if (c.children?.length) walk(c.children);
    }
  }
  walk(categories);
  return all;
}

function CategoryNode({
  category,
  depth,
  siblings,
  onEdit,
  onDelete,
  onReorder,
}: {
  category: Category;
  depth: number;
  siblings: Category[];
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onReorder: (a: Category, b: Category) => void;
}) {
  const index = siblings.findIndex((s) => s.id === category.id);

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-800"
        style={{ paddingLeft: depth * 20 }}
      >
        <div className="flex flex-col">
          <button
            disabled={index === 0}
            onClick={() => onReorder(category, siblings[index - 1])}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
          >
            <ChevronUp size={13} />
          </button>
          <button
            disabled={index === siblings.length - 1}
            onClick={() => onReorder(category, siblings[index + 1])}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
          >
            <ChevronDown size={13} />
          </button>
        </div>
        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium flex-1">{category.name}</span>
        {!category.is_active && (
          <span className="text-[10px] bg-gray-200 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">Inactive</span>
        )}
        <button onClick={() => onEdit(category)} className="text-gray-400 hover:text-primary-700">
          <Pencil size={14} />
        </button>
        <button onClick={() => onDelete(category)} className="text-gray-400 hover:text-red-600">
          <Trash2 size={14} />
        </button>
      </div>
      {category.children?.map((child) => (
        <CategoryNode
          key={child.id}
          category={child}
          depth={depth + 1}
          siblings={category.children!}
          onEdit={onEdit}
          onDelete={onDelete}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await categoriesApi.list()).data,
  });

  const topLevel = categories.filter((c) => !c.parent_id);
  const flatCategories = flatten(categories);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  function openCreate(parentId?: string) {
    setForm({ ...EMPTY_FORM, parent_id: parentId ?? "" });
  }

  function openEdit(category: Category) {
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id ?? "",
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Delete "${category.name}"? This only works if it has no products.`)) return;
    try {
      await categoriesApi.remove(category.id);
      toast.success("Category deleted");
      invalidate();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleReorder(a: Category, b: Category) {
    try {
      await Promise.all([
        categoriesApi.update(a.id, { name: a.name, slug: a.slug, parent_id: a.parent_id, sort_order: b.sort_order, is_active: a.is_active }),
        categoriesApi.update(b.id, { name: b.name, slug: b.slug, parent_id: b.parent_id, sort_order: a.sort_order, is_active: b.is_active }),
      ]);
      invalidate();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      parent_id: form.parent_id || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    };
    try {
      if (form.id) {
        await categoriesApi.update(form.id, payload);
        toast.success("Category updated");
      } else {
        await categoriesApi.create(payload);
        toast.success("Category created");
      }
      setForm(null);
      invalidate();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const inputClass =
    "w-full h-9 px-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500";

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
        <button onClick={() => openCreate()} className="btn-primary text-sm h-9 px-4 flex items-center gap-1.5">
          <Plus size={16} /> New Category
        </button>
      </div>

      <div className="card p-4">
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-9 rounded" />)}</div>
        ) : topLevel.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No categories yet.</p>
        ) : (
          topLevel.map((c) => (
            <CategoryNode
              key={c.id}
              category={c}
              depth={0}
              siblings={topLevel}
              onEdit={openEdit}
              onDelete={handleDelete}
              onReorder={handleReorder}
            />
          ))
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-gray-100">
                {form.id ? "Edit Category" : "New Category"}
              </h2>
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
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Parent Category</label>
                <select
                  value={form.parent_id}
                  onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">— Top Level —</option>
                  {flatCategories.filter((c) => c.id !== form.id).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="cat_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="cat_active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setForm(null)} className="text-sm px-4 py-2 text-gray-600 dark:text-gray-400">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm h-9 px-5">
                  {form.id ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
