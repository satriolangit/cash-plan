import { describe, it, expect, vi, beforeEach } from "vitest";
import { BudgetService } from "../budget.service";
import { budgetRepository } from "../budget.repository";
import { prisma } from "@/lib/prisma";
import { mockBudget, mockCategory } from "@test/factories";

vi.mock("../budget.repository", () => ({
  budgetRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    findByCategoryAndPeriod: vi.fn(),
  },
}));

describe("BudgetService", () => {
  let service: BudgetService;

  beforeEach(() => {
    service = new BudgetService();
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return budgets for a month", async () => {
      vi.mocked(budgetRepository.findAll).mockResolvedValue([mockBudget as any]);

      const result = await service.list("hh_demo", 5, 2026);

      expect(result).toHaveLength(1);
      expect(budgetRepository.findAll).toHaveBeenCalledWith("hh_demo", 5, 2026);
    });
  });

  describe("create", () => {
    it("should create budget with valid expense category", async () => {
      vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory as any);
      vi.mocked(budgetRepository.findByCategoryAndPeriod).mockResolvedValue(null);
      vi.mocked(budgetRepository.create).mockResolvedValue(mockBudget as any);

      const result = await service.create(
        {
          categoryId: "cat_expense_food",
          amount: 3000000,
          month: 5,
          year: 2026,
        },
        "hh_demo"
      );

      expect(result).toEqual(mockBudget);
    });

    it("should throw if category not found", async () => {
      vi.mocked(prisma.category.findFirst).mockResolvedValue(null);

      await expect(
        service.create(
          { categoryId: "non-existent", amount: 3000000, month: 5, year: 2026 },
          "hh_demo"
        )
      ).rejects.toThrow("Category not found");
    });

    it("should throw if category is not expense type", async () => {
      vi.mocked(prisma.category.findFirst).mockResolvedValue({
        ...mockCategory,
        type: "income",
      } as any);

      await expect(
        service.create(
          { categoryId: "cat_income_salary", amount: 3000000, month: 5, year: 2026 },
          "hh_demo"
        )
      ).rejects.toThrow("Budget can only be created for expense categories");
    });

    it("should throw if budget already exists for period", async () => {
      vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory as any);
      vi.mocked(budgetRepository.findByCategoryAndPeriod).mockResolvedValue(mockBudget as any);

      await expect(
        service.create(
          { categoryId: "cat_expense_food", amount: 3000000, month: 5, year: 2026 },
          "hh_demo"
        )
      ).rejects.toThrow("Budget already exists");
    });
  });

  describe("delete", () => {
    it("should soft delete existing budget", async () => {
      vi.mocked(budgetRepository.findById).mockResolvedValue(mockBudget as any);
      vi.mocked(budgetRepository.softDelete).mockResolvedValue();

      await service.delete("bud_food", "hh_demo");

      expect(budgetRepository.softDelete).toHaveBeenCalledWith("bud_food", "hh_demo");
    });

    it("should throw if budget not found", async () => {
      vi.mocked(budgetRepository.findById).mockResolvedValue(null);

      await expect(
        service.delete("non-existent", "hh_demo")
      ).rejects.toThrow("Budget not found");
    });
  });
});
