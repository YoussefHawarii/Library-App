import { describe, expect, it } from "vitest";
import { loginSchema, sendOtpSchema, signUpSchema } from "./auth.schemas";

describe("loginSchema", () => {
  it("accepts a valid login", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "secret" }).success).toBe(true);
  });

  it("rejects a short password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "123" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "secret" }).success).toBe(false);
  });
});

describe("sendOtpSchema", () => {
  it("enforces the 3-15 char name range from the backend Joi schema", () => {
    expect(sendOtpSchema.safeParse({ name: "ab", email: "a@b.com" }).success).toBe(false);
    expect(sendOtpSchema.safeParse({ name: "a".repeat(16), email: "a@b.com" }).success).toBe(false);
    expect(sendOtpSchema.safeParse({ name: "abc", email: "a@b.com" }).success).toBe(true);
  });
});

describe("signUpSchema", () => {
  const base = {
    name: "Reader",
    email: "reader@example.com",
    password: "secret1",
    phone: "+1 555 0100",
    otp: "12345",
  };

  it("accepts a fully valid signup payload", () => {
    expect(signUpSchema.safeParse(base).success).toBe(true);
  });

  it("requires the otp to be exactly 5 characters", () => {
    expect(signUpSchema.safeParse({ ...base, otp: "1234" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...base, otp: "123456" }).success).toBe(false);
  });

  it("rejects letters in the phone field", () => {
    expect(signUpSchema.safeParse({ ...base, phone: "call-me-maybe" }).success).toBe(false);
  });
});
