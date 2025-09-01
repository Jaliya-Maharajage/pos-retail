// File: src/app/(owner)/products/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TileButton from "@/components/ui/tile-button";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  price: number;
  barcode?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  categoryId: string;
  category?: { id: string; name: string };
};

type Category = { id: string; name: string };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // size controls
  const [foodSize, setFoodSize] = useState<"" | "small" | "medium" | "large" | "mega">("");
  const [drinkSize, setDrinkSize] = useState<"" | "small" | "medium" | "large">("");

  // category form
  const [newCategory, setNewCategory] = useState("");

  async function load() {
    setLoading(true);
    const [p, c] = await Promise.all([fetch("/api/products"), fetch("/api/categories")]);
    const pj = await p.json();
    const cj = await c.json();
    setProducts(pj.products ?? []);
    setCategories(cj.categories ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setBarcode("");
    setDescription("");
    setImageUrl("");
    setPrice("");
    setCategoryId("");
    setFoodSize("");
    setDrinkSize("");
  }

  async function submit() {
    if (!name || !price || !categoryId) {
      return toast.error("Name, Price, Category required");
    }
    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      return toast.error("Price must be a valid non-negative number");
    }

    let finalName = name;
    if (foodSize) finalName += ` (${foodSize})`;
    if (drinkSize) finalName += ` (${drinkSize})`;

    const payload: any = {
      name: finalName,
      price: numPrice,
      categoryId,
      barcode: barcode || null,
      description: description || null,
      imageUrl: imageUrl || null,
    };

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok || data?.ok === false) {
        throw new Error(data?.error || "Save failed");
      }

      toast.success(editingId ? "Product updated" : "Product created");
      resetForm();
      load();
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    }
  }

  async function edit(p: Product) {
    setEditingId(p.id);
    setName(p.name);
    setBarcode(p.barcode ?? "");
    setDescription(p.description ?? "");
    setImageUrl(p.imageUrl ?? "");
    setPrice(String(p.price));
    setCategoryId(p.categoryId);
    setFoodSize("");
    setDrinkSize("");
  }
  async function del(id: string) {
    if (!confirm("Delete this product?")) return;
    const r = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("Deleted");
      load();
    } else toast.error("Delete failed");
  }

  // ---------- Category management ----------
  async function addCategory() {
    if (!newCategory.trim()) return toast.error("Enter a category name");
    try {
      const r = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      if (!r.ok) throw new Error();
      toast.success("Category added");
      setNewCategory("");
      await load();
    } catch {
      toast.error("Add category failed");
    }
  }

  async function renameCategory(cat: Category) {
    const next = prompt("New name", cat.name);
    if (!next || next.trim() === cat.name) return;
    try {
      const r = await fetch(`/api/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: next.trim() }),
      });
      if (!r.ok) throw new Error();
      toast.success("Category renamed");
      await load();
    } catch {
      toast.error("Rename failed");
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category? Products linked to it will fail validation.")) return;
    try {
      const r = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Category deleted");
      await load();
    } catch {
      toast.error("Delete category failed");
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header actions: stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <TileButton href="/auth/post-login" variant="outline" className="w-full sm:w-auto">
          Back
        </TileButton>
      </div>

      {/* Product form */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="grid gap-1">
            <Label>Item Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Pizza Margherita" />
          </div>
          <div className="grid gap-1">
            <Label>Barcode</Label>
            <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Optional" />
          </div>
          <div className="grid gap-1 md:col-span-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </div>
          <div className="grid gap-1">
            <Label>Image URL</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="grid gap-1">
            <Label>Price (LKR)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
          </div>
          <div className="grid gap-1">
            <Label>Category</Label>
            <select
              className="border rounded p-2 h-10"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select...</option>
              {categories.map((c: Category) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Size pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="mb-2 font-medium">Food Size (optional)</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["small", "medium", "large", "mega"].map((s) => (
                <Button
                  key={s}
                  className="h-12"
                  variant={foodSize === (s as any) ? "default" : "outline"}
                  onClick={() => {
                    setFoodSize(s as any);
                    setDrinkSize("");
                  }}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 font-medium">Drink Size (optional)</div>
            <div className="grid grid-cols-3 gap-2">
              {["small", "medium", "large"].map((s) => (
                <Button
                  key={s}
                  className="h-12"
                  variant={drinkSize === (s as any) ? "default" : "outline"}
                  onClick={() => {
                    setDrinkSize(s as any);
                    setFoodSize("");
                  }}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Form actions: full width on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <TileButton className="w-full" onClick={submit}>
            {editingId ? "Update" : "Add Item"}
          </TileButton>
          <TileButton className="w-full" variant="destructive" onClick={resetForm}>
            Clear
          </TileButton>
        </div>
      </Card>

      {/* Category management */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Product Categories</h2>

        {/* Mobile-first: stack input & button, align at bottom on ≥sm */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="grid gap-1 w-full sm:max-w-sm">
            <Label>New Category</Label>
            <Input
              placeholder="e.g., Pizzas / Burgers / Drinks"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          <TileButton onClick={addCategory} className="w-full sm:w-auto h-10">
            + Add Category
          </TileButton>
        </div>

        <div className="overflow-x-auto border rounded">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c: Category) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button size="sm" onClick={() => renameCategory(c)} className="w-full sm:w-auto">
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteCategory(c.id)}
                        className="w-full sm:w-auto"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!categories.length && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={2}>
                    No categories yet. Add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Product list */}
      <Card className="p-0 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">Image</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Barcode</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: Product) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} className="h-10 w-10 object-cover rounded" alt="" />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.barcode ?? "-"}</td>
                <td className="p-2">{p.category?.name ?? ""}</td>
                <td className="p-2 text-right">{p.price}</td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button size="sm" onClick={() => edit(p)} className="w-full sm:w-auto">
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => del(p.id)}
                      className="w-full sm:w-auto"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!products.length && (
              <tr>
                <td className="p-2 text-muted-foreground" colSpan={6}>
                  No products yet. Use the form above to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
