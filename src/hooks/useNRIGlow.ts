/**
 * useNRIGlow — Soft visual indicator that NRI has something helpful.
 *
 * Ported from thecros useCompassGlow pattern.
 *
 * WHAT: Detects meaningful signals (frost alert, phase change, unread
 *       nudges) and sets a time-bounded glow on the compass button.
 * WHERE: NRI compass button (bottom nav center).
 * WHY: Calm presence — NRI can help, not that it demands attention.
 *      Never pulse. Never badge-count. Just a gentle light.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { NRINudge } from "./useNRINudgeEngine";

/** Nudge types that trigger a glow, with duration in ms */
const GLOW_TRIGGERS: Record<string, number> = {
  frost_alert: 4 * 60 * 60 * 1000, // 4 hours — frost is urgent
  weather_alert: 2 * 60 * 60 * 1000, // 2 hours
  phase_signal: 8 * 60 * 60 * 1000, // 8 hours — rare, significant
  planting_window: 12 * 60 * 60 * 1000, // 12 hours — once-per-season event
  community_signal: 2 * 60 * 60 * 1000, // 2 hours
};

const COOLDOWN_MS = 30 * 60 * 1000; // 30-minute cooldown after glow expires

export function useNRIGlow(
  nudges: NRINudge[],
  drawerOpen: boolean,
): boolean {
  const [glowing, setGlowing] = useState(false);
  const cooldownRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Never glow when drawer is open — user is already engaged
    if (drawerOpen) {
      setGlowing(false);
      clearTimer();
      return;
    }

    const now = Date.now();

    // Respect cooldown
    if (now < cooldownRef.current) return;

    // Check if any nudge triggers a glow
    for (const nudge of nudges) {
      const duration = GLOW_TRIGGERS[nudge.type];
      if (!duration) continue;

      // High-confidence nudges only
      if (nudge.confidence < 0.6) continue;

      setGlowing(true);

      clearTimer();
      timerRef.current = setTimeout(() => {
        setGlowing(false);
        cooldownRef.current = Date.now() + COOLDOWN_MS;
      }, duration);
      return;
    }

    // No valid trigger
    if (glowing) setGlowing(false);
  }, [nudges, drawerOpen, glowing, clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  return glowing;
}
