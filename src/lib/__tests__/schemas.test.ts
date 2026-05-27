import { describe, it, expect } from "vitest";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  createBudgetSchema,
  createCategorySchema,
} from "@/lib/schemas";

describe("createTransactionSchema", () => {
  const validInput = {
    type: "expense",
    amount: 50000,
    categoryId: "550e8400-e29b-41d4-a716-446655440000",
    description: "Lunch",
    transactionDate: "2026-05-26",
  };

  it("should pass with valid expense input", () => {
    const result = createTransactionSchema.parse(validInput);
    expect(result.type).toBe("expense");
    expect(result.amount).toBe(50000);
  });

  it("should pass with valid income input", () => {
    const result = createTransactionSchema.parse({
      ...validInput,
      type: "income",
    });
    expect(result.type).toBe("income");
  });

  it("should pass without description", () => {
    const { description, ...input } = validInput;
    const result = createTransactionSchema.parse(input);
    expect(result.description).toBeUndefined();
  });

  it("should fail when type is invalid", () => {
    expect(() =>
      createTransactionSchema.parse({ ...validInput, type: "transfer" })
    ).toThrow();
  });

  it("should fail when amount is zero", () => {
    expect(() =>
      createTransactionSchema.parse({ ...validInput, amount: 0 })
    ).toThrow();
  });

  it("should fail when amount is negative", () => {
    expect(() =>
      createTransactionSchema.parse({ ...validInput, amount: -100 })
    ).toThrow();
  });

  it("should fail when categoryId is not UUID", () => {
    expect(() =>
      createTransactionSchema.parse({ ...validInput, categoryId: "not-uuid" })
    ).toThrow();
  });

  it("should fail when transactionDate is invalid", () => {
    expect(() =>
      createTransactionSchema.parse({ ...validInput, transactionDate: "not-a-date" })
    ).toThrow();
  });
});

describe("updateTransactionSchema", () => {
  it("should pass with partial update", () => {
    const result = updateTransactionSchema.parse({ amount: 75000 });
    expect(result.amount).toBe(75000);
  });

  it("should pass with empty object", () => {
    const result = updateTransactionSchema.parse({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("should fail when amount is negative", () => {
    expect(() =>
      updateTransactionSchema.parse({ amount: -100 })
    ).toThrow();
  });
});

describe("transactionQuerySchema", () => {
  it("should apply defaults", () => {
    const result = transactionQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("should parse query params", () => {
    const result = transactionQuerySchema.parse({
      page: "2",
      limit: "10",
      month: "5",
      year: "2026",
      type: "expense",
    });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.month).toBe(5);
    expect(result.year).toBe(2026);
    expect(result.type).toBe("expense");
  });

  it("should fail when month is out of range", () => {
    expect(() =>
      transactionQuerySchema.parse({ month: "13" })
    ).toThrow();
  });

  it("should fail when limit exceeds 100", () => {
    expect(() =>
      transactionQuerySchema.parse({ limit: "101" })
    ).toThrow();
  });
});

describe("createBudgetSchema", () => {
  it("should pass with valid input", () => {
    const result = createBudgetSchema.parse({
      categoryId: "550e8400-e29b-41d4-a716-446655440000",
      amount: 3000000,
      month: 5,
      year: 2026,
    });
    expect(result.amount).toBe(3000000);
  });

  it("should fail when amount is zero", () => {
    expect(() =>
      createBudgetSchema.parse({
        categoryId: "550e8400-e29b-41d4-a716-446655440000",
        amount: 0,
        month: 5,
        year: 2026,
      })
    ).toThrow();
  });

  it("should fail when month is out of range", () => {
    expect(() =>
      createBudgetSchema.parse({
        categoryId: "550e8400-e29b-41d4-a716-446655440000",
        amount: 3000000,
        month: 13,
        year: 2026,
      })
    ).toThrow();
  });
});

describe("createCategorySchema", () => {
  it("should pass with valid input", () => {
    const result = createCategorySchema.parse({
      name: "Pet",
      icon: "🐶",
      color: "#3B82F6",
      type: "expense",
    });
    expect(result.name).toBe("Pet");
  });

  it("should fail with invalid hex color", () => {
    expect(() =>
      createCategorySchema.parse({
        name: "Pet",
        icon: "🐶",
        color: "blue",
        type: "expense",
      })
    ).toThrow();
  });

  it("should fail with empty name", () => {
    expect(() =>
      createCategorySchema.parse({
        name: "",
        icon: "🐶",
        color: "#3B82F6",
        type: "expense",
      })
    ).toThrow();
  });
});
