import { describe, it, expect, vi, beforeEach } from "vitest";
import { CategoryService } from "../category.service";
import { categoryRepository } from "../category.repository";
import { mockCategory } from "@test/factories";

vi.mock("../category.repository", () => ({
  categoryRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
}));

describe("CategoryService", () => {
  let service: CategoryService;

  beforeEach(() => {
    service = new CategoryService();
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return all categories", async () => {
      vi.mocked(categoryRepository.findAll).mockResolvedValue([mockCategory as any]);

      const result = await service.list("hh_demo");

      expect(result).toHaveLength(1);
      expect(categoryRepository.findAll).toHaveBeenCalledWith("hh_demo", undefined);
    });

    it("should filter by type", async () => {
      vi.mocked(categoryRepository.findAll).mockResolvedValue([mockCategory as any]);

      await service.list("hh_demo", "expense");

      expect(categoryRepository.findAll).toHaveBeenCalledWith("hh_demo", "expense");
    });
  });

  describe("create", () => {
    it("should create category", async () => {
      vi.mocked(categoryRepository.create).mockResolvedValue(mockCategory as any);

      const result = await service.create(
        { name: "Pet", icon: "🐶", color: "#3B82F6", type: "expense" },
        "hh_demo"
      );

      expect(result.name).toBe("Food & Drink");
      expect(categoryRepository.create).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should soft delete existing category", async () => {
      vi.mocked(categoryRepository.findById).mockResolvedValue(mockCategory as any);
      vi.mocked(categoryRepository.softDelete).mockResolvedValue();

      await service.delete("cat_expense_food", "hh_demo");

      expect(categoryRepository.softDelete).toHaveBeenCalledWith("cat_expense_food", "hh_demo");
    });

    it("should throw if category not found", async () => {
      vi.mocked(categoryRepository.findById).mockResolvedValue(null);

      await expect(
        service.delete("non-existent", "hh_demo")
      ).rejects.toThrow("Category not found");
    });
  });
});
