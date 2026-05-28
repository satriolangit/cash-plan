import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/auth-context";
import type {
  Category,
  Household,
  HouseholdMember,
  DashboardSummary,
  TransactionDTO,
  PaginatedResponse,
  RecurringTransactionWithRelations,
  BudgetWithRelations,
  SavingsTarget,
} from "@/types";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await apiFetch(url);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || "Request failed");
  return data.data;
}

async function fetchPaginated<T>(url: string): Promise<PaginatedResponse<T>> {
  const res = await apiFetch(url);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || "Request failed");
  return data;
}

export const queryKeys = {
  categories: ["categories"] as const,
  categoriesByType: (type: string) => ["categories", type] as const,
  household: ["household"] as const,
  householdMembers: ["household", "members"] as const,
  dashboardSummary: ["dashboard", "summary"] as const,
  dashboardSummaryWithFilter: (month?: number, year?: number) => {
    const key: (string | number)[] = ["dashboard", "summary"];
    if (month) key.push(month);
    if (year) key.push(year);
    return key;
  },
  transactions: (params: TransactionQueryParams) => {
    const key: Record<string, string | number> = { page: params.page };
    if (params.month) key.month = params.month;
    if (params.year) key.year = params.year;
    if (params.type) key.type = params.type;
    return ["transactions", key] as const;
  },
  recurringTransactions: ["recurring-transactions"] as const,
  budgets: (month: number, year: number) => ["budgets", { month, year }] as const,
  categoryBreakdown: (month: number, year: number) => ["reports", "category-breakdown", { month, year }] as const,
  monthlyTrend: ["reports", "monthly-trend"] as const,
  savingsTargets: ["savings-targets"] as const,
  transaction: (id: string) => ["transactions", id] as const,
} as const;

export interface TransactionQueryParams {
  page: number;
  month?: number;
  year?: number;
  type?: string;
}

export function useCategories(type?: string) {
  const key = type ? queryKeys.categoriesByType(type) : queryKeys.categories;
  const url = type ? `/api/v1/categories?type=${type}` : "/api/v1/categories";
  return useQuery({
    queryKey: key,
    queryFn: () => fetchJSON<Category[]>(url),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHousehold() {
  return useQuery({
    queryKey: queryKeys.household,
    queryFn: () => fetchJSON<Household>("/api/v1/household"),
    staleTime: 10 * 60 * 1000,
  });
}

export function useHouseholdMembers() {
  return useQuery({
    queryKey: queryKeys.householdMembers,
    queryFn: () => fetchJSON<HouseholdMember[]>("/api/v1/household/members"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDashboardSummary(month?: number, year?: number) {
  const qs = buildSearchParams({ month, year });
  const url = qs ? `/api/v1/dashboard/summary?${qs}` : "/api/v1/dashboard/summary";
  return useQuery({
    queryKey: queryKeys.dashboardSummaryWithFilter(month, year),
    queryFn: () => fetchJSON<DashboardSummary>(url),
    staleTime: 2 * 60 * 1000,
  });
}

function buildSearchParams(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "all") {
      searchParams.set(key, String(value));
    }
  }
  return searchParams.toString();
}

export function useTransactions(params: TransactionQueryParams) {
  const qs = buildSearchParams({
    page: params.page,
    limit: 20,
    month: params.month,
    year: params.year,
    type: params.type,
  });
  return useQuery({
    queryKey: queryKeys.transactions(params),
    queryFn: () => fetchPaginated<TransactionDTO>(`/api/v1/transactions?${qs}`),
    staleTime: 0,
  });
}

export function useRecurringTransactions() {
  return useQuery({
    queryKey: queryKeys.recurringTransactions,
    queryFn: () => fetchJSON<RecurringTransactionWithRelations[]>("/api/v1/recurring-transactions"),
    staleTime: 60 * 1000,
  });
}

export function useBudgets(month: number, year: number) {
  const qs = buildSearchParams({ month, year });
  return useQuery({
    queryKey: queryKeys.budgets(month, year),
    queryFn: () => fetchJSON<BudgetWithRelations[]>(`/api/v1/budgets?${qs}`),
    staleTime: 60 * 1000,
  });
}

export function useCategoryBreakdown(month: number, year: number) {
  const qs = buildSearchParams({ month, year });
  return useQuery({
    queryKey: queryKeys.categoryBreakdown(month, year),
    queryFn: () => fetchJSON(`/api/v1/reports/category-breakdown?${qs}`) as Promise<Array<{categoryId: string; categoryName: string; amount: number; percentage: number; color: string}>>,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMonthlyTrend() {
  return useQuery({
    queryKey: queryKeys.monthlyTrend,
    queryFn: () => fetchJSON(`/api/v1/reports/monthly-trend?months=6`) as Promise<Array<{month: string; income: number; expense: number}>>,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSavingsTargets() {
  return useQuery({
    queryKey: queryKeys.savingsTargets,
    queryFn: () => fetchJSON<SavingsTarget[]>("/api/v1/savings-targets"),
    staleTime: 60 * 1000,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.transaction(id),
    queryFn: () => fetchJSON<TransactionDTO>(`/api/v1/transactions/${id}`),
    staleTime: 60 * 1000,
  });
}
