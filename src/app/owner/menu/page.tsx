"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Fetch products + categories
  useEffect(() => {
    async function fetchData() {
      const prodRes = await fetch("/api/products");
      const prods = await prodRes.json();

      const catRes = await fetch("/api/categories");
      const cats = await catRes.json();

      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingId) {
      // UPDATE PRODUCT
      const res = await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          imageUrl,
          categoryId,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
        resetForm();
      } else {
        alert("Failed to update product");
      }
    } else {
      // CREATE PRODUCT
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          imageUrl,
          categoryId,
        }),
      });

      if (res.ok) {
        const newProduct = await res.json();
        setProducts([newProduct, ...products]);
        resetForm();
      } else {
        alert("Failed to create product");
      }
    }
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setCategoryId("");
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts(products.filter((p) => p.id !== id));
    } else {
      alert("Failed to delete product");
    }
  }

  function handleEdit(p: any) {
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description || "");
    setPrice(p.price);
    setImageUrl(p.imageUrl || "");
    setCategoryId(p.categoryId || "");
  }

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Products</h1>

      {/* Add/Edit Product Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 p-4 rounded-lg shadow space-y-3"
      >
        <h2 className="font-semibold text-lg">
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>

        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2"
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full border rounded p-2"
        />

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border rounded p-2"
          required
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? "Update Product" : "Add Product"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg p-4 shadow hover:shadow-md"
          >
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-40 object-cover rounded-md"
              />
            )}
            <h2 className="font-semibold text-lg mt-2">{p.name}</h2>
            <p className="text-gray-600">{p.description}</p>
            <p className="font-bold mt-1">${p.price}</p>
            <p className="text-sm text-gray-500">
              Category: {p.category?.name}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(p)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
