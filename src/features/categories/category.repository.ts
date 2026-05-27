import { prisma } from "@/lib/prisma";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/types";
import { createCategorySchema, updateCategorySchema } from "@/lib/schemas";

export class CategoryRepository {
  async findAll(householdId: string, type?: string) {
    const where: Record<string, unknown> = {
      householdId,
      deletedAt: null,
    };

    if (type && type !== "all") {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return categories.map((cat) => ({
      ...cat,
      createdAt: cat.createdAt.toISOString(),
    }));
  }

  async findById(id: string, householdId: string) {
    const category = await prisma.category.findFirst({
      where: { id, householdId, deletedAt: null },
    });

    if (!category) return null;

    return {
      ...category,
      createdAt: category.createdAt.toISOString(),
    };
  }

  async create(data: CreateCategoryInput, householdId: string) {
    const category = await prisma.category.create({
      data: {
        householdId,
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
        isDefault: false,
      },
    });

    return {
      ...category,
      createdAt: category.createdAt.toISOString(),
    };
  }

  async update(id: string, householdId: string, data: UpdateCategoryInput) {
    await prisma.category.updateMany({
      where: { id, householdId, deletedAt: null },
      data,
    });

    return this.findById(id, householdId);
  }

  async softDelete(id: string, householdId: string): Promise<void> {
    // Check if category has active transactions
    const hasTransactions = await prisma.transaction.count({
      where: {
        categoryId: id,
        householdId,
        deletedAt: null,
      },
    });

    if (hasTransactions > 0) {
      throw new Error("Category has active transactions, cannot delete");
    }

    await prisma.category.updateMany({
      where: { id, householdId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}

export const categoryRepository = new CategoryRepository();
