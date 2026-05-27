import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("Password Utilities", () => {
  const password = "securePass1";

  describe("hashPassword", () => {
    it("should generate a hash string", async () => {
      const hash = await hashPassword(password);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(password);
    });

    it("should generate different hashes for same password", async () => {
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2); // bcrypt uses unique salt each time
    });

    it("should generate consistent length hash", async () => {
      const hash = await hashPassword(password);
      expect(hash.length).toBe(60); // bcrypt hash is always 60 chars
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const hash = await hashPassword(password);
      const valid = await verifyPassword(password, hash);
      expect(valid).toBe(true);
    });

    it("should reject wrong password", async () => {
      const hash = await hashPassword(password);
      const valid = await verifyPassword("wrongPassword", hash);
      expect(valid).toBe(false);
    });

    it("should reject empty password", async () => {
      const hash = await hashPassword(password);
      const valid = await verifyPassword("", hash);
      expect(valid).toBe(false);
    });

    it("should be case sensitive", async () => {
      const hash = await hashPassword(password);
      const valid = await verifyPassword("SECUREPASS1", hash);
      expect(valid).toBe(false);
    });
  });
});
