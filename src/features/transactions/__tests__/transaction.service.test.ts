import { describe, it, expect, vi, beforeEach } from "vitest";
import { TransactionService } from "../transaction.service";
import { transactionRepository } from "../transaction.repository";
import { prisma } from "@/lib/prisma";
import { mockOwnerSession, mockTransactionDTO, mockCategory } from "@test/factories";

vi.mock("../transaction.repository", () => ({
  transactionRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
}));

describe("TransactionService", () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService();
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return paginated transactions", async () => {
      vi.mocked(transactionRepository.findAll).mockResolvedValue({
        data: [mockTransactionDTO as any],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const result = await service.list({ page: 1, limit: 20 }, "hh_demo");

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(transactionRepository.findAll).toHaveBeenCalledWith("hh_demo", {
        page: 1,
        limit: 20,
      });
    });
  });

  describe("getById", () => {
    it("should return transaction by id", async () => {
      vi.mocked(transactionRepository.findById).mockResolvedValue(mockTransactionDTO as any);

      const result = await service.getById("trx_1", "hh_demo");

      expect(result).toEqual(mockTransactionDTO);
    });

    it("should return null for non-existent transaction", async () => {
      vi.mocked(transactionRepository.findById).mockResolvedValue(null);

      const result = await service.getById("non-existent", "hh_demo");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create transaction with valid category", async () => {
      vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory as any);
      vi.mocked(transactionRepository.create).mockResolvedValue(mockTransactionDTO as any);

      const result = await service.create(
        {
          type: "expense",
          amount: 50000,
          categoryId: "cat_expense_food",
          description: "Lunch",
          transactionDate: "2026-05-26",
        },
        "hh_demo",
        mockOwnerSession
      );

      expect(result).toEqual(mockTransactionDTO);
      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: {
          id: "cat_expense_food",
          householdId: "hh_demo",
          deletedAt: null,
        },
      });
    });

    it("should throw if category not found", async () => {
      vi.mocked(prisma.category.findFirst).mockResolvedValue(null);

      await expect(
        service.create(
          {
            type: "expense",
            amount: 50000,
            categoryId: "non-existent",
            transactionDate: "2026-05-26",
          },
          "hh_demo",
          mockOwnerSession
        )
      ).rejects.toThrow("Category not found");
    });

    it("should throw if category type does not match", async () => {
      vi.mocked(prisma.category.findFirst).mockResolvedValue({
        ...mockCategory,
        type: "income",
      } as any);

      await expect(
        service.create(
          {
            type: "expense",
            amount: 50000,
            categoryId: "cat_income_salary",
            transactionDate: "2026-05-26",
          },
          "hh_demo",
          mockOwnerSession
        )
      ).rejects.toThrow("Category is not for expense");
    });
  });

  describe("delete", () => {
    it("should soft delete existing transaction", async () => {
      vi.mocked(transactionRepository.findById).mockResolvedValue(mockTransactionDTO as any);
      vi.mocked(transactionRepository.softDelete).mockResolvedValue();

      await service.delete("trx_1", "hh_demo");

      expect(transactionRepository.softDelete).toHaveBeenCalledWith("trx_1", "hh_demo");
    });

    it("should throw if transaction not found", async () => {
      vi.mocked(transactionRepository.findById).mockResolvedValue(null);

      await expect(
        service.delete("non-existent", "hh_demo")
      ).rejects.toThrow("Transaction not found");
    });
  });
});
