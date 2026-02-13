/**
 * Tests for AES-256-GCM encryption/decryption in crypto.ts.
 * Validates round-trip encryption, different inputs, and error handling.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { encrypt, decrypt } from "@/lib/crypto";

beforeAll(() => {
  // Set a valid 32-byte hex key for testing
  process.env.CREDENTIALS_ENCRYPTION_KEY =
    "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2";
});

describe("crypto", () => {
  it("should encrypt and decrypt a simple string", () => {
    const plaintext = "my-secret-password";
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("should produce different ciphertext for the same input (random IV)", () => {
    const plaintext = "same-input";
    const encrypted1 = encrypt(plaintext);
    const encrypted2 = encrypt(plaintext);
    expect(encrypted1).not.toBe(encrypted2);
  });

  it("should handle empty string", () => {
    const plaintext = "";
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("should handle unicode characters", () => {
    const plaintext = "p@$$wörd! 日本語 🔑";
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("should handle long strings", () => {
    const plaintext = "x".repeat(10000);
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("should produce format iv:authTag:ciphertext", () => {
    const encrypted = encrypt("test");
    const parts = encrypted.split(":");
    expect(parts).toHaveLength(3);
    // Each part should be valid base64
    for (const part of parts) {
      expect(() => Buffer.from(part, "base64")).not.toThrow();
    }
  });

  it("should throw on invalid encrypted string format", () => {
    expect(() => decrypt("not-a-valid-encrypted-string")).toThrow(
      "Invalid encrypted string format"
    );
  });

  it("should throw on tampered ciphertext", () => {
    const encrypted = encrypt("secret");
    const parts = encrypted.split(":");
    // Tamper with the ciphertext
    parts[2] = Buffer.from("tampered-data").toString("base64");
    const tampered = parts.join(":");
    expect(() => decrypt(tampered)).toThrow();
  });

  it("should throw when encryption key is missing", () => {
    const originalKey = process.env.CREDENTIALS_ENCRYPTION_KEY;
    delete process.env.CREDENTIALS_ENCRYPTION_KEY;
    expect(() => encrypt("test")).toThrow("CREDENTIALS_ENCRYPTION_KEY environment variable is not set");
    process.env.CREDENTIALS_ENCRYPTION_KEY = originalKey;
  });

  it("should throw when encryption key is wrong length", () => {
    const originalKey = process.env.CREDENTIALS_ENCRYPTION_KEY;
    process.env.CREDENTIALS_ENCRYPTION_KEY = "abcd"; // Too short
    expect(() => encrypt("test")).toThrow("must be exactly 32 bytes");
    process.env.CREDENTIALS_ENCRYPTION_KEY = originalKey;
  });
});
