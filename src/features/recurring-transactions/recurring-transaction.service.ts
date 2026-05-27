import { recurringTransactionRepository } from "./recurring-transaction.repository";
import { prisma } from "@/lib/prisma";
import type { CreateRecurringTransactionInput, UpdateRecurringTransactionInput } from "@/types";

export class RecurringTransactionService {
  async list(householdId: string) {
    return recurringTransactionRepository.findAll(householdId);
  }

  async getById(id: string, householdId: string) {
    return recurringTransactionRepository.findById(id, householdId);
  }

  async create(input: CreateRecurringTransactionInput, householdId: string, userId: string) {
    // Validate category belongs to household
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

    // Validate frequency-specific fields
    if (input.frequency === "monthly" && !input.dayOfMonth) {
      throw new Error("dayOfMonth is required for monthly frequency");
    }

    if (input.frequency === "weekly" && input.dayOfWeek === undefined) {
      throw new Error("dayOfWeek is required for weekly frequency");
    }

    return recurringTransactionRepository.create(input, householdId, userId);
  }

  async update(id: string, input: UpdateRecurringTransactionInput, householdId: string) {
    const existing = await recurringTransactionRepository.findById(id, householdId);
    if (!existing) {
      throw new Error("Recurring transaction not found");
    }

    return recurringTransactionRepository.update(id, householdId, input);
  }

  async delete(id: string, householdId: string) {
    const existing = await recurringTransactionRepository.findById(id, householdId);
    if (!existing) {
      throw new Error("Recurring transaction not found");
    }

    return recurringTransactionRepository.softDelete(id, householdId);
  }

  async processRecurringTransactions(): Promise<number> {
    const activeItems = await recurringTransactionRepository.findActive();
    let processedCount = 0;

    const now = new Date();

    for (const item of activeItems) {
      if (this.shouldRun(item, now)) {
        // Create the transaction
        await prisma.transaction.create({
          data: {
            householdId: item.householdId,
            userId: item.userId,
            categoryId: item.categoryId,
            type: item.type,
            amount: item.amount,
            description: item.description,
            transactionDate: now,
          },
        });

        // Update last run
        await recurringTransactionRepository.updateLastRun(item.id);
        processedCount++;
      }
    }

    return processedCount;
  }

  private shouldRun(
    item: {
      frequency: string;
      dayOfMonth: number | null;
      dayOfWeek: number | null;
      lastRun: Date | null;
    },
    now: Date
  ): boolean {
    const lastRun = item.lastRun;

    // If already ran today, skip
    if (lastRun) {
      const lastRunDate = new Date(lastRun);
      if (
        lastRunDate.getFullYear() === now.getFullYear() &&
        lastRunDate.getMonth() === now.getMonth() &&
        lastRunDate.getDate() === now.getDate()
      ) {
        return false;
      }
    }

    switch (item.frequency) {
      case "daily":
        return true;

      case "weekly":
        return now.getDay() === item.dayOfWeek;

      case "monthly":
        return now.getDate() === item.dayOfMonth;

      case "yearly":
        // Check if today is the same day as start date (month/day)
        if (lastRun) {
          const lastRunDate = new Date(lastRun);
          return lastRunDate.getFullYear() < now.getFullYear();
        }
        return true;

      default:
        return false;
    }
  }
}

export const recurringTransactionService = new RecurringTransactionService();
