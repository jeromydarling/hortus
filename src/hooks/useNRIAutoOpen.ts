/**
 * useNRIAutoOpen — Auto-opens NRI drawer on login when nudges exist.
 *
 * Ported from thecros useCompassAutoOpen pattern.
 *
 * WHAT: Opens the NRI drawer on first login of the day when there are
 *       meaningful nudges (Rule of Life, phase transition, frost alert).
 *       Uses an 8-hour cooldown persisted in localStorage.
 * WHERE: NRI compass button mount.
 * WHY: Meaningful movement should gently surface, not demand attention.
 */

import { useEffect, useRef } from "react";
import type { NRINudge } from "./useNRINudgeEngine";

const COOLDOWN_KEY = "hortus-nri-auto-open";
const COOLDOWN_HOURS = 8;

function canAutoOpen(): boolean {
  const last = localStorage.getItem(COOLDOWN_KEY);
  if (!last) return true;
  const elapsed = Date.now() - parseInt(last, 10);
  return elapsed > COOLDOWN_HOURS * 60 * 60 * 1000;
}

function recordAutoOpen(): void {
  localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
}

export function useNRIAutoOpen(
  nudges: NRINudge[],
  isLoading: boolean,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
): void {
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (isOpen || isLoading || hasTriggered.current || nudges.length === 0)
      return;

    // Only auto-open for high-confidence nudges
    const hasImportant = nudges.some((n) => n.confidence >= 0.7);
    if (!hasImportant) return;

    if (!canAutoOpen()) return;

    hasTriggered.current = true;
    recordAutoOpen();

    // Small delay so the page renders first
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [nudges, isLoading, isOpen, setIsOpen]);
}
