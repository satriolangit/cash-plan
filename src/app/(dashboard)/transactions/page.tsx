"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionCardSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { apiFetch } from "@/lib/auth-context";
import type { TransactionDTO } from "@/types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [month, year, typeFilter, page]);

  async function fetchTransactions() {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      month: String(month),
      year: String(year),
    });
    if (typeFilter !== "all") params.set("type", typeFilter);

    const res = await apiFetch(`/api/v1/transactions?${params}`);
    const data = await res.json();
    if (data.success) {
      setTransactions(data.data);
      setTotalPages(data.meta.totalPages);
    }
    setLoading(false);
  }

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Link href="/transactions/new">
          <Button size="sm">+ Add</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={month}
          onChange={(e) => { setMonth(Number(e.target.value)); setPage(1); }}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm"
        >
          {months.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => { setYear(Number(e.target.value)); setPage(1); }}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm"
        >
          {[2026, 2025].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <TransactionCardSkeleton key={i} />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No transactions yet"
          description="Start tracking your family finance"
          action={{ label: "Add Transaction", href: "/transactions/new" }}
        />
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <Link key={tx.id} href={`/transactions/${tx.id}/edit`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tx.category.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{tx.category.name}</p>
                      <p className="text-xs text-muted">
                        {tx.description || "No description"} • {formatDateShort(tx.transactionDate)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-medium text-sm ${
                      tx.type === "income" ? "text-success" : "text-danger"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(Number(tx.amount))}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted py-2">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
