import type { UserSession } from "@/types";

export const mockOwnerSession: UserSession = {
  id: "usr_owner",
  name: "Budi Santoso",
  email: "budi@example.com",
  image: "https://example.com/avatar.jpg",
  role: "owner",
  householdId: "hh_demo",
};

export const mockMemberSession: UserSession = {
  id: "usr_member_1",
  name: "Ani Santoso",
  email: "ani@example.com",
  image: undefined,
  role: "member",
  householdId: "hh_demo",
};

export const mockTransaction = {
  id: "trx_1",
  householdId: "hh_demo",
  userId: "usr_owner",
  categoryId: "cat_expense_food",
  type: "expense" as const,
  amount: 50000,
  description: "Lunch",
  transactionDate: new Date("2026-05-26"),
  createdAt: new Date("2026-05-26T10:00:00Z"),
  deletedAt: null,
};

export const mockTransactionDTO = {
  id: "trx_1",
  type: "expense" as const,
  amount: 50000,
  description: "Lunch",
  transactionDate: "2026-05-26T00:00:00.000Z",
  createdAt: "2026-05-26T10:00:00.000Z",
  category: {
    id: "cat_expense_food",
    name: "Food & Drink",
    icon: "🍜",
    color: "#F97316",
  },
  createdBy: {
    id: "usr_owner",
    name: "Budi Santoso",
    avatar: "https://example.com/avatar.jpg",
  },
};

export const mockCategory = {
  id: "cat_expense_food",
  householdId: "hh_demo",
  name: "Food & Drink",
  icon: "🍜",
  color: "#F97316",
  type: "expense",
  isDefault: true,
  createdAt: new Date("2026-05-01"),
  deletedAt: null,
};

export const mockBudget = {
  id: "bud_food",
  householdId: "hh_demo",
  categoryId: "cat_expense_food",
  amount: 3000000,
  month: 5,
  year: 2026,
  createdAt: new Date("2026-05-01"),
  deletedAt: null,
  category: {
    id: "cat_expense_food",
    name: "Food & Drink",
    icon: "🍜",
    color: "#F97316",
  },
  spent: 1500000,
  percentage: 50,
  status: "safe" as const,
};

export const mockHousehold = {
  id: "hh_demo",
  name: "Demo Family",
  memberCount: 3,
  createdAt: "2026-05-01T00:00:00.000Z",
};

export const mockMember = {
  id: "usr_owner",
  name: "Budi Santoso",
  email: "budi@example.com",
  avatar: "https://example.com/avatar.jpg",
  role: "owner",
};
