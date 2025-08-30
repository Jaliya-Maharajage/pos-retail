"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Category = { id: string; name: string };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (data.ok) setCategories(data.categories);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function addCategory() {
    if (!newName) return toast("Enter category name");
    setLoading(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      toast.success("Category added");
      setNewName("");
      fetchCategories();
    } else {
      toast.error(data.error);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      toast.success("Category deleted");
      fetchCategories();
    } else {
      toast.error(data.error);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4 space-y-2">
        <h2 className="text-xl font-semibold">Add Category</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Category Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button onClick={addCategory} disabled={loading}>
            Add
          </Button>
        </div>
      </Card>

      <Card className="p-4 space-y-2">
        <h2 className="text-xl font-semibold">Existing Categories</h2>
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.id} className="flex justify-between items-center">
              {c.name}
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteCategory(c.id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
