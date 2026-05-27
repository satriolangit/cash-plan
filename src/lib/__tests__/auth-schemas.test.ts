import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/schemas";

describe("registerSchema", () => {
  const valid = {
    name: "John Doe",
    email: "john@example.com",
    password: "securePass1",
  };

  it("should pass with valid input", () => {
    const result = registerSchema.parse(valid);
    expect(result.name).toBe("John Doe");
  });

  it("should fail with empty name", () => {
    expect(() => registerSchema.parse({ ...valid, name: "" })).toThrow();
  });

  it("should fail with invalid email", () => {
    expect(() => registerSchema.parse({ ...valid, email: "not-email" })).toThrow();
  });

  it("should fail with short password (< 8 chars)", () => {
    expect(() => registerSchema.parse({ ...valid, password: "Ab1" })).toThrow();
  });

  it("should fail with password without letters", () => {
    expect(() => registerSchema.parse({ ...valid, password: "12345678" })).toThrow();
  });

  it("should fail with password without numbers", () => {
    expect(() => registerSchema.parse({ ...valid, password: "abcdefgh" })).toThrow();
  });

  it("should pass with exactly 8 char valid password", () => {
    const result = registerSchema.parse({ ...valid, password: "pass1234" });
    expect(result.password).toBe("pass1234");
  });
});

describe("loginSchema", () => {
  const valid = { email: "john@example.com", password: "secret" };

  it("should pass with valid input", () => {
    const result = loginSchema.parse(valid);
    expect(result.email).toBe("john@example.com");
  });

  it("should fail with empty email", () => {
    expect(() => loginSchema.parse({ ...valid, email: "" })).toThrow();
  });

  it("should fail with invalid email", () => {
    expect(() => loginSchema.parse({ ...valid, email: "bad" })).toThrow();
  });

  it("should fail with empty password", () => {
    expect(() => loginSchema.parse({ ...valid, password: "" })).toThrow();
  });
});

describe("forgotPasswordSchema", () => {
  it("should pass with valid email", () => {
    const result = forgotPasswordSchema.parse({ email: "john@example.com" });
    expect(result.email).toBe("john@example.com");
  });

  it("should fail with invalid email", () => {
    expect(() => forgotPasswordSchema.parse({ email: "invalid" })).toThrow();
  });
});

describe("resetPasswordSchema", () => {
  const valid = { token: "abc123def456", password: "newPass1" };

  it("should pass with valid input", () => {
    const result = resetPasswordSchema.parse(valid);
    expect(result.token).toBe("abc123def456");
  });

  it("should fail with empty token", () => {
    expect(() => resetPasswordSchema.parse({ ...valid, token: "" })).toThrow();
  });

  it("should fail with short password", () => {
    expect(() => resetPasswordSchema.parse({ ...valid, password: "Ab1" })).toThrow();
  });

  it("should fail with password without numbers", () => {
    expect(() => resetPasswordSchema.parse({ ...valid, password: "abcdefgh" })).toThrow();
  });
});
