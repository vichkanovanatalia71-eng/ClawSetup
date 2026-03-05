import { describe, it, expect } from "vitest";
import { slugify, formatCurrency, formatDate } from "../utils";

describe("slugify", () => {
  it("converts a string to a slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("handles special characters", () => {
    expect(slugify("GCP Project Setup!")).toBe("gcp-project-setup");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("--test--")).toBe("test");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats cents to dollars", () => {
    expect(formatCurrency(2900)).toBe("$29.00");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("formatDate", () => {
  it("formats a date", () => {
    const date = new Date("2026-03-05");
    const result = formatDate(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});
