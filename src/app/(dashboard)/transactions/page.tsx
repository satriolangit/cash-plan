"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionCardSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { apiFetch } from "@/lib/auth-context";
import { Search, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { TransactionDTO } from "@/types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
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

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.description?.toLowerCase().includes(q) ||
        tx.category.name.toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const activeFilterCount = (typeFilter !== "all" ? 1 : 0);

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

      {/* Search + Filter row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-medium">
                  {activeFilterCount}
                </span>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="space-y-3 w-56">
            {/* Month */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Month</label>
              <Select
                value={String(month)}
                onValueChange={(v) => { setMonth(Number(v)); setPage(1); }}
              >
                {months.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </Select>
            </div>

            {/* Year */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Year</label>
              <Select
                value={String(year)}
                onValueChange={(v) => { setYear(Number(v)); setPage(1); }}
              >
                {[2026, 2025].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </Select>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
              <Select
                value={typeFilter}
                onValueChange={(v) => { setTypeFilter(v); setPage(1); }}
              >
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </Select>
            </div>

            {/* Reset */}
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setTypeFilter("all")}
              >
                Reset filters
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <TransactionCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          icon="📝"
          title={search ? "No matching transactions" : "No transactions yet"}
          description={search ? "Try a different search term" : "Start tracking your family finance"}
          action={search ? undefined : { label: "Add Transaction", href: "/transactions/new" }}
        />
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => (
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
