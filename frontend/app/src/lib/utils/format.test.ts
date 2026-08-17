import { describe, expect, it } from "vitest";
import { formatDate, isOverdue } from "./format";

describe("formatDate", () => {
  it("returns an em dash for missing values", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });

  it("formats a valid ISO date", () => {
    expect(formatDate("2024-01-15T00:00:00.000Z")).toMatch(/2024/);
  });
});

describe("isOverdue", () => {
  it("is false once returned, regardless of due date", () => {
    expect(isOverdue("2000-01-01T00:00:00.000Z", "2024-01-01T00:00:00.000Z")).toBe(false);
  });

  it("is true for a past due date with no return", () => {
    expect(isOverdue("2000-01-01T00:00:00.000Z", null)).toBe(true);
  });

  it("is false for a future due date with no return", () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    expect(isOverdue(future, null)).toBe(false);
  });
});
