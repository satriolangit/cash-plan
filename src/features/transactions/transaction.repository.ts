import { prisma } from "@/lib/prisma";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
} from "@/types";

export class TransactionRepository {
  async findAll(
    householdId: string,
    filters: TransactionFilters
  ) {
    const { page = 1, limit = 20, month, year, type, categoryId } = filters;

    const where: Record<string, unknown> = {
      householdId,
      deletedAt: null,
    };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      where.transactionDate = { gte: start, lte: end };
    }

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { transactionDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: data.map((tx) => ({
        ...tx,
        createdBy: {
          id: tx.user.id,
          name: tx.user.name,
          avatar: tx.user.avatarUrl,
        },
        createdAt: tx.createdAt.toISOString(),
        transactionDate: tx.transactionDate.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, householdId: string) {
    const tx = await prisma.transaction.findFirst({
      where: { id, householdId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!tx) return null;

    return {
      ...tx,
      createdBy: {
        id: tx.user.id,
        name: tx.user.name,
        avatar: tx.user.avatarUrl,
      },
      createdAt: tx.createdAt.toISOString(),
      transactionDate: tx.transactionDate.toISOString(),
    };
  }

  async create(data: CreateTransactionInput, householdId: string, userId: string) {
    const tx = await prisma.transaction.create({
      data: {
        householdId,
        userId,
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description || null,
        transactionDate: new Date(data.transactionDate),
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return {
      ...tx,
      createdBy: {
        id: tx.user.id,
        name: tx.user.name,
        avatar: tx.user.avatarUrl,
      },
      createdAt: tx.createdAt.toISOString(),
      transactionDate: tx.transactionDate.toISOString(),
    };
  }

  async update(id: string, householdId: string, data: UpdateTransactionInput) {
    const tx = await prisma.transaction.updateMany({
      where: { id, householdId, deletedAt: null },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.amount && { amount: data.amount }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.transactionDate && { transactionDate: new Date(data.transactionDate) }),
      },
    });

    return this.findById(id, householdId);
  }

  async softDelete(id: string, householdId: string): Promise<void> {
    await prisma.transaction.updateMany({
      where: { id, householdId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async getTotalByType(
    householdId: string,
    type: "income" | "expense",
    month: number,
    year: number
  ) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await prisma.transaction.aggregate({
      where: {
        householdId,
        type,
        deletedAt: null,
        transactionDate: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    return Number(result._sum.amount || 0);
  }

  async getCategoryBreakdown(householdId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        householdId,
        type: "expense",
        deletedAt: null,
        transactionDate: { gte: start, lte: end },
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
      },
    });

    const grouped = transactions.reduce(
      (acc, tx) => {
        const catId = tx.categoryId;
        if (!acc[catId]) {
          acc[catId] = {
            categoryId: catId,
            categoryName: tx.category.name,
            amount: 0,
            color: tx.category.color,
          };
        }
        acc[catId].amount += Number(tx.amount);
        return acc;
      },
      {} as Record<string, { categoryId: string; categoryName: string; amount: number; color: string }>
    );

    const total = Object.values(grouped).reduce((sum, g) => sum + g.amount, 0);

    return Object.values(grouped)
      .map((g) => ({
        ...g,
        percentage: total > 0 ? Math.round((g.amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  async getMonthlyTrend(householdId: string, months: number = 6) {
    const now = new Date();
    const trend = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);

      const [income, expense] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            householdId,
            type: "income",
            deletedAt: null,
            transactionDate: { gte: start, lte: end },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            householdId,
            type: "expense",
            deletedAt: null,
            transactionDate: { gte: start, lte: end },
          },
          _sum: { amount: true },
        }),
      ]);

      trend.push({
        month: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(d),
        income: Number(income._sum.amount || 0),
        expense: Number(expense._sum.amount || 0),
      });
    }

    return trend;
  }
}

export const transactionRepository = new TransactionRepository();
