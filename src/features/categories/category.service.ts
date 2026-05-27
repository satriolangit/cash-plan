import { categoryRepository } from "./category.repository";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/types";

export class CategoryService {
  async list(householdId: string, type?: string) {
    return categoryRepository.findAll(householdId, type);
  }

  async getById(id: string, householdId: string) {
    return categoryRepository.findById(id, householdId);
  }

  async create(input: CreateCategoryInput, householdId: string) {
    return categoryRepository.create(input, householdId);
  }

  async update(id: string, input: UpdateCategoryInput, householdId: string) {
    const existing = await categoryRepository.findById(id, householdId);
    if (!existing) {
      throw new Error("Category not found");
    }

    return categoryRepository.update(id, householdId, input);
  }

  async delete(id: string, householdId: string) {
    const existing = await categoryRepository.findById(id, householdId);
    if (!existing) {
      throw new Error("Category not found");
    }

    return categoryRepository.softDelete(id, householdId);
  }
}

export const categoryService = new CategoryService();
