"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { useToast } from "@/components/ui/toast";
import { Select, SelectItem } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/auth-context";
import { Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
}

interface RecurringItem {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  frequency: string;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  lastRun: string | null;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  user: {
    id: string;
    name: string;
  };
}

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function RecurringTransactionsPage() {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    type: "expense" as "income" | "expense",
    categoryId: "",
    amount: 0,
    description: "",
    frequency: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    dayOfMonth: "1",
    dayOfWeek: "1",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const res = await apiFetch("/api/v1/recurring-transactions");
    const data = await res.json();
    if (data.success) setItems(data.data);
    setLoading(false);
  }

  async function fetchCategories() {
    const res = await apiFetch("/api/v1/categories");
    const data = await res.json();
    if (data.success) setCategories(data.data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId
        ? `/api/v1/recurring-transactions/${editingId}`
        : "/api/v1/recurring-transactions";

      const body: Record<string, unknown> = {
        type: form.type,
        categoryId: form.categoryId,
        amount: form.amount,
        description: form.description || undefined,
        frequency: form.frequency,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      };

      if (form.frequency === "monthly") {
        body.dayOfMonth = Number(form.dayOfMonth);
      } else if (form.frequency === "weekly") {
        body.dayOfWeek = Number(form.dayOfWeek);
      }

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingId(null);
        resetForm();
        toast("success", editingId ? "Recurring transaction updated" : "Recurring transaction created");
        fetchItems();
      } else {
        setError(data.error?.message || "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item: RecurringItem) {
    setEditingId(item.id);
    setForm({
      type: item.type,
      categoryId: item.category.id,
      amount: item.amount,
      description: item.description || "",
      frequency: item.frequency as "daily" | "weekly" | "monthly" | "yearly",
      dayOfMonth: String(item.dayOfMonth || 1),
      dayOfWeek: String(item.dayOfWeek || 1),
      startDate: item.startDate.split("T")[0],
      endDate: item.endDate ? item.endDate.split("T")[0] : "",
    });
    setShowForm(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      const res = await apiFetch(`/api/v1/recurring-transactions/${deleteTarget}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast("success", "Recurring transaction deleted");
        fetchItems();
      } else {
        toast("error", data.error?.message || "Failed to delete");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      const res = await apiFetch(`/api/v1/recurring-transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast("success", isActive ? "Paused" : "Resumed");
        fetchItems();
      }
    } catch {
      toast("error", "Failed to update status");
    }
  }

  async function handleProcess() {
    setProcessing(true);
    try {
      const res = await apiFetch("/api/v1/recurring-transactions/process", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast("success", data.message);
        fetchItems();
      } else {
        toast("error", data.error?.message || "Failed to process");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setProcessing(false);
    }
  }

  function resetForm() {
    setForm({
      type: "expense",
      categoryId: "",
      amount: 0,
      description: "",
      frequency: "monthly",
      dayOfMonth: "1",
      dayOfWeek: "1",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    });
    setError("");
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  }

  function getFrequencyDescription(item: RecurringItem): string {
    switch (item.frequency) {
      case "daily":
        return "Every day";
      case "weekly":
        return `Every ${dayLabels[item.dayOfWeek || 0]}`;
      case "monthly":
        return `Every ${item.dayOfMonth}${getOrdinalSuffix(item.dayOfMonth || 1)}`;
      case "yearly":
        return "Every year";
      default:
        return item.frequency;
    }
  }

  function getOrdinalSuffix(n: number): string {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recurring Transactions</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleProcess}
          disabled={processing}
        >
          {processing ? "Processing..." : "Run Now"}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Type Toggle */}
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

              {/* Category */}
              <div>
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(value) => setForm({ ...form, categoryId: value })}
                  placeholder="Select category"
                >
                  {categories
                    .filter((c) => c.type === form.type || c.type === "both")
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                </Select>
              </div>

              {/* Amount */}
              <div>
                <Label>Amount</Label>
                <MoneyInput
                  placeholder="0"
                  value={form.amount}
                  onChange={(value) => setForm({ ...form, amount: value })}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="What is this for?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Frequency */}
              <div>
                <Label>Frequency</Label>
                <Select
                  value={form.frequency}
                  onValueChange={(value) => setForm({ ...form, frequency: value as "daily" | "weekly" | "monthly" | "yearly" })}
                >
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </Select>
              </div>

              {/* Day of Month (for monthly) */}
              {form.frequency === "monthly" && (
                <div>
                  <Label>Day of Month</Label>
                  <Select
                    value={form.dayOfMonth}
                    onValueChange={(value) => setForm({ ...form, dayOfMonth: value })}
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                      <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                    ))}
                  </Select>
                </div>
              )}

              {/* Day of Week (for weekly) */}
              {form.frequency === "weekly" && (
                <div>
                  <Label>Day of Week</Label>
                  <Select
                    value={form.dayOfWeek}
                    onValueChange={(value) => setForm({ ...form, dayOfWeek: value })}
                  >
                    {dayLabels.map((d, i) => (
                      <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                    ))}
                  </Select>
                </div>
              )}

              {/* Start Date */}
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <Label>End Date (optional)</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
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
                    ? "Update"
                    : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="🔄"
          title="No recurring transactions"
          description="Set up automatic recurring transactions like salary, rent, or subscriptions"
          action={{ label: "Create Recurring", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className={!item.isActive ? "opacity-60" : ""}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.category.icon}</span>
                    <div>
                      <p className="font-medium text-sm">
                        {item.description || item.category.name}
                      </p>
                      <p className="text-xs text-muted">
                        {getFrequencyDescription(item)} • {item.user.name}
                      </p>
                      {item.lastRun && (
                        <p className="text-xs text-muted">
                          Last run: {new Date(item.lastRun).toLocaleDateString("id-ID")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium text-sm ${item.type === "income" ? "text-success" : "text-danger"}`}>
                      {item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
                    </p>
                    <p className="text-xs text-muted capitalize">{frequencyLabels[item.frequency]}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(item.id, item.isActive)}
                  >
                    {item.isActive ? "Pause" : "Resume"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(item.id)}
                  >
                    Delete
                  </Button>
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
        title="Delete Recurring Transaction"
        description="Are you sure you want to delete this recurring transaction? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      {/* FAB: Add Recurring */}
      {!showForm && !editingId && (
        <button
          onClick={() => {
            setEditingId(null);
            resetForm();
            setShowForm(true);
          }}
          className="fixed bottom-20 md:bottom-6 right-4 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors z-30"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
