import { budgetRepository } from "./budget.repository";
import { prisma } from "@/lib/prisma";
import type { CreateBudgetInput, UpdateBudgetInput } from "@/types";

export class BudgetService {
  async list(householdId: string, month: number, year: number) {
    return budgetRepository.findAll(householdId, month, year);
  }

  async getById(id: string, householdId: string) {
    return budgetRepository.findById(id, householdId);
  }

  async create(input: CreateBudgetInput, householdId: string) {
    // Validate category belongs to household and is expense type
    const category = await prisma.category.findFirst({
      where: {
        id: input.categoryId,
        householdId,
        deletedAt: null,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    if (category.type !== "expense" && category.type !== "both") {
      throw new Error("Budget can only be created for expense categories");
    }

    // Check if budget already exists for this category/period
    const existing = await budgetRepository.findByCategoryAndPeriod(
      householdId,
      input.categoryId,
      input.month,
      input.year
    );

    if (existing) {
      throw new Error("Budget already exists for this category and period");
    }

    return budgetRepository.create(input, householdId);
  }

  async update(id: string, input: UpdateBudgetInput, householdId: string) {
    const existing = await budgetRepository.findById(id, householdId);
    if (!existing) {
      throw new Error("Budget not found");
    }

    return budgetRepository.update(id, householdId, input);
  }

  async delete(id: string, householdId: string) {
    const existing = await budgetRepository.findById(id, householdId);
    if (!existing) {
      throw new Error("Budget not found");
    }

    return budgetRepository.softDelete(id, householdId);
  }
}

export const budgetService = new BudgetService();
