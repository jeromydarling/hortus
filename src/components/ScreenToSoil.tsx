import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

/**
 * Screen-to-Soil Design System
 *
 * Philosophy: Minimize time in app, maximize time in garden.
 * Technology as a bridge to physical, place-based activity — not a replacement.
 *
 * This component provides:
 * 1. A session timer that gently nudges users to get outside
 * 2. Quick-log interfaces (one-tap observation logging)
 * 3. "Get Outside" prompts after extended screen time
 * 4. Auto-close suggestion after completing a task
 */

interface ScreenToSoilProps {
  /** Minutes before first gentle nudge */
  nudgeAfterMinutes?: number;
  /** Whether the user just completed a task (triggers celebration + close prompt) */
  taskCompleted?: boolean;
  /** Callback when user taps "Go outside" */
  onGoOutside?: () => void;
}

const NUDGE_MESSAGES = [
  "Your garden is waiting. One observation is enough for today.",
  "The best thing you can do right now is step outside and look.",
  "Sundown Edge is out there. What has changed since yesterday?",
  "Close this. Walk to the nearest bed. Notice one thing.",
  "The soil doesn't need you to scroll. It needs you to show up.",
  "Five minutes outside teaches more than an hour of planning.",
];

const TASK_COMPLETE_MESSAGES = [
  "Done. Now go see what the garden is doing.",
  "Logged. The rest happens outside.",
  "Saved. Time to step away from the screen.",
  "Good. Now close this and go check on your beds.",
];

export function ScreenToSoil({
  nudgeAfterMinutes = 10,
  taskCompleted = false,
  onGoOutside,
}: ScreenToSoilProps) {
  const { t } = useTranslation();
  const [minutesInApp, setMinutesInApp] = useState(0);
  const [showNudge, setShowNudge] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesInApp((m) => m + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (minutesInApp >= nudgeAfterMinutes && !dismissed) {
      const msg =
        NUDGE_MESSAGES[Math.floor(Math.random() * NUDGE_MESSAGES.length)] ??
        NUDGE_MESSAGES[0] ?? "";
      setNudgeMessage(msg);
      setShowNudge(true);
    }
  }, [minutesInApp, nudgeAfterMinutes, dismissed]);

  const handleDismiss = useCallback(() => {
    setShowNudge(false);
    setDismissed(true);
  }, []);

  if (taskCompleted) {
    const completeMsg =
      TASK_COMPLETE_MESSAGES[
        Math.floor(Math.random() * TASK_COMPLETE_MESSAGES.length)
      ] ?? TASK_COMPLETE_MESSAGES[0] ?? "";

    return (
      <div style={taskCompleteBanner}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SeedIcon size={24} color="#5d7d4a" />
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16 }}>
            {completeMsg}
          </span>
        </div>
        <button onClick={onGoOutside} style={goOutsideButton}>
          {t("screenToSoil.close_app", "Close & go outside")}
        </button>
      </div>
    );
  }

  if (!showNudge) return null;

  return (
    <div style={nudgeBanner}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <SeedIcon size={20} color="#aa6d22" />
        <span style={{ fontSize: 13, color: "#706b63", lineHeight: 1.4 }}>
          {nudgeMessage}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <button onClick={onGoOutside} style={goOutsideButtonSmall}>
          {t("screenToSoil.go_outside", "Go outside")}
        </button>
        <button onClick={handleDismiss} style={dismissButton}>
          {"\u00D7"}
        </button>
      </div>
    </div>
  );
}

/**
 * QuickLog — One-tap observation interface
 * Minimizes screen time by making logging fast
 */
interface QuickLogProps {
  onLog: (type: string, content: string) => void;
}

const QUICK_OBSERVATIONS = [
  { emoji: "\ud83c\udf31", label: "New growth", type: "growth" },
  { emoji: "\ud83d\udca7", label: "Watered", type: "watered" },
  { emoji: "\ud83d\udc1b", label: "Pest spotted", type: "pest" },
  { emoji: "\ud83c\udf3c", label: "Flowering", type: "flowering" },
  { emoji: "\ud83e\udd55", label: "Harvested", type: "harvest" },
  { emoji: "\ud83c\udf27\ufe0f", label: "Rain", type: "rain" },
  { emoji: "\u2744\ufe0f", label: "Frost", type: "frost" },
  { emoji: "\ud83d\udcf8", label: "Photo", type: "photo" },
];

export function QuickLog({ onLog }: QuickLogProps) {
  const { t } = useTranslation();

  return (
    <div style={quickLogContainer}>
      <p style={{ fontSize: 12, color: "#706b63", margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>
        {t("screenToSoil.quick_log", "Quick log — tap and go")}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
        {QUICK_OBSERVATIONS.map((obs) => (
          <button
            key={obs.type}
            onClick={() => onLog(obs.type, obs.label)}
            style={quickLogButton}
            aria-label={obs.label}
          >
            <span style={{ fontSize: 18 }}>{obs.emoji}</span>
            <span style={{ fontSize: 11 }}>{obs.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Seed SVG icon used as the Hortus map marker
 */
export function SeedIcon({ size = 16, color = "#0d6f74" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Seed body */}
      <path
        d="M12 2C8.5 2 5.5 5 5.5 9C5.5 13.5 9 17 12 22C15 17 18.5 13.5 18.5 9C18.5 5 15.5 2 12 2Z"
        fill={color}
        opacity={0.85}
      />
      {/* Inner vein */}
      <path
        d="M12 5C12 5 10 8 10 11C10 13 11 15 12 17"
        stroke="white"
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.6}
      />
      {/* Sprout emerging from top */}
      <path
        d="M12 2C12 2 13.5 0 15 1C13.5 1.5 12.5 2 12 2Z"
        fill={color}
        opacity={0.7}
      />
    </svg>
  );
}

// Styles
const nudgeBanner: React.CSSProperties = {
  background: "linear-gradient(135deg, #faf5eb 0%, #f5f0e4 100%)",
  border: "1px solid #e8dcc8",
  borderRadius: 10,
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  margin: "12px 0",
};

const taskCompleteBanner: React.CSSProperties = {
  background: "linear-gradient(135deg, #e8f0e0 0%, #d8e8cc 100%)",
  border: "1px solid #b8d4a0",
  borderRadius: 12,
  padding: "20px 24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
  margin: "24px 0",
  textAlign: "center",
};

const goOutsideButton: React.CSSProperties = {
  background: "#5d7d4a",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "10px 20px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const goOutsideButtonSmall: React.CSSProperties = {
  background: "#5d7d4a",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const dismissButton: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#706b63",
  fontSize: 16,
  lineHeight: 1,
  padding: 4,
};

const quickLogContainer: React.CSSProperties = {
  background: "#fbfaf7",
  border: "1px solid #e8e5de",
  borderRadius: 10,
  padding: 16,
};

const quickLogButton: React.CSSProperties = {
  background: "white",
  border: "1px solid #e8e5de",
  borderRadius: 8,
  padding: "8px 12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  cursor: "pointer",
  minWidth: 64,
  transition: "border-color 180ms ease",
};
