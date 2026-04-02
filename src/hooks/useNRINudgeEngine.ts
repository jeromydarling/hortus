/**
 * useNRINudgeEngine — Unified nudge evaluation engine for NRI.
 *
 * Ported from thecros useCompassSessionEngine pattern.
 *
 * WHAT: Aggregates weather alerts, phase transitions, planting windows,
 *       observation streaks, community signals, and seasonal prompts into
 *       sorted NRINudge items with confidence scores.
 * WHERE: NRI compass drawer "Today's Movement" section + home screen.
 * WHY: Single interpretive surface — NRI proactively surfaces the 1-3
 *       most important things, ranked by urgency and relevance.
 */

import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { useGardenMode } from "./useGardenMode";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Maps to the Rule of Life movements */
export type NudgeDirection =
  | "observe"
  | "tend"
  | "restrain"
  | "receive"
  | "record";

export type NudgeType =
  | "phase_signal"
  | "weather_alert"
  | "planting_window"
  | "frost_alert"
  | "observation_prompt"
  | "community_signal"
  | "harvest_reminder"
  | "seed_order"
  | "succession_gap"
  | "compost_check"
  | "reflection"
  | "knowledge";

export interface NRINudge {
  id: string;
  direction: NudgeDirection;
  type: NudgeType;
  confidence: number; // 0-1, drives sort order
  message: string; // NRI-voiced
  optional_action?: {
    label: string;
    route?: string;
  };
}

const DIRECTION_WEIGHT: Record<NudgeDirection, number> = {
  tend: 5, // Active care — highest priority
  restrain: 4, // Warnings — frost, weather
  observe: 3, // Watchfulness
  record: 2, // Logging prompts
  receive: 1, // Gratitude, celebration
};

// ---------------------------------------------------------------------------
// Signal interfaces (populated from Supabase queries in production)
// ---------------------------------------------------------------------------

export interface NRISignals {
  // Weather & hazard
  weatherState: "clear" | "caution" | "delay" | "protect" | "suspend";
  weatherHeadline: string | null;
  frostRiskTonight: boolean;
  frostDaysRemaining: number | null;

  // Phase
  currentPhaseId: string;
  phaseConfidence: number;
  phaseJustChanged: boolean;
  phaseChangeReason: string | null;

  // Planting
  plantingWindowOpen: boolean;
  unorderedSeeds: number;
  seedsNeedOrderingBy: string | null; // ISO date

  // Observations
  observationStreak: number;
  lastObservationDaysAgo: number;
  hasLoggedToday: boolean;

  // Harvest & succession
  overdueHarvests: number;
  successionGaps: number;
  nextSuccessionDate: string | null;

  // Compost
  compostNeedsTurning: boolean;
  compostReadyToUse: boolean;

  // Community (only if garden_mode === 'community')
  communitySignals: Array<{
    personId: string;
    personName: string;
    type: "checkin" | "overwhelm" | "mentor_candidate" | "ready_for_more";
    reason: string;
  }>;
  nextWorkdayDate: string | null;
  workdayRsvpCount: number;

