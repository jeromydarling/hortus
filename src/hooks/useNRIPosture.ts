/**
 * useNRIPosture — Infers NRI's current conversational posture.
 *
 * Ported from thecros useCompassPosture pattern.
 *
 * WHAT: Derives one of five postures from the current route and
 *       recent user actions. NRI adapts its voice accordingly.
 * WHERE: NRI chat drawer header, compass button glow logic.
 * WHY: NRI should feel context-aware — when you're looking at weather,
 *       it leads with weather. When you're logging, it leads with
 *       encouragement. No gamification — just legible orientation.
 */

import { useMemo } from "react";

export type NRIPosture =
  | "land_reading"    // Observing the ground — Loam Map, Weather, Phenology
  | "action"          // Doing the work — Planner, Succession, Harvest, Compost
  | "reflection"      // Memory and meaning — Logs, Common Year, Philosophy
  | "community_care"  // Tending relationships — People, Workdays, Messages
  | "stewardship";    // Long-term view — Resilience, Impact, Seed Exchange, Garden-Ready

export const POSTURE_LABELS: Record<NRIPosture, string> = {
  land_reading: "Reading the land",
  action: "Tending the garden",
  reflection: "Remembering and reflecting",
  community_care: "Caring for community",
  stewardship: "Building resilience",
};

/** NRI opening line varies by posture */
export const POSTURE_OPENINGS: Record<NRIPosture, string> = {
  land_reading: "I see you're reading the ground. What would you like to understand?",
  action: "You're in the work. What needs attention?",
  reflection: "This is the remembering. What has the garden taught you?",
  community_care: "The community is the garden too. Who needs tending?",
  stewardship: "Building something that lasts. What are you thinking about?",
};

const LAND_READING_ROUTES = [
  "/app/land", "/app/weather", "/app/phenology", "/app/food-map",
];

const ACTION_ROUTES = [
  "/app/planner", "/app/succession", "/app/harvest", "/app/compost",
  "/app/source", "/app/offline", "/app/garden-ready",
];

const REFLECTION_ROUTES = [
  "/app/logs", "/app/commonyear", "/app/philosophy", "/app/home",
];

const COMMUNITY_ROUTES = [
  "/app/community/people", "/app/community/workdays",
  "/app/community/map", "/app/community/sharing",
  "/app/community/messages", "/app/community/hours",
];

const STEWARDSHIP_ROUTES = [
  "/app/resilience", "/app/yield", "/app/impact",
  "/app/seed-exchange",
];

export function useNRIPosture(pathname: string): {
  posture: NRIPosture;
  label: string;
  opening: string;
} {
  const posture = useMemo<NRIPosture>(() => {
    if (LAND_READING_ROUTES.some((r) => pathname.startsWith(r)))
      return "land_reading";
    if (ACTION_ROUTES.some((r) => pathname.startsWith(r))) return "action";
    if (COMMUNITY_ROUTES.some((r) => pathname.startsWith(r)))
      return "community_care";
    if (STEWARDSHIP_ROUTES.some((r) => pathname.startsWith(r)))
      return "stewardship";
    if (REFLECTION_ROUTES.some((r) => pathname.startsWith(r)))
      return "reflection";

    // Default — reflection (gentle, welcoming)
    return "reflection";
  }, [pathname]);

  return {
    posture,
    label: POSTURE_LABELS[posture],
    opening: POSTURE_OPENINGS[posture],
  };
}
