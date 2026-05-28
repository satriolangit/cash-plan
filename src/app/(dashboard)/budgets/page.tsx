"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/auth-context";
import { useCategories, useBudgets, queryKeys } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import type { BudgetWithRelations } from "@/types";

const statusColors = {
  safe: "bg-success",
  warning: "bg-warning",
  over: "bg-danger",
};

const statusText = {
  safe: "Safe",
  warning: "Warning",
  over: "Over Budget",
};

export default function BudgetsPage() {
  const { data: categories = [] } = useCategories("expense");
  const queryClient = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { data: budgets = [], isLoading } = useBudgets(month, year);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    categoryId: "",
    amount: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId
        ? `/api/v1/budgets/${editingId}`
        : "/api/v1/budgets";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: form.categoryId,
          amount: form.amount,
          month,
          year,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingId(null);
        setForm({ categoryId: "", amount: 0 });
        toast("success", editingId ? "Budget updated" : "Budget created");
        queryClient.invalidateQueries({ queryKey: queryKeys.budgets(month, year) });
      } else {
        setError(data.error?.message || "Failed to save budget");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(budget: BudgetWithRelations) {
    setEditingId(budget.id);
    setForm({
      categoryId: budget.category.id,
      amount: budget.amount,
    });
    setShowForm(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      const res = await apiFetch(`/api/v1/budgets/${deleteTarget}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast("success", "Budget deleted");
        queryClient.invalidateQueries({ queryKey: queryKeys.budgets(month, year) });
      } else {
        toast("error", data.error?.message || "Failed to delete budget");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setDeleteTarget(null);
    }
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setForm({ categoryId: "", amount: 0 });
    setError("");
  }

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Monthly Budgets</h1>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => {
              setEditingId(null);
              setForm({ categoryId: "", amount: 0 });
              setShowForm(true);
            }}
          >
            + Add
          </Button>
        )}
      </div>

      {/* Month/Year Filter */}
      <div className="flex gap-2">
        <Select
          value={String(month)}
          onValueChange={(v) => setMonth(Number(v))}
        >
          {months.map((m, i) => (
            <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
          ))}
        </Select>
        <Select
          value={String(year)}
          onValueChange={(v) => setYear(Number(v))}
        >
          {[2026, 2025].map((y) => (
            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
          ))}
        </Select>
      </div>

      {/* Add/Edit Budget Form */}
      {showForm && (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                  placeholder="Select category"
                  disabled={!!editingId}
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Budget Amount</Label>
                <MoneyInput
                  placeholder="0"
                  value={form.amount}
                  onChange={(value) => setForm({ ...form, amount: value })}
                  required
                />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving
                    ? editingId
                      ? "Updating..."
                      : "Creating..."
                    : editingId
                    ? "Update Budget"
                    : "Create Budget"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton width={100} />
                      <Skeleton width={150} height={12} />
                    </div>
                  </div>
                  <Skeleton width={60} height={24} className="rounded-full" />
                </div>
                <Skeleton variant="rectangular" height={8} className="rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon="💰"
          title="No budgets yet"
          description="Create a budget to monitor spending"
          action={{ label: "Create Budget", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => (
            <Card key={budget.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{budget.category.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{budget.category.name}</p>
                      <p className="text-xs text-muted">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        budget.status === "safe"
                          ? "bg-success/10 text-success"
                          : budget.status === "warning"
                          ? "bg-warning/10 text-warning"
                          : "bg-danger/10 text-danger"
                      }`}
                    >
                      {statusText[budget.status]}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${statusColors[budget.status]}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted">{budget.percentage}%</p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(budget)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(budget.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        description="Are you sure you want to delete this budget? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