  // Land
  landName: string;
  hardinessZone: string;
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export function useNRINudgeEngine(signals: NRISignals | null): {
  nudges: NRINudge[];
  isLoading: boolean;
} {
  const { user } = useAuth();
  const { isCommunity } = useGardenMode();

  const nudges = useMemo<NRINudge[]>(() => {
    if (!signals || !user) return [];

    const results: NRINudge[] = [];
    const land = signals.landName || "your garden";

    // ---------------------------------------------------------------
    // P0 — Safety: Frost & severe weather (always highest)
    // ---------------------------------------------------------------

    if (signals.frostRiskTonight) {
      results.push({
        id: "frost-tonight",
        direction: "restrain",
        type: "frost_alert",
        confidence: 0.98,
        message: `Frost tonight at ${land}. Cover tender transplants before dusk.`,
        optional_action: { label: "View weather", route: "/app/weather" },
      });
    }

    if (signals.weatherState === "suspend") {
      results.push({
        id: "weather-suspend",
        direction: "restrain",
        type: "weather_alert",
        confidence: 0.97,
        message: `${signals.weatherHeadline ?? "Severe weather"} near ${land}. Stay out of the garden.`,
        optional_action: { label: "View weather", route: "/app/weather" },
      });
    } else if (signals.weatherState === "protect") {
      results.push({
        id: "weather-protect",
        direction: "restrain",
        type: "weather_alert",
        confidence: 0.90,
        message: `${signals.weatherHeadline ?? "Weather risk"} at ${land}. Protect what's vulnerable.`,
        optional_action: { label: "View weather", route: "/app/weather" },
      });
    } else if (signals.weatherState === "caution") {
      results.push({
        id: "weather-caution",
        direction: "observe",
        type: "weather_alert",
        confidence: 0.65,
        message: `Conditions at ${land} are tricky today. Read the weather before heading out.`,
        optional_action: { label: "View weather", route: "/app/weather" },
      });
    }

    // ---------------------------------------------------------------
    // P1 — Phase transitions & planting windows
    // ---------------------------------------------------------------

    if (signals.phaseJustChanged) {
      results.push({
        id: "phase-transition",
        direction: "observe",
        type: "phase_signal",
        confidence: Math.min(0.95, signals.phaseConfidence),
        message:
          signals.phaseChangeReason ??
          `${land} has moved into a new phase. The rhythm is shifting.`,
        optional_action: {
          label: "View Common Year",
          route: "/app/commonyear",
        },
      });
    }

    if (signals.plantingWindowOpen) {
      results.push({
        id: "planting-window",
        direction: "tend",
        type: "planting_window",
        confidence: 0.88,
        message: `The frost window looks clear at ${land}. Your planting window has opened.`,
        optional_action: { label: "View planner", route: "/app/planner" },
      });
    }

    // ---------------------------------------------------------------
    // P1 — Seed ordering urgency
    // ---------------------------------------------------------------

    if (signals.unorderedSeeds > 0 && signals.seedsNeedOrderingBy) {
      const daysUntil = Math.ceil(
        (new Date(signals.seedsNeedOrderingBy).getTime() - Date.now()) /
          86400000,
      );
      if (daysUntil <= 14) {
        results.push({
          id: "seed-order-urgent",
          direction: "tend",
          type: "seed_order",
          confidence: daysUntil <= 7 ? 0.85 : 0.70,
          message: `${signals.unorderedSeeds} seed${signals.unorderedSeeds > 1 ? "s" : ""} not ordered yet — plant-by date is ${daysUntil <= 7 ? "this week" : "in two weeks"}.`,
          optional_action: { label: "View seed list", route: "/app/source" },
        });
      }
    }

    // ---------------------------------------------------------------
    // P2 — Observation streak & daily nudge
    // ---------------------------------------------------------------

    if (!signals.hasLoggedToday && signals.lastObservationDaysAgo <= 2) {
      // Active streak, hasn't logged yet today
      results.push({
        id: "observation-streak",
        direction: "record",
        type: "observation_prompt",
        confidence: 0.45,
        message:
          signals.observationStreak > 7
            ? `${signals.observationStreak}-day streak at ${land}. One note keeps it alive.`
            : `${land} is out there. One thing you noticed today is enough.`,
        optional_action: { label: "Quick log", route: "/app/logs" },
      });
    } else if (signals.lastObservationDaysAgo > 5) {
      // Lapsed — gentle re-engagement
      results.push({
        id: "observation-lapsed",
        direction: "record",
        type: "observation_prompt",
        confidence: 0.35,
        message: `It's been ${signals.lastObservationDaysAgo} days since your last note. The garden changes fast — what's different?`,
        optional_action: { label: "Add observation", route: "/app/logs" },
      });
    }

    // ---------------------------------------------------------------
    // P2 — Harvest & succession
    // ---------------------------------------------------------------

    if (signals.overdueHarvests > 0) {
      results.push({
        id: "harvest-overdue",
        direction: "tend",
        type: "harvest_reminder",
        confidence: 0.60,
        message: `${signals.overdueHarvests} crop${signals.overdueHarvests > 1 ? "s" : ""} past peak harvest window. Pick before it bolts.`,
        optional_action: { label: "View harvest", route: "/app/harvest" },
      });
    }

    if (signals.successionGaps > 0) {
      results.push({
        id: "succession-gap",
        direction: "tend",
        type: "succession_gap",
        confidence: 0.55,
        message: `A bed will be empty soon. Bush beans can fill a 60-day gap with no fuss.`,
        optional_action: {
          label: "View succession",
          route: "/app/succession",
        },
      });
    }

    // ---------------------------------------------------------------
    // P2 — Compost
    // ---------------------------------------------------------------

    if (signals.compostNeedsTurning) {
      results.push({
        id: "compost-turn",
        direction: "tend",
        type: "compost_check",
        confidence: 0.50,
        message: `Your compost pile is due for a turn. Five minutes with a fork keeps things cooking.`,
        optional_action: { label: "View compost", route: "/app/compost" },
      });
    }

    if (signals.compostReadyToUse) {
      results.push({
        id: "compost-ready",
        direction: "receive",
        type: "compost_check",
        confidence: 0.55,
        message: `Compost is ready. Apply it — your beds will thank you.`,
        optional_action: { label: "View compost", route: "/app/compost" },
      });
    }

    // ---------------------------------------------------------------
    // P2 — Community signals (community mode only)
    // ---------------------------------------------------------------

    if (isCommunity && signals.communitySignals.length > 0) {
      const topSignal = signals.communitySignals[0];
      if (topSignal) {
        results.push({
          id: `community-${topSignal.personId}`,
          direction: topSignal.type === "checkin" ? "observe" : "receive",
          type: "community_signal",
          confidence:
            topSignal.type === "checkin"
              ? 0.60
              : topSignal.type === "mentor_candidate"
                ? 0.50
                : 0.45,
          message: topSignal.reason,
          optional_action: {
            label: "View people",
            route: "/app/community/people",
          },
        });
      }
    }

    if (isCommunity && signals.nextWorkdayDate) {
      const daysUntil = Math.ceil(
        (new Date(signals.nextWorkdayDate).getTime() - Date.now()) / 86400000,
      );
      if (daysUntil <= 2 && daysUntil >= 0) {
        results.push({
          id: "workday-soon",
          direction: "tend",
          type: "community_signal",
          confidence: 0.70,
          message:
            daysUntil === 0
              ? `Workday today at ${land}. ${signals.workdayRsvpCount} attending.`
              : `Workday ${daysUntil === 1 ? "tomorrow" : "in 2 days"} at ${land}. ${signals.workdayRsvpCount} RSVPed.`,
          optional_action: {
            label: "View workday",
            route: "/app/community/workdays",
          },
        });
      }
    }

    // ---------------------------------------------------------------
    // P3 — Frost countdown milestones
    // ---------------------------------------------------------------

    if (
      signals.frostDaysRemaining !== null &&
      [14, 7, 3, 1].includes(signals.frostDaysRemaining)
    ) {
      const msgs: Record<number, string> = {
        14: `Two weeks to frost-free at ${land}. Time to harden off transplants.`,
        7: `One week. Frost risk drops near zero after the window closes.`,
        3: `Three days. Your warm crops can go out if the forecast holds.`,
        1: `Tomorrow is your frost-free date at ${land}. Check the hourly forecast tonight.`,
      };
      results.push({
        id: `frost-countdown-${signals.frostDaysRemaining}`,
        direction: "observe",
        type: "frost_alert",
        confidence: signals.frostDaysRemaining <= 3 ? 0.80 : 0.65,
        message: msgs[signals.frostDaysRemaining] ?? "",
        optional_action: { label: "View weather", route: "/app/weather" },
      });
    }

    // ---------------------------------------------------------------
    // Sort: confidence DESC → direction weight DESC → id stable
    // ---------------------------------------------------------------

    results.sort((a, b) => {
      const confDiff = b.confidence - a.confidence;
      if (Math.abs(confDiff) > 0.05) return confDiff;
      const weightDiff =
        DIRECTION_WEIGHT[b.direction] - DIRECTION_WEIGHT[a.direction];
      if (weightDiff !== 0) return weightDiff;
      return a.id.localeCompare(b.id);
    });

    // Max 3 nudges — never overwhelm
    return results.slice(0, 3);
  }, [signals, user, isCommunity]);

  return { nudges, isLoading: !signals };
}
