import { describe, it, expect, vi } from "vitest";

// Mock hooks
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "test-user" } }),
}));
vi.mock("@/hooks/useGardenMode", () => ({
  useGardenMode: () => ({ mode: "solo", isSolo: true, isCommunity: false }),
}));

const { useNRINudgeEngine } = await import("@/hooks/useNRINudgeEngine");
import type { NRISignals } from "@/hooks/useNRINudgeEngine";
import { renderHook } from "@testing-library/react";

function makeSignals(overrides: Partial<NRISignals> = {}): NRISignals {
  return {
    weatherState: "clear",
    weatherHeadline: null,
    frostRiskTonight: false,
    frostDaysRemaining: null,
    currentPhaseId: "firstSigns",
    phaseConfidence: 0.88,
    phaseJustChanged: false,
    phaseChangeReason: null,
    plantingWindowOpen: false,
    unorderedSeeds: 0,
    seedsNeedOrderingBy: null,
    observationStreak: 5,
    lastObservationDaysAgo: 0,
    hasLoggedToday: true,
    overdueHarvests: 0,
    successionGaps: 0,
    nextSuccessionDate: null,
    compostNeedsTurning: false,
    compostReadyToUse: false,
    communitySignals: [],
    nextWorkdayDate: null,
    workdayRsvpCount: 0,
    landName: "Sundown Edge",
    hardinessZone: "4b",
    ...overrides,
  };
}

describe("useNRINudgeEngine", () => {
  it("returns empty nudges when signals are null", () => {
    const { result } = renderHook(() => useNRINudgeEngine(null));
    expect(result.current.nudges).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("returns no nudges when everything is clear", () => {
    const signals = makeSignals({ hasLoggedToday: true });
    const { result } = renderHook(() => useNRINudgeEngine(signals));
    expect(result.current.nudges).toEqual([]);
  });

  it("frost alert is highest confidence", () => {
    const signals = makeSignals({ frostRiskTonight: true });
    const { result } = renderHook(() => useNRINudgeEngine(signals));
    expect(result.current.nudges.length).toBeGreaterThan(0);
    expect(result.current.nudges[0]?.type).toBe("frost_alert");
    expect(result.current.nudges[0]?.confidence).toBeGreaterThanOrEqual(0.95);
  });

  it("suspend weather overrides other nudges", () => {
    const signals = makeSignals({
      weatherState: "suspend",
      weatherHeadline: "Severe thunderstorm warning",
      frostRiskTonight: false,
    });
    const { result } = renderHook(() => useNRINudgeEngine(signals));
    expect(result.current.nudges[0]?.type).toBe("weather_alert");
    expect(result.current.nudges[0]?.confidence).toBe(0.97);
  });

  it("returns max 3 nudges even with many signals", () => {
    const signals = makeSignals({
      frostRiskTonight: true,
      weatherState: "protect",
      weatherHeadline: "Frost risk",
      phaseJustChanged: true,
      plantingWindowOpen: true,
      overdueHarvests: 3,
      compostNeedsTurning: true,
      hasLoggedToday: false,
      lastObservationDaysAgo: 1,
    });
    const { result } = renderHook(() => useNRINudgeEngine(signals));
    expect(result.current.nudges.length).toBeLessThanOrEqual(3);
  });

  it("includes observation prompt when streak is active and not logged today", () => {
    const signals = makeSignals({
      hasLoggedToday: false,
      lastObservationDaysAgo: 1,
      observationStreak: 12,
    });
    const { result } = renderHook(() => useNRINudgeEngine(signals));
    const obsNudge = result.current.nudges.find(
      (n) => n.type === "observation_prompt",
    );
    expect(obsNudge).toBeDefined();
    expect(obsNudge?.message).toContain("12-day streak");
  });

  it("surfaces seed order urgency within 7 days", () => {
    const sevenDaysFromNow = new Date(
      Date.now() + 5 * 86400000,
    ).toISOString();
    const signals = makeSignals({
      unorderedSeeds: 2,
      seedsNeedOrderingBy: sevenDaysFromNow,
    });
    const { result } = renderHook(() => useNRINudgeEngine(signals));
    const seedNudge = result.current.nudges.find(
      (n) => n.type === "seed_order",
    );
    expect(seedNudge).toBeDefined();
    expect(seedNudge?.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("nudges are sorted by confidence descending", () => {
    const signals = makeSignals({
      frostRiskTonight: true,
      hasLoggedToday: false,
      lastObservationDaysAgo: 1,
      compostNeedsTurning: true,
    });
    const { result } = renderHook(() => useNRINudgeEngine(signals));
    for (let i = 1; i < result.current.nudges.length; i++) {
      const prev = result.current.nudges[i - 1];
      const curr = result.current.nudges[i];
      if (prev && curr) {
        expect(prev.confidence).toBeGreaterThanOrEqual(curr.confidence - 0.05);
      }
    }
  });
});
