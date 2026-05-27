export interface Transaction {
  id: string;
  householdId: string;
  userId: string;
  categoryId: string;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  transactionDate: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface TransactionWithRelations extends Transaction {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  createdBy: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface TransactionDTO {
  id: string;
  type: "income" | "expense";
  amount: number;
  description?: string;
  transactionDate: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface CreateTransactionInput {
  type: "income" | "expense";
  amount: number;
  categoryId: string;
  description?: string;
  transactionDate: string;
}

export interface UpdateTransactionInput {
  type?: "income" | "expense";
  amount?: number;
  categoryId?: string;
  description?: string;
  transactionDate?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
  type?: "income" | "expense";
  categoryId?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface Category {
  id: string;
  householdId: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  isDefault: boolean;
  createdAt: string;
  deletedAt: string | null;
}

export interface Budget {
  id: string;
  householdId: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  createdAt: string;
  deletedAt: string | null;
}

export interface BudgetWithRelations extends Budget {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  spent: number;
  percentage: number;
  status: "safe" | "warning" | "over";
}

export interface DashboardSummary {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyChangePercent: number;
  budgetAlerts: Array<{
    categoryId: string;
    categoryName: string;
    percentage: number;
  }>;
  recentTransactions: TransactionDTO[];
  expenseChart: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
}

export interface Household {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

export interface UserSession {
  id: string;
  name: string | null;
  email: string;
  image?: string;
  role: string;
  householdId: string;
}

export interface CreateCategoryInput {
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense" | "both";
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  color?: string;
  type?: "income" | "expense" | "both";
}

export interface CreateBudgetInput {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface UpdateBudgetInput {
  amount?: number;
}
