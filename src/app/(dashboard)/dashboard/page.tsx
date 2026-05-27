"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatMonthYear, getCurrentMonthYear } from "@/lib/utils";
import { apiFetch } from "@/lib/auth-context";
import { ArrowRight } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DashboardData {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyChangePercent: number;
  budgetAlerts: Array<{
    categoryId: string;
    categoryName: string;
    percentage: number;
  }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    transactionDate: string;
    category: { name: string; icon: string };
    createdBy: { name: string };
  }>;
  expenseChart: Array<{
    categoryName: string;
    amount: number;
    color: string;
  }>;
}

function DashboardContent() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { month, year } = getCurrentMonthYear();

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await apiFetch("/api/v1/dashboard/summary");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error?.message || "Failed to load dashboard");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          icon="⚠️"
          title="Failed to load dashboard"
          description={error}
          action={{ label: "Retry", onClick: fetchDashboard }}
        />
      </div>
    );
  }

  if (!data) return null;

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Hi, {firstName} 👋</h1>
        <p className="text-sm text-muted">{formatMonthYear(month, year)}</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary-dark border-0">
        <CardContent className="text-white">
          <p className="text-sm opacity-80">Net Balance</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(data.balance)}</p>
          <p className="text-sm mt-2 opacity-80">
            {data.monthlyChangePercent >= 0 ? "↑" : "↓"}{" "}
            {Math.abs(data.monthlyChangePercent)}% bulan ini
          </p>
        </CardContent>
      </Card>

      {/* Income / Expense Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent>
            <p className="text-xs text-muted">Income</p>
            <p className="text-lg font-bold text-success">
              {formatCurrency(data.totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted">Expense</p>
            <p className="text-lg font-bold text-danger">
              {formatCurrency(data.totalExpense)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {data.budgetAlerts.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent>
            <p className="text-sm font-medium text-warning">⚠ Budget Alert</p>
            <div className="mt-2 space-y-2">
              {data.budgetAlerts.map((alert) => {
                const color = alert.percentage >= 100 ? "bg-danger" : "bg-warning";
                return (
                  <div key={alert.categoryId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted">{alert.categoryName}</span>
                      <span className="text-muted">{alert.percentage}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${color}`}
                        style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense Breakdown Chart */}
      {data.expenseChart.length > 0 && (
        <Card>
          <CardContent>
            <p className="text-sm font-medium mb-3">Expense Breakdown</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.expenseChart}
                    dataKey="amount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {data.expenseChart.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1">
              {data.expenseChart.map((item) => (
                <div key={item.categoryName} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted">{item.categoryName}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent Transactions</h2>
          <Link
            href="/transactions"
            className="text-xs text-primary flex items-center gap-1"
          >
            Lihat Semua <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {data.recentTransactions.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No transactions yet"
            description="Start tracking your family finance"
            action={{ label: "Add Transaction", href: "/transactions/new" }}
          />
        ) : (
          <div className="space-y-2">
            {data.recentTransactions.map((tx) => (
              <Link key={tx.id} href={`/transactions/${tx.id}/edit`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tx.category.icon}</span>
                      <div>
                        <p className="font-medium text-sm">
                          {tx.description || tx.category.name}
                        </p>
                        <p className="text-xs text-muted">
                          {new Date(tx.transactionDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          • {tx.createdBy.name}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-medium text-sm ${
                        tx.type === "income" ? "text-success" : "text-danger"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(Number(tx.amount))}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
