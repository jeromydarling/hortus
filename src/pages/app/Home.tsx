/* eslint-disable @typescript-eslint/no-unused-vars */
import { useTranslation } from "react-i18next";
import { DEMO_FIXTURE } from "@/demo/fixture";

/* ── Design tokens ── */
const T = {
  primary: "#0d6f74",
  primarySoft: "#d7e7e6",
  accent: "#5d7d4a",
  accentSoft: "#dee7d8",
  warn: "#aa6d22",
  warnSoft: "#ecdcc3",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  surface2: "#f5f1ea",
  surface3: "#eee8de",
  border: "#d7d2c8",
  divider: "#e5e0d8",
  text: "#26231d",
  muted: "#706b63",
  faint: "#a9a39b",
  radiusLg: "1rem",
  radiusXl: "1.35rem",
  radiusFull: "9999px",
  serif: "'Instrument Serif', serif",
  sans: "'Work Sans', sans-serif",
  shadowSm: "0 1px 3px rgba(30,25,18,.05),0 6px 18px rgba(30,25,18,.04)",
};

/* ── Frost-free countdown helper ── */
function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / 86_400_000));
}

/* ── Quick-log options ── */
const QUICK_LOGS = [
  { emoji: "\u{1F4DD}", labelKey: "logs.add_note" },
  { emoji: "\u{1F3A4}", labelKey: "logs.add_voice" },
  { emoji: "\u{1F4F7}", labelKey: "logs.add_photo" },
];

/* ── Rule of Life movements ── */
const MOVEMENTS: { num: number; key: string; action: string }[] = [
  { num: 1, key: "nri.rule_observe", action: "Soil temperature at planting depth. What's blooming. First earthworms." },
  { num: 2, key: "nri.rule_tend", action: "Start cold-hardy seeds indoors. Direct sow peas and spinach when soil allows." },
  { num: 3, key: "nri.rule_restrain", action: "Tomatoes and peppers stay inside. Don't be fooled by warm spells." },
  { num: 4, key: "nri.rule_receive", action: "The first green shoot is a gift. The smell of warming earth." },
  { num: 5, key: "nri.rule_record", action: "Date of first signs. Compare to last year. Note what's early or late." },
];

