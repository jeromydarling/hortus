import { describe, it, expect, vi } from "vitest";

// Mock import.meta.env
vi.stubEnv("VITE_SEEDS_NOW_AFFILIATE_TAG", "TEST_TAG");

const { seedsNowUrl } = await import("@/lib/seeds");

describe("seedsNowUrl", () => {
  it("constructs URL with affiliate tag", () => {
    const url = seedsNowUrl("/collections/pea-seeds");
    expect(url).toBe(
      "https://www.seedsnow.com/collections/pea-seeds?ref=TEST_TAG",
    );
  });

  it("handles root path", () => {
    const url = seedsNowUrl("");
    expect(url).toBe("https://www.seedsnow.com?ref=TEST_TAG");
  });

  it("preserves full collection paths", () => {
    const url = seedsNowUrl("/collections/vegetable-seeds");
    expect(url).toContain("vegetable-seeds");
    expect(url).toContain("ref=TEST_TAG");
  });
});
