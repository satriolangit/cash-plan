"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { apiFetch } from "@/lib/auth-context";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCategories } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  isDefault: boolean;
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    icon: "📦",
    color: "#64748B",
    type: "expense" as "income" | "expense" | "both",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `/api/v1/categories/${editingId}`
      : "/api/v1/categories";

    const res = await apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", icon: "📦", color: "#64748B", type: "expense" });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    }
  }

  function handleEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color, type: cat.type as "income" | "expense" | "both" });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    await apiFetch(`/api/v1/categories/${id}`, { method: "DELETE" });
    setDeleteTarget(null);
    queryClient.invalidateQueries({ queryKey: queryKeys.categories });
  }

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  const emojis = ["📦", "🍔", "⛽", "🛒", "🏥", "📚", "🎮", "📋", "💼", "🎁", "📈", "💰", "🏠", "🚗", "✈️", "🎵", "🐱", "👶"];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button
          size="sm"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: "", icon: "📦", color: "#64748B", type: "expense" });
          }}
        >
          {showForm ? "Cancel" : "+ Add"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm({ ...form, icon: emoji })}
                      className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center ${
                        form.icon === emoji ? "bg-primary/20 ring-2 ring-primary" : "bg-border/30"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Color</Label>
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as "income" | "expense" | "both" })}
                >
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {editingId ? "Update" : "Create"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted">Loading...</div>
      ) : (
        <>
          {incomeCategories.length > 0 && (
            <div>
              <h2 className="font-semibold text-sm text-muted mb-2">Income</h2>
              <div className="space-y-2">
                {incomeCategories.map((cat) => (
                  <Card key={cat.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)}>
                          Edit
                        </Button>
                        {!cat.isDefault && (
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(cat.id)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {expenseCategories.length > 0 && (
            <div>
              <h2 className="font-semibold text-sm text-muted mb-2">Expense</h2>
              <div className="space-y-2">
                {expenseCategories.map((cat) => (
                  <Card key={cat.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)}>
                          Edit
                        </Button>
                        {!cat.isDefault && (
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(cat.id)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
        }}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
