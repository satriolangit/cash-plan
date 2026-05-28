import { prisma } from "@/lib/prisma";
import type { CreateBudgetInput, UpdateBudgetInput } from "@/types";

export class BudgetRepository {
  async findAll(householdId: string, month?: number, year?: number) {
    const where: Record<string, unknown> = {
      householdId,
      deletedAt: null,
    };

    if (month && year) {
      where.month = month;
      where.year = year;
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate spent for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spentWhere: Record<string, unknown> = {
          householdId,
          categoryId: budget.categoryId,
          type: "expense",
          deletedAt: null,
        };

        if (month && year) {
          const start = new Date(year, month - 1, 1);
          const end = new Date(year, month, 0, 23, 59, 59, 999);
          spentWhere.transactionDate = { gte: start, lte: end };
        }

        const result = await prisma.transaction.aggregate({
          where: spentWhere,
          _sum: { amount: true },
        });

        const spent = Number(result._sum.amount || 0);
        const budgetAmount = Number(budget.amount);
        const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

        let status: "safe" | "warning" | "over" = "safe";
        if (percentage >= 100) status = "over";
        else if (percentage >= 75) status = "warning";

        return {
          ...budget,
          amount: budgetAmount,
          spent,
          percentage,
          status,
          createdAt: budget.createdAt.toISOString(),
        };
      })
    );

    return budgetsWithSpent;
  }

  async findById(id: string, householdId: string) {
    const budget = await prisma.budget.findFirst({
      where: { id, householdId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });

    if (!budget) return null;

    return {
      ...budget,
      amount: Number(budget.amount),
      createdAt: budget.createdAt.toISOString(),
    };
  }

  async create(data: CreateBudgetInput, householdId: string) {
    const budget = await prisma.budget.create({
      data: {
        householdId,
        categoryId: data.categoryId,
        amount: data.amount,
        month: data.month,
        year: data.year,
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });

    return {
      ...budget,
      amount: Number(budget.amount),
      createdAt: budget.createdAt.toISOString(),
    };
  }

  async update(id: string, householdId: string, data: UpdateBudgetInput) {
    await prisma.budget.updateMany({
      where: { id, householdId, deletedAt: null },
      data: data.amount ? { amount: data.amount } : {},
    });

    return this.findById(id, householdId);
  }

  async softDelete(id: string, householdId: string): Promise<void> {
    await prisma.budget.updateMany({
      where: { id, householdId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async findByCategoryAndPeriod(
    householdId: string,
    categoryId: string,
    month: number,
    year: number
  ) {
    return prisma.budget.findFirst({
      where: {
        householdId,
        categoryId,
        month,
        year,
        deletedAt: null,
      },
    });
  }
}

export const budgetRepository = new BudgetRepository();
