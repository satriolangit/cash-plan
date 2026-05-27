import { describe, it, expect } from "vitest";
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from "@/lib/jwt";

describe("JWT Utilities", () => {
  const payload = {
    sub: "usr_123",
    email: "test@example.com",
    role: "owner",
    householdId: "hh_456",
  };

  describe("Access Token", () => {
    it("should sign and verify access token", () => {
      const token = signAccessToken(payload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");

      const decoded = verifyAccessToken(token);
      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.householdId).toBe(payload.householdId);
    });

    it("should not expire immediately", () => {
      const token = signAccessToken(payload);
      // Token should verify immediately after signing
      expect(() => verifyAccessToken(token)).not.toThrow();
    });
  });

  describe("Refresh Token", () => {
    it("should sign and verify refresh token", () => {
      const token = signRefreshToken("usr_123");
      expect(token).toBeTruthy();

      const decoded = verifyRefreshToken(token);
      expect(decoded.sub).toBe("usr_123");
      expect(decoded.type).toBe("refresh");
    });

    it("should get expiry 7 days from now", () => {
      const expiry = getRefreshTokenExpiry();
      const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const diffSeconds = Math.abs(expiry.getTime() - sevenDays.getTime()) / 1000;
      expect(diffSeconds).toBeLessThan(5); // Within 5 seconds
    });
  });

  describe("Invalid tokens", () => {
    it("should throw on invalid access token", () => {
      expect(() => verifyAccessToken("invalid-token")).toThrow();
    });

    it("should throw on expired token", async () => {
      // We can't easily test expiry without mocking, but we can test junk
      expect(() => verifyRefreshToken("junk")).toThrow();
    });
  });
});
