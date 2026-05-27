import { transactionRepository } from "./transaction.repository";
import { prisma } from "@/lib/prisma";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  UserSession,
} from "@/types";

export class TransactionService {
  async list(filters: TransactionFilters, householdId: string) {
    return transactionRepository.findAll(householdId, filters);
  }

  async getById(id: string, householdId: string) {
    return transactionRepository.findById(id, householdId);
  }

  async create(
    input: CreateTransactionInput,
    householdId: string,
    user: UserSession
  ) {
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

    // Validate type matches category type
    if (category.type !== "both" && category.type !== input.type) {
      throw new Error(`Category is not for ${input.type} transactions`);
    }

    return transactionRepository.create(input, householdId, user.id);
  }

  async update(
    id: string,
    input: UpdateTransactionInput,
    householdId: string
  ) {
    // Validate category if changing
    if (input.categoryId) {
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
    }

    // Validate transaction exists
    const existing = await transactionRepository.findById(id, householdId);
    if (!existing) {
      throw new Error("Transaction not found");
    }

    return transactionRepository.update(id, householdId, input);
  }

  async delete(id: string, householdId: string) {
    const existing = await transactionRepository.findById(id, householdId);
    if (!existing) {
      throw new Error("Transaction not found");
    }

    return transactionRepository.softDelete(id, householdId);
  }
}

export const transactionService = new TransactionService();
