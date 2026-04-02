/**
 * useNRIGuide — First-visit contextual guide powered by NRI.
 *
 * Ported from thecros useCompassGuide pattern.
 *
 * WHAT: For the first 3 days after signup, NRI auto-opens and explains
 *       each new section the user visits for the first time.
 * WHERE: NRI compass drawer — shows a guide card before chat.
 * WHY: New users feel overwhelmed. NRI should explain what they're
 *       looking at in gentle, gardening language — not a feature tour.
 */

import { useEffect, useRef, useMemo } from "react";

export interface NRIGuideEntry {
  title: string;
  nriMessage: string;
  route: string;
}

/**
 * Guide content — NRI explains each screen in its own voice.
 * These are NOT feature descriptions. They're NRI speaking to a new gardener.
 */
const GUIDE_ENTRIES: NRIGuideEntry[] = [
  {
    title: "Home",
    route: "/app/home",
    nriMessage:
      "This is your garden's heartbeat. The phase, the weather, the week's rhythm — it all starts here. I'll surface what matters most each day.",
  },
  {
    title: "Loam Map",
    route: "/app/land",
    nriMessage:
      "This is your ground reading. I've translated federal soil data into three languages — plain, gardener, and source. Start with plain. Go deeper when you're ready.",
  },
  {
    title: "Weather",
    route: "/app/weather",
    nriMessage:
      "I watch the weather so you don't have to check it constantly. When frost or storms threaten, I'll find you. This screen shows the full picture.",
  },
  {
    title: "Planner",
    route: "/app/planner",
    nriMessage:
      "This is where your beds, crops, and materials come together. Start with one bed. Add crops. I'll help with timing based on your zone and frost dates.",
  },
  {
    title: "Common Year",
    route: "/app/commonyear",
    nriMessage:
      "The Common Year replaces calendar months with eight place-aware phases. Rest, Preparation, First Signs, Planting, Establishment, Abundance, Preservation, Return. You're in one of them right now.",
  },
  {
    title: "Memory",
    route: "/app/logs",
    nriMessage:
      "Everything you notice goes here. Notes, voice logs, photos. The garden's memory grows over time — and I learn from it. A 30-second observation is enough.",
  },
  {
    title: "Source",
    route: "/app/source",
    nriMessage:
      "Seeds, soil, and supplies. I recommend Seeds Now for online ordering — affordable, non-GMO, heirloom packets. For local sources, ask me and I'll search.",
  },
  {
    title: "NRI Chat",
    route: "/app/nri",
    nriMessage:
      "This is where we talk. Ask me anything about your garden, your soil, your season, your crops. I know this place — I've read your land data. I'm not a chatbot. I'm a steward.",
  },
  {
    title: "Harvest",
    route: "/app/harvest",
    nriMessage:
      "Track what comes in from the garden. Weight, destination, variety performance. Over time, this tells the story of what your ground can produce.",
  },
  {
    title: "Food Resilience",
    route: "/app/resilience",
    nriMessage:
      "This score measures how food-secure your garden makes you. Pounds produced, days of food, seeds saved, crops shared. Every point matters.",
  },
  {
    title: "Compost",
    route: "/app/compost",
    nriMessage:
      "Good compost is the foundation of good soil. Track your piles here — green/brown balance, temperature, when to turn. The most impactful thing you can do.",
  },
  {
    title: "Seed Exchange",
    route: "/app/seed-exchange",
    nriMessage:
      "Share seeds with your community. Over 90% of crop biodiversity has been lost. Every heirloom seed you save and share is an act of resilience.",
  },
  {
    title: "Community",
    route: "/app/community",
    nriMessage:
      "The community is the garden too. I watch for members who might need a check-in, mentors who are ready, and workdays that need attention. You lead — I notice.",
  },
];

const GUIDE_WINDOW_DAYS = 3;
const STORAGE_KEY = "hortus-nri-guide-seen";

function getSeenSections(): Set<string> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed as string[]);
  } catch {
    // ignore
  }
  return new Set();
}

function markSectionSeen(title: string): void {
  const seen = getSeenSections();
  seen.add(title);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
}

export function useNRIGuide(
  pathname: string,
  userCreatedAt: string | null | undefined,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
): {
  guideActive: boolean;
  currentGuide: NRIGuideEntry | null;
  dismissGuide: () => void;
} {
  const lastTriggeredPath = useRef<string | null>(null);

  const isWithinWindow = useMemo(() => {
    if (!userCreatedAt) return false;
    const created = new Date(userCreatedAt);
    const cutoff = new Date(
      created.getTime() + GUIDE_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );
    return new Date() < cutoff;
  }, [userCreatedAt]);

  const seen = useMemo(() => getSeenSections(), [pathname]);

  const currentGuide = useMemo((): NRIGuideEntry | null => {
    if (!isWithinWindow) return null;
    const match = GUIDE_ENTRIES.find(
      (g) =>
        pathname.startsWith(g.route) && !seen.has(g.title),
    );
    return match ?? null;
  }, [pathname, isWithinWindow, seen]);

  const guideActive = isWithinWindow && currentGuide !== null;

  // Auto-open NRI when entering a new section for the first time
  useEffect(() => {
    if (!guideActive || !currentGuide || isOpen) return;
    if (lastTriggeredPath.current === pathname) return;

    lastTriggeredPath.current = pathname;
    const timer = setTimeout(() => {
      markSectionSeen(currentGuide.title);
      setIsOpen(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [guideActive, currentGuide, isOpen, pathname, setIsOpen]);

  const dismissGuide = () => {
    // Mark all remaining as seen
    for (const entry of GUIDE_ENTRIES) {
      markSectionSeen(entry.title);
    }
  };

  return {
    guideActive,
    currentGuide: guideActive ? currentGuide : null,
    dismissGuide,
  };
}
