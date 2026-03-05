import { describe, it, expect } from "vitest";
import { rateLimit } from "../rate-limit";

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const key = `test-${Date.now()}`;
    const result = rateLimit(key, 3, 10000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests over limit", () => {
    const key = `test-block-${Date.now()}`;
    rateLimit(key, 2, 10000);
    rateLimit(key, 2, 10000);
    const result = rateLimit(key, 2, 10000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks remaining correctly", () => {
    const key = `test-remain-${Date.now()}`;
    const r1 = rateLimit(key, 5, 10000);
    expect(r1.remaining).toBe(4);
    const r2 = rateLimit(key, 5, 10000);
    expect(r2.remaining).toBe(3);
  });
});
