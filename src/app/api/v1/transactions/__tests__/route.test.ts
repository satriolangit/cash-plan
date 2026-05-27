import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { transactionRepository } from "@/features/transactions/transaction.repository";
import { mockTransaction, mockTransactionDTO, mockCategory } from "@test/factories";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => ({
    user: {
      id: "usr_owner",
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "owner",
      householdId: "hh_demo",
    },
  })),
}));

describe("Transaction Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return transactions with pagination", async () => {
      vi.mocked(prisma.transaction.findMany).mockResolvedValue([
        {
          ...mockTransaction,
          category: mockCategory,
          user: { id: "usr_owner", name: "Budi", avatarUrl: null },
        } as any,
      ]);
      vi.mocked(prisma.transaction.count).mockResolvedValue(1);

      const result = await transactionRepository.findAll("hh_demo", {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it("should filter by type", async () => {
      vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
      vi.mocked(prisma.transaction.count).mockResolvedValue(0);

      await transactionRepository.findAll("hh_demo", {
        type: "expense",
      });

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: "expense",
          }),
        })
      );
    });

    it("should filter by month and year", async () => {
      vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
      vi.mocked(prisma.transaction.count).mockResolvedValue(0);

      await transactionRepository.findAll("hh_demo", {
        month: 5,
        year: 2026,
      });

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            transactionDate: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it("should exclude soft-deleted records", async () => {
      vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
      vi.mocked(prisma.transaction.count).mockResolvedValue(0);

      await transactionRepository.findAll("hh_demo", {});

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        })
      );
    });
  });

  describe("softDelete", () => {
    it("should set deletedAt timestamp", async () => {
      vi.mocked(prisma.transaction.updateMany).mockResolvedValue({ count: 1 } as any);

      await transactionRepository.softDelete("trx_1", "hh_demo");

      expect(prisma.transaction.updateMany).toHaveBeenCalledWith({
        where: { id: "trx_1", householdId: "hh_demo", deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe("getTotalByType", () => {
    it("should return total amount for type", async () => {
      vi.mocked(prisma.transaction.aggregate).mockResolvedValue({
        _sum: { amount: 1500000 },
      } as any);

      const total = await transactionRepository.getTotalByType(
        "hh_demo",
        "expense",
        5,
        2026
      );

      expect(total).toBe(1500000);
    });

    it("should return 0 when no transactions", async () => {
      vi.mocked(prisma.transaction.aggregate).mockResolvedValue({
        _sum: { amount: null },
      } as any);

      const total = await transactionRepository.getTotalByType(
        "hh_demo",
        "expense",
        5,
        2026
      );

      expect(total).toBe(0);
    });
  });
});
