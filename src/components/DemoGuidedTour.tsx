/**
 * DemoGuidedTour — Interactive walkthrough for demo mode.
 *
 * Uses react-joyride v3 to guide demo visitors through key features.
 * Tour steps use data-demo-section selectors on target elements.
 *
 * Lovable: Wire this into the demo layout and add data-demo-section
 * attributes to the corresponding screen elements.
 */

import { useState } from "react";
import { Joyride } from "react-joyride";

const STORAGE_KEY = "hortus-demo-tour-complete";

/**
 * Tour step content — NRI-voiced explanations for each screen.
 * Lovable: add data-demo-section attributes to target elements.
 */
export const TOUR_CONTENT = [
  {
    target: "[data-demo-section='home']",
    title: "Home — Your Garden at a Glance",
    content: "This is your garden's heartbeat. The current phase, today's weather, and your weekly rhythm — all in one place. NRI updates this every day based on your actual land data.",
  },
  {
    target: "[data-demo-section='phase-badge']",
    title: "Current Phase",
    content: "The Common Year replaces calendar months with eight place-aware phases. Right now you're in First Signs — the land is waking but frost risk remains.",
  },
  {
    target: "[data-demo-section='weather-card']",
    title: "Weather & Hazard State",
    content: "NRI watches the weather so you don't have to. When frost or storms threaten, it finds you.",
  },
  {
    target: "[data-demo-section='rule-of-life']",
    title: "The Rule of Life",
    content: "Five movements every week: Observe, Tend, Restrain, Receive, Record. Generated fresh each Monday from your phase, forecast, crops, and observations.",
  },
  {
    target: "[data-demo-section='nri-chat']",
    title: "NRI — Natural Resource Interpreter",
    content: "Ask it anything — soil questions, planting timing, pest identification, composting advice. It knows this specific place because it's read your land data. In demo mode you get 5 messages.",
  },
  {
    target: "[data-demo-section='loam-map']",
    title: "Loam Map — Your Ground, Interpreted",
    content: "Your soil data from NRCS SSURGO, translated into three languages: plain, gardener, and source. Toggle between them.",
  },
  {
    target: "[data-demo-section='planner']",
    title: "Garden Planner",
    content: "Your beds, crops, and materials in one place. NRI helps with timing based on your zone and frost dates.",
  },
  {
    target: "[data-demo-section='resilience-score']",
    title: "Food Resilience Score",
    content: "Your Food Resilience Score — 0 to 100 — measures how food-secure your garden makes you. Inspired by Strong Towns' Strength Test.",
  },
  {
    target: "[data-demo-section='seed-exchange']",
    title: "Seed Exchange",
    content: "Share seeds with your community. Over 90% of crop diversity has been lost — every seed shared fights that.",
  },
  {
    target: "[data-demo-section='food-map']",
    title: "Local Food System Map",
    content: "Every Hortus garden appears as a seed marker. Farmers markets, CSAs, seed libraries discovered automatically via Perplexity and USDA data.",
  },
];

interface DemoGuidedTourProps {
  isDemo: boolean;
}

export function DemoGuidedTour({ isDemo }: DemoGuidedTourProps) {
  const [run] = useState(() => {
    if (!isDemo) return false;
    return sessionStorage.getItem(STORAGE_KEY) !== "true";
  });

  if (!isDemo || !run) return null;

  return (
    <Joyride
      steps={TOUR_CONTENT}
      continuous
      run={run}
    />
  );
}
