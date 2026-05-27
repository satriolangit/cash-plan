import { prisma } from "@/lib/prisma";
import type { CreateRecurringTransactionInput, UpdateRecurringTransactionInput } from "@/types";

export class RecurringTransactionRepository {
  async findAll(householdId: string) {
    const items = await prisma.recurringTransaction.findMany({
      where: {
        householdId,
        deletedAt: null,
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return items.map((item) => ({
      ...item,
      amount: Number(item.amount),
      createdAt: item.createdAt.toISOString(),
      startDate: item.startDate.toISOString(),
      endDate: item.endDate?.toISOString() || null,
      lastRun: item.lastRun?.toISOString() || null,
    }));
  }

  async findById(id: string, householdId: string) {
    const item = await prisma.recurringTransaction.findFirst({
      where: { id, householdId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        user: { select: { id: true, name: true } },
      },
    });

    if (!item) return null;

    return {
      ...item,
      amount: Number(item.amount),
      createdAt: item.createdAt.toISOString(),
      startDate: item.startDate.toISOString(),
      endDate: item.endDate?.toISOString() || null,
      lastRun: item.lastRun?.toISOString() || null,
    };
  }

  async create(data: CreateRecurringTransactionInput, householdId: string, userId: string) {
    const item = await prisma.recurringTransaction.create({
      data: {
        householdId,
        userId,
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        frequency: data.frequency,
        dayOfMonth: data.dayOfMonth,
        dayOfWeek: data.dayOfWeek,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return {
      ...item,
      amount: Number(item.amount),
      createdAt: item.createdAt.toISOString(),
      startDate: item.startDate.toISOString(),
      endDate: item.endDate?.toISOString() || null,
      lastRun: item.lastRun?.toISOString() || null,
    };
  }

  async update(id: string, householdId: string, data: UpdateRecurringTransactionInput) {
    const updateData: Record<string, unknown> = {};

    if (data.categoryId) updateData.categoryId = data.categoryId;
    if (data.type) updateData.type = data.type;
    if (data.amount) updateData.amount = data.amount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.frequency) updateData.frequency = data.frequency;
    if (data.dayOfMonth !== undefined) updateData.dayOfMonth = data.dayOfMonth;
    if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await prisma.recurringTransaction.updateMany({
      where: { id, householdId, deletedAt: null },
      data: updateData,
    });

    return this.findById(id, householdId);
  }

  async softDelete(id: string, householdId: string): Promise<void> {
    await prisma.recurringTransaction.updateMany({
      where: { id, householdId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async findActive(): Promise<Array<{
    id: string;
    householdId: string;
    userId: string;
    categoryId: string;
    type: string;
    amount: number;
    description: string | null;
    frequency: string;
    dayOfMonth: number | null;
    dayOfWeek: number | null;
    startDate: Date;
    endDate: Date | null;
    lastRun: Date | null;
  }>> {
    const items = await prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
    });

    return items.map((item) => ({
      ...item,
      amount: Number(item.amount),
    }));
  }

  async updateLastRun(id: string): Promise<void> {
    await prisma.recurringTransaction.update({
      where: { id },
      data: { lastRun: new Date() },
    });
  }
}

export const recurringTransactionRepository = new RecurringTransactionRepository();
