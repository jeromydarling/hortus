import { describe, it, expect } from "vitest";
import {
  computeResilienceScore,
  estimateGroceryValue,
  estimateDaysOfFood,
  type ResilienceMetrics,
} from "@/services/resilience";

describe("computeResilienceScore", () => {
  it("returns 0 for empty metrics", () => {
    const metrics: ResilienceMetrics = {
      lbsProduced: 0,
      sqftCultivated: 0,
      varietiesGrown: 0,
      daysOfFood: 0,
      groceryValueSaved: 0,
      seedVarietiesSaved: 0,
      compostProducedGallons: 0,
      localSpendPct: 0,
      cropsShared: 0,
    };
    expect(computeResilienceScore(metrics)).toBe(0);
  });

  it("returns 100 for maxed-out metrics", () => {
    const metrics: ResilienceMetrics = {
      lbsProduced: 500,
      sqftCultivated: 400,
      varietiesGrown: 30,
      daysOfFood: 60,
      groceryValueSaved: 1000,
      seedVarietiesSaved: 10,
      compostProducedGallons: 100,
      localSpendPct: 100,
      cropsShared: 20,
    };
    expect(computeResilienceScore(metrics)).toBe(100);
  });

  it("returns a mid-range score for moderate metrics", () => {
    const metrics: ResilienceMetrics = {
      lbsProduced: 67,
      sqftCultivated: 64,
      varietiesGrown: 8,
      daysOfFood: 11,
      groceryValueSaved: 218,
      seedVarietiesSaved: 2,
      compostProducedGallons: 15,
      localSpendPct: 65,
      cropsShared: 4,
    };
    const score = computeResilienceScore(metrics);
    expect(score).toBeGreaterThan(30);
    expect(score).toBeLessThan(60);
  });

  it("caps individual dimensions at 1.0", () => {
    const metrics: ResilienceMetrics = {
      lbsProduced: 9999, // way over max
      sqftCultivated: 0,
      varietiesGrown: 0,
      daysOfFood: 0,
      groceryValueSaved: 0,
      seedVarietiesSaved: 0,
      compostProducedGallons: 0,
      localSpendPct: 0,
      cropsShared: 0,
    };
    // Should only get the lbsProduced weight (15), not more
    expect(computeResilienceScore(metrics)).toBe(15);
  });
});

describe("estimateGroceryValue", () => {
  it("estimates tomato value correctly", () => {
    expect(estimateGroceryValue("Tomatoes (Brandywine)", 10)).toBe(30);
  });

  it("uses default price for unknown crops", () => {
    expect(estimateGroceryValue("Dragon Fruit", 5)).toBe(15); // $3/lb default
  });

  it("estimates basil as expensive (herb pricing)", () => {
    expect(estimateGroceryValue("Basil", 2)).toBe(40); // $20/lb for herbs
  });
});

describe("estimateDaysOfFood", () => {
  it("estimates days for household of 2", () => {
    expect(estimateDaysOfFood(30, 2)).toBe(10); // 30 / (1.5 * 2) = 10
  });

  it("estimates days for household of 4", () => {
    expect(estimateDaysOfFood(60, 4)).toBe(10); // 60 / (1.5 * 4) = 10
  });

  it("returns 0 for no production", () => {
    expect(estimateDaysOfFood(0, 2)).toBe(0);
  });

  it("defaults to household of 2", () => {
    expect(estimateDaysOfFood(30)).toBe(10);
  });
});
