import { prisma } from "@/lib/prisma";
import type { CreateSavingsTargetInput, UpdateSavingsTargetInput } from "@/types";

export class SavingsTargetRepository {
  async findAll(householdId: string) {
    const items = await prisma.savingsTarget.findMany({
      where: {
        householdId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return items.map((item) => ({
      ...item,
      targetAmount: Number(item.targetAmount),
      currentAmount: Number(item.currentAmount),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      deadline: item.deadline?.toISOString() || null,
    }));
  }

  async findById(id: string, householdId: string) {
    const item = await prisma.savingsTarget.findFirst({
      where: { id, householdId, deletedAt: null },
    });

    if (!item) return null;

    return {
      ...item,
      targetAmount: Number(item.targetAmount),
      currentAmount: Number(item.currentAmount),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      deadline: item.deadline?.toISOString() || null,
    };
  }

  async create(data: CreateSavingsTargetInput, householdId: string) {
    const item = await prisma.savingsTarget.create({
      data: {
        householdId,
        name: data.name,
        targetAmount: data.targetAmount,
        deadline: data.deadline ? new Date(data.deadline) : null,
        icon: data.icon,
        color: data.color,
      },
    });

    return {
      ...item,
      targetAmount: Number(item.targetAmount),
      currentAmount: Number(item.currentAmount),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      deadline: item.deadline?.toISOString() || null,
    };
  }

  async update(id: string, householdId: string, data: UpdateSavingsTargetInput) {
    const updateData: Record<string, unknown> = {};

    if (data.name) updateData.name = data.name;
    if (data.targetAmount) updateData.targetAmount = data.targetAmount;
    if (data.currentAmount !== undefined) updateData.currentAmount = data.currentAmount;
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    if (data.icon) updateData.icon = data.icon;
    if (data.color) updateData.color = data.color;

    await prisma.savingsTarget.updateMany({
      where: { id, householdId, deletedAt: null },
      data: updateData,
    });

    return this.findById(id, householdId);
  }

  async deposit(id: string, householdId: string, amount: number) {
    const item = await this.findById(id, householdId);
    if (!item) return null;

    const newAmount = Number(item.currentAmount) + amount;

    await prisma.savingsTarget.updateMany({
      where: { id, householdId, deletedAt: null },
      data: { currentAmount: newAmount },
    });

    return this.findById(id, householdId);
  }

  async withdraw(id: string, householdId: string, amount: number) {
    const item = await this.findById(id, householdId);
    if (!item) return null;

    const newAmount = Math.max(0, Number(item.currentAmount) - amount);

    await prisma.savingsTarget.updateMany({
      where: { id, householdId, deletedAt: null },
      data: { currentAmount: newAmount },
    });

    return this.findById(id, householdId);
  }

  async softDelete(id: string, householdId: string): Promise<void> {
    await prisma.savingsTarget.updateMany({
      where: { id, householdId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}

export const savingsTargetRepository = new SavingsTargetRepository();
