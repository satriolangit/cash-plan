import { savingsTargetRepository } from "./savings-target.repository";
import type { CreateSavingsTargetInput, UpdateSavingsTargetInput } from "@/types";

export class SavingsTargetService {
  async list(householdId: string) {
    return savingsTargetRepository.findAll(householdId);
  }

  async getById(id: string, householdId: string) {
    return savingsTargetRepository.findById(id, householdId);
  }

  async create(input: CreateSavingsTargetInput, householdId: string) {
    return savingsTargetRepository.create(input, householdId);
  }

  async update(id: string, input: UpdateSavingsTargetInput, householdId: string) {
    const existing = await savingsTargetRepository.findById(id, householdId);
    if (!existing) {
      throw new Error("Savings target not found");
    }

    return savingsTargetRepository.update(id, householdId, input);
  }

  async deposit(id: string, amount: number, householdId: string) {
    const existing = await savingsTargetRepository.findById(id, householdId);
    if (!existing) {
      throw new Error("Savings target not found");
    }

    return savingsTargetRepository.deposit(id, householdId, amount);
  }

  async withdraw(id: string, amount: number, householdId: string) {
    const existing = await savingsTargetRepository.findById(id, householdId);
    if (!existing) {
      throw new Error("Savings target not found");
    }

    if (Number(existing.currentAmount) < amount) {
      throw new Error("Insufficient savings balance");
    }

    return savingsTargetRepository.withdraw(id, householdId, amount);
  }

  async delete(id: string, householdId: string) {
    const existing = await savingsTargetRepository.findById(id, householdId);
    if (!existing) {
      throw new Error("Savings target not found");
    }

    return savingsTargetRepository.softDelete(id, householdId);
  }
}

export const savingsTargetService = new SavingsTargetService();
