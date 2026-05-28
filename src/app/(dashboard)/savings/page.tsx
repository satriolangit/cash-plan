"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/auth-context";
import { useSavingsTargets, queryKeys } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

import type { SavingsTarget } from "@/types";

export default function SavingsPage() {
  const { data: items = [], isLoading } = useSavingsTargets();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [depositTarget, setDepositTarget] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    targetAmount: 0,
    deadline: "",
    icon: "🎯",
    color: "#14B8A6",
  });

  const icons = ["🎯", "🏠", "🚗", "✈️", "📱", "💻", "🎓", "💍", "👶", "🏥", "🎁", "💰"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId
        ? `/api/v1/savings-targets/${editingId}`
        : "/api/v1/savings-targets";

      const body: Record<string, unknown> = {
        name: form.name,
        targetAmount: form.targetAmount,
        deadline: form.deadline || undefined,
        icon: form.icon,
        color: form.color,
      };

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
        toast("success", editingId ? "Target updated" : "Target created");
        queryClient.invalidateQueries({ queryKey: queryKeys.savingsTargets });
      } else {
        setError(data.error?.message || "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item: SavingsTarget) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      targetAmount: item.targetAmount,
      deadline: item.deadline ? item.deadline.split("T")[0] : "",
      icon: item.icon,
      color: item.color,
    });
    setShowForm(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      const res = await apiFetch(`/api/v1/savings-targets/${deleteTarget}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast("success", "Target deleted");
        queryClient.invalidateQueries({ queryKey: queryKeys.savingsTargets });
      } else {
        toast("error", data.error?.message || "Failed to delete");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleDeposit() {
    if (!depositTarget || depositAmount <= 0) return;

    try {
      const res = await apiFetch(`/api/v1/savings-targets/${depositTarget}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: depositAmount }),
      });
      const data = await res.json();
      if (data.success) {
        toast("success", `Deposited ${formatCurrency(depositAmount)}`);
        setDepositTarget(null);
        setDepositAmount(0);
        queryClient.invalidateQueries({ queryKey: queryKeys.savingsTargets });
      } else {
        toast("error", data.error?.message || "Failed to deposit");
      }
    } catch {
      toast("error", "Network error");
    }
  }

  async function handleWithdraw() {
    if (!withdrawTarget || withdrawAmount <= 0) return;

    try {
      const res = await apiFetch(`/api/v1/savings-targets/${withdrawTarget}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: withdrawAmount }),
      });
      const data = await res.json();
      if (data.success) {
        toast("success", `Withdrew ${formatCurrency(withdrawAmount)}`);
        setWithdrawTarget(null);
        setWithdrawAmount(0);
        queryClient.invalidateQueries({ queryKey: queryKeys.savingsTargets });
      } else {
        toast("error", data.error?.message || "Failed to withdraw");
      }
    } catch {
      toast("error", "Network error");
    }
  }

  function resetForm() {
    setForm({
      name: "",
      targetAmount: 0,
      deadline: "",
      icon: "🎯",
      color: "#14B8A6",
    });
    setError("");
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  }

  function getProgressPercent(current: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  }

  function getDaysLeft(deadline: string | null): string | null {
    if (!deadline) return null;
    const now = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Overdue";
    if (diff === 0) return "Today";
    return `${diff} days left`;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Savings Targets</h1>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => {
              setEditingId(null);
              resetForm();
              setShowForm(true);
            }}
          >
            + Add
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name */}
              <div>
                <Label>Target Name</Label>
                <Input
                  placeholder="e.g., Buy a house, Vacation fund"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Target Amount */}
              <div>
                <Label>Target Amount</Label>
                <MoneyInput
                  placeholder="0"
                  value={form.targetAmount}
                  onChange={(value) => setForm({ ...form, targetAmount: value })}
                  required
                />
              </div>

              {/* Icon */}
              <div>
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center ${
                        form.icon === icon ? "bg-primary/20 ring-2 ring-primary" : "bg-muted"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <Label>Color</Label>
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
              </div>

              {/* Deadline */}
              <div>
                <Label>Deadline (optional)</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
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

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No savings targets"
          description="Create a savings target to track your financial goals"
          action={{ label: "Create Target", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const percent = getProgressPercent(item.currentAmount, item.targetAmount);
            const daysLeft = getDaysLeft(item.deadline);

            return (
              <Card key={item.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted">
                          {formatCurrency(item.currentAmount)} / {formatCurrency(item.targetAmount)}
                        </p>
                        {daysLeft && (
                          <p className={`text-xs ${daysLeft === "Overdue" ? "text-danger" : "text-muted"}`}>
                            {daysLeft}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: item.color }}>
                        {percent}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-border rounded-full h-3 mb-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDepositTarget(item.id);
                        setDepositAmount(0);
                      }}
                    >
                      Deposit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setWithdrawTarget(item.id);
                        setWithdrawAmount(0);
                      }}
                    >
                      Withdraw
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
            );
          })}
        </div>
      )}

      {/* Deposit Dialog */}
      {depositTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-4">
              <h3 className="font-bold mb-3">Deposit</h3>
              <div className="space-y-3">
                <div>
                  <Label>Amount</Label>
                  <MoneyInput
                    placeholder="0"
                    value={depositAmount}
                    onChange={(value) => setDepositAmount(value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDepositTarget(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleDeposit}
                    disabled={depositAmount <= 0}
                  >
                    Deposit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Withdraw Dialog */}
      {withdrawTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-4">
              <h3 className="font-bold mb-3">Withdraw</h3>
              <div className="space-y-3">
                <div>
                  <Label>Amount</Label>
                  <MoneyInput
                    placeholder="0"
                    value={withdrawAmount}
                    onChange={(value) => setWithdrawAmount(value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setWithdrawTarget(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={handleWithdraw}
                    disabled={withdrawAmount <= 0}
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Savings Target"
        description="Are you sure you want to delete this savings target? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
