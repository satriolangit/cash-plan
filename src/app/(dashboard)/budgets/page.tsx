"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/auth-context";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
}

interface BudgetItem {
  id: string;
  amount: number;
  spent: number;
  percentage: number;
  status: "safe" | "warning" | "over";
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

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
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
  });

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, [month, year]);

  async function fetchBudgets() {
    setLoading(true);
    const res = await apiFetch(`/api/v1/budgets?month=${month}&year=${year}`);
    const data = await res.json();
    if (data.success) setBudgets(data.data);
    setLoading(false);
  }

  async function fetchCategories() {
    const res = await apiFetch("/api/v1/categories?type=expense");
    const data = await res.json();
    if (data.success) setCategories(data.data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await apiFetch("/api/v1/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: form.categoryId,
          amount: Number(form.amount),
          month,
          year,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setForm({ categoryId: "", amount: "" });
        fetchBudgets();
      } else {
        setError(data.error?.message || "Failed to create budget");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Monthly Budgets</h1>
        <Button
          size="sm"
          onClick={() => {
            setShowForm(!showForm);
            setForm({ categoryId: "", amount: "" });
          }}
        >
          {showForm ? "Cancel" : "+ Add"}
        </Button>
      </div>

      {/* Month/Year Filter */}
      <div className="flex gap-2">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm"
        >
          {months.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm"
        >
          {[2026, 2025].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Add Budget Form */}
      {showForm && (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
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
                <Label>Budget Amount</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  min="1"
                  required
                />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Creating..." : "Create Budget"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
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
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${statusColors[budget.status]}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted mt-1 text-right">{budget.percentage}%</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
