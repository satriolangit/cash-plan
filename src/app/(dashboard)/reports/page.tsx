"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/auth-context";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export default function ReportsPage() {
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "categories" | "monthly">("overview");
  const { toast } = useToast();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    fetchData();
  }, [month, year]);

  async function fetchData() {
    setLoading(true);
    const [breakdownRes, trendRes] = await Promise.all([
      apiFetch(`/api/v1/reports/category-breakdown?month=${month}&year=${year}`),
      apiFetch(`/api/v1/reports/monthly-trend?months=6`),
    ]);

    const breakdownData = await breakdownRes.json();
    const trendData = await trendRes.json();

    if (breakdownData.success) setBreakdown(breakdownData.data);
    if (trendData.success) setTrend(trendData.data);
    setLoading(false);
  }

  async function handleExport() {
    try {
      const res = await apiFetch(`/api/v1/reports/export?month=${month}&year=${year}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${month}-${year}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast("success", "CSV exported successfully");
    } catch {
      toast("error", "Failed to export CSV");
    }
  }

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl">
        {(["overview", "categories", "monthly"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t ? "bg-white shadow-sm" : "text-muted"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Filters */}
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

      {loading ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="py-6">
              <Skeleton className="h-64 w-full rounded-xl" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6">
              <Skeleton className="h-64 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Overview / Categories */}
          {(tab === "overview" || tab === "categories") && (
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {breakdown.length === 0 ? (
                  <EmptyState
                    icon="📊"
                    title="No expense data"
                    description="Add some expenses to see the breakdown"
                  />
                ) : (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={breakdown}
                            dataKey="amount"
                            nameKey="categoryName"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                          >
                            {breakdown.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {breakdown.map((item) => (
                        <div key={item.categoryId} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{item.categoryName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                            <span className="text-xs text-muted ml-2">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Monthly Trend */}
          {(tab === "overview" || tab === "monthly") && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {trend.length === 0 ? (
                  <EmptyState
                    icon="📈"
                    title="No trend data"
                    description="Add transactions over multiple months to see trends"
                  />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="income" fill="#22C55E" name="Income" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="#EF4444" name="Expense" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Export */}
          <Button variant="outline" className="w-full" onClick={handleExport}>
            Export CSV
          </Button>
        </>
      )}
    </div>
  );
}
