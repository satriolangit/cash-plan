"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/auth-context";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
}

export default function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    categoryId: "",
    description: "",
    transactionDate: "",
  });

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  useEffect(() => {
    fetchCategories();
  }, [form.type]);

  async function fetchTransaction() {
    const res = await apiFetch(`/api/v1/transactions/${id}`);
    const data = await res.json();
    if (data.success) {
      const tx = data.data;
      setForm({
        type: tx.type,
        amount: String(tx.amount),
        categoryId: tx.categoryId,
        description: tx.description || "",
        transactionDate: tx.transactionDate.split("T")[0],
      });
    } else {
      setError("Transaction not found");
    }
    setFetching(false);
  }

  async function fetchCategories() {
    const res = await apiFetch(`/api/v1/categories?type=${form.type}`);
    const data = await res.json();
    if (data.success) setCategories(data.data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch(`/api/v1/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast("success", "Transaction updated");
        router.push("/transactions");
      } else {
        setError(data.error?.message || "Failed to update");
        toast("error", data.error?.message || "Failed to update");
      }
    } catch {
      setError("Network error");
      toast("error", "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/v1/transactions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("success", "Transaction deleted");
        router.push("/transactions");
      } else {
        toast("error", "Failed to delete");
      }
    } catch {
      toast("error", "Failed to delete");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  }

  if (fetching) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="h-8 bg-border animate-pulse rounded w-40" />
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div className="h-10 bg-border animate-pulse rounded-xl" />
            <div className="h-10 bg-border animate-pulse rounded-xl" />
            <div className="h-10 bg-border animate-pulse rounded-xl" />
            <div className="h-20 bg-border animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !form.amount) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-lg mx-auto text-center py-12">
          <p className="text-muted mb-4">{error}</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Edit Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={form.type === "expense" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setForm({ ...form, type: "expense", categoryId: "" })}
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={form.type === "income" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setForm({ ...form, type: "income", categoryId: "" })}
              >
                Income
              </Button>
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                min="1"
                required
              />
            </div>

            <div>
              <Label>Category</Label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="flex h-10 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.transactionDate}
                onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
              >
                Delete
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