export default function Home() {
  const { t } = useTranslation();

  const land = DEMO_FIXTURE.land;
  const weather = DEMO_FIXTURE.weather;
  const plan = DEMO_FIXTURE.activePlan;
  const frostDays = daysUntil(land.frostDates.lastSpring);
  const observationStreak = DEMO_FIXTURE.observations.length;

  return (
    <div style={{ fontFamily: T.sans, color: T.text, background: T.bg, minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${T.accentSoft} 0%, ${T.primarySoft} 100%)`,
          padding: "1.5rem 1.25rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <p
          style={{
            fontFamily: T.serif,
            fontStyle: "italic",
            fontSize: "0.875rem",
            color: T.accent,
            marginBottom: "0.75rem",
          }}
        >
          {t("nri.verso_lalto")} {t("nri.greeting")}
        </p>

        <h1
          style={{
            fontFamily: T.serif,
            fontSize: "1.8rem",
            lineHeight: 1.1,
            marginBottom: "0.5rem",
          }}
        >
          {land.displayName}{" "}
          <span style={{ fontSize: "1rem", color: T.muted }}>&middot;</span>{" "}
          <span style={{ fontSize: "1rem" }}>
            {t(`phases.${land.currentPhase.phaseId}`)}
          </span>
        </h1>

        {/* Phase badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            background: `${T.primary}1f`,
            border: `1px solid ${T.primary}40`,
            borderRadius: T.radiusFull,
            padding: "0.25rem 0.75rem",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase" as const,
            color: T.primary,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: T.primary,
            }}
          />
          {t("phases.current_phase")}
        </span>
      </div>

      {/* ── Screen content ── */}
      <div style={{ padding: "1.25rem" }}>
        {/* ── Weather hazard ── */}
        {weather.state as string !== "clear" && (
          <div
            style={{
              background: T.warnSoft,
              border: `1px solid ${T.warn}`,
              borderRadius: T.radiusLg,
              padding: "0.75rem 1rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
              marginBottom: "1rem",
            }}
          >
            <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 2 }}>
              {"\u26A0\uFE0F"}
            </span>
            <div>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: T.warn,
                  display: "block",
                  marginBottom: 2,
                }}
              >
                {t(`weather.state_${weather.state}`)}
              </span>
              <span style={{ fontSize: "0.8rem", color: T.muted }}>
                {weather.headline}
              </span>
            </div>
          </div>
        )}

        {/* ── Stat chips ── */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            overflowX: "auto",
            marginBottom: "1rem",
            paddingBottom: 2,
          }}
        >
          {/* Frost countdown */}
          <div
            style={{
              flexShrink: 0,
              background: T.primarySoft,
              border: `1px solid ${T.primary}`,
              borderRadius: T.radiusLg,
              padding: "0.75rem 1rem",
              minWidth: 100,
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase" as const,
                color: T.faint,
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              {t("weather.frost_risk")}
            </span>
            <span
              style={{
                fontSize: "1.3rem",
                fontWeight: 600,
                color: T.primary,
                display: "block",
              }}
            >
              {frostDays}d
            </span>
            <span style={{ fontSize: 9, color: T.muted }}>
              {t("weather.frost_countdown", { days: frostDays })}
            </span>
          </div>

          {/* Observation streak */}
          <div
            style={{
              flexShrink: 0,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusLg,
              padding: "0.75rem 1rem",
              minWidth: 100,
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase" as const,
                color: T.faint,
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              {t("logs.streak")}
            </span>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: T.text,
                display: "block",
              }}
            >
              {t("logs.streak_days", { count: observationStreak })}
            </span>
          </div>

          {/* Active plan */}
          <div
            style={{
              flexShrink: 0,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusLg,
              padding: "0.75rem 1rem",
              minWidth: 100,
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase" as const,
                color: T.faint,
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              {t("planner.active_plan")}
            </span>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: T.text,
                display: "block",
              }}
            >
              {plan.name}
            </span>
            <span style={{ fontSize: 9, color: T.muted }}>
              {plan.seedList.length} crops
            </span>
          </div>
        </div>

        {/* ── Rule of Life ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            overflow: "hidden",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${T.primary}, color-mix(in srgb, ${T.primary} 70%, ${T.accent}))`,
              padding: "1rem 1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: T.serif,
                fontSize: "1.1rem",
                color: "#fff",
              }}
            >
              {t("nri.rule_of_life")}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.7)" }}>
              {t(`phases.${land.currentPhase.phaseId}`)}
            </span>
          </div>

          <div style={{ padding: "1rem 1.25rem" }}>
            {MOVEMENTS.map((m) => (
              <div
                key={m.num}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                  padding: "0.75rem 0",
                  borderBottom:
                    m.num < MOVEMENTS.length
                      ? `1px solid ${T.divider}`
                      : "none",
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: T.surface3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.muted,
                    flexShrink: 0,
                  }}
                >
                  {m.num}
                </span>
                <div>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: T.text,
                      display: "block",
                      marginBottom: 2,
                    }}
                  >
                    {t(m.key)}
                  </span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: T.muted,
                      lineHeight: 1.5,
                    }}
                  >
                    {m.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick observation (ScreenToSoil QuickLog) ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase" as const,
              color: T.faint,
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            {t("screenToSoil.quick_log")}
          </span>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {QUICK_LOGS.map((q) => (
              <button
                key={q.labelKey}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase" as const,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: T.radiusLg,
                  background: T.surface2,
                  color: T.muted,
                  cursor: "pointer",
                  fontFamily: T.sans,
                }}
              >
                {q.emoji} {t(q.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* ── NRI ground reading summary ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "1.25rem",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase" as const,
              color: T.faint,
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            {t("nri.ground_reading")}
          </span>
          <p
            style={{
              fontFamily: T.serif,
              fontStyle: "italic",
              fontSize: "0.875rem",
              color: T.muted,
              lineHeight: 1.55,
            }}
          >
            {land.currentPhase.reason}
          </p>
        </div>
      </div>
    </div>
  );
}
