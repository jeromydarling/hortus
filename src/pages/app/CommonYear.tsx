import React from "react";
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
  radiusMd: "0.65rem",
  radiusLg: "1rem",
  radiusXl: "1.35rem",
  radiusFull: "9999px",
  serif: "'Instrument Serif', serif",
  sans: "'Work Sans', sans-serif",
};

/* ── Phase data from seed pack ── */
const PHASES = [
  {
    id: "rest",
    icon: "\u{1F319}",
    typicalMonths: "Dec 1 \u2013 Feb 15",
    transitionCues: [
      "Daylight lengthening past 10.5 hours",
      "Soil temp consistently above 35\u00B0F",
      "First birdsong changes",
      "Snow retreating from south-facing slopes",
    ],
  },
  {
    id: "preparation",
    icon: "\u{1F6E0}\uFE0F",
    typicalMonths: "Feb 15 \u2013 Mar 20",
    transitionCues: [
      "Soil temp at 4\" reaches 38\u00B0F",
      "Snowdrops or crocus emerging",
      "Forsythia buds swelling",
      "Ground workable on south-facing spots",
    ],
  },
  {
    id: "firstSigns",
    icon: "\u{1F331}",
    typicalMonths: "Mar 20 \u2013 Apr 30",
    transitionCues: [
      "Soil temp at 4\" reaches 40\u00B0F",
      "Crocus or snowdrop bloom",
      "Earthworms active at surface",
      "Forsythia at 50% bloom \u2014 the key signal",
    ],
  },
  {
    id: "planting",
    icon: "\u{1F31E}",
    typicalMonths: "May 1 \u2013 May 25",
    transitionCues: [
      "Last frost date passed",
      "Soil temp at 4\" reaches 50\u00B0F",
      "Dandelions blooming",
      "Lilac leaves fully emerged",
    ],
  },
  {
    id: "establishment",
    icon: "\u{26A1}",
    typicalMonths: "May 25 \u2013 Jun 30",
    transitionCues: [
      "Nighttime temps consistently above 50\u00B0F",
      "Soil temp above 60\u00B0F",
      "Iris blooming",
      "Rapid weed and crop growth simultaneously",
    ],
  },
  {
    id: "abundance",
    icon: "\u{2600}\uFE0F",
    typicalMonths: "Jul \u2013 Aug",
    transitionCues: [
      "Summer solstice passed",
      "Tomatoes ripening",
      "Consistent 85\u00B0F+ days",
      "Cicada or cricket chorus beginning",
    ],
  },
  {
    id: "preservation",
    icon: "\u{1F343}",
    typicalMonths: "Aug \u2013 Oct",
    transitionCues: [
      "Day length under 13.5 hours",
      "Nighttime temps dropping below 60\u00B0F",
      "First goldenrod blooming",
      "Tomato plants slowing production",
    ],
  },
  {
    id: "return",
    icon: "\u{1F319}",
    typicalMonths: "Oct \u2013 Nov 30",
    transitionCues: [
      "First hard frost occurred",
      "Ground approaching frozen",
      "Most perennials dormant",
      "Under 10 hours daylight",
    ],
  },
];

/* ── Phase order for status logic ── */
const PHASE_ORDER = PHASES.map((p) => p.id);

function phaseStatus(phaseId: string, currentId: string): "past" | "current" | "upcoming" {
  const ci = PHASE_ORDER.indexOf(currentId);
  const pi = PHASE_ORDER.indexOf(phaseId);
  if (pi < ci) return "past";
  if (pi === ci) return "current";
  return "upcoming";
}

export default function CommonYear() {
  const { t } = useTranslation();
  const currentPhaseId = DEMO_FIXTURE.land.currentPhase.phaseId;
  const phaseHistory = DEMO_FIXTURE.land.phaseHistory;
  const currentPhaseData = PHASES.find((p) => p.id === currentPhaseId);

  return (
    <div style={{ fontFamily: T.sans, color: T.text, background: T.bg, minHeight: "100vh" }}>
      <div style={{ padding: "1.25rem" }}>
        {/* ── Header ── */}
        <h1
          style={{
            fontFamily: T.serif,
            fontSize: "1.5rem",
            color: T.text,
            marginBottom: "0.25rem",
          }}
        >
          {t("nav.common_year")}
        </h1>
        <p
          style={{ fontSize: "0.8rem", color: T.muted, marginBottom: "1.25rem" }}
        >
          {t("phases.current_phase")}: {t(`phases.${currentPhaseId}`)}
        </p>

        {/* ── Current phase detail card ── */}
        {currentPhaseData && (
          <div
            style={{
              background: `linear-gradient(135deg, ${T.primarySoft}, ${T.accentSoft})`,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusXl,
              padding: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                color: T.primary,
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              {t("phases.current_phase")} &middot;{" "}
              {t("phases.phase_confidence", {
                confidence: Math.round(
                  DEMO_FIXTURE.land.currentPhase.confidence * 100,
                ),
              })}
            </span>
            <span
              style={{
                fontFamily: T.serif,
                fontSize: "1.8rem",
                color: T.text,
                display: "block",
                marginBottom: "0.75rem",
              }}
            >
              {currentPhaseData.icon} {t(`phases.${currentPhaseId}`)}
            </span>
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 300,
                color: T.muted,
                lineHeight: 1.65,
              }}
            >
              {t(`phases.${currentPhaseId}_description`)}
            </p>
          </div>
        )}

        {/* ── Transition cues ── */}
        {currentPhaseData && (
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusXl,
              padding: "1.25rem",
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
              {t("phases.transition_cues")}
            </span>
            {currentPhaseData.transitionCues.map((cue, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                  padding: "0.5rem 0",
                  borderBottom:
                    i < currentPhaseData.transitionCues.length - 1
                      ? `1px solid ${T.divider}`
                      : "none",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: T.primary,
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{ fontSize: "0.875rem", color: T.muted, lineHeight: 1.5 }}
                >
                  {cue}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── All 8 phases ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          {PHASES.map((phase, idx) => {
            const status = phaseStatus(phase.id, currentPhaseId);
            const isCurrent = status === "current";

            const statusStyles: Record<string, React.CSSProperties> = {
              current: {
                background: T.primarySoft,
                color: T.primary,
              },
              past: {
                background: T.surface3,
                color: T.faint,
              },
              upcoming: {
                background: T.warnSoft,
                color: T.warn,
              },
            };

            return (
              <div
                key={phase.id}
                style={{
                  background: isCurrent ? T.primarySoft : T.surface,
                  border: `1px solid ${isCurrent ? T.primary : T.border}`,
                  borderRadius: T.radiusLg,
                  padding: "0.75rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: isCurrent ? T.primary : T.surface3,
                    color: isCurrent ? "#fff" : T.muted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontFamily: T.serif,
                      fontSize: "1rem",
                      color: T.text,
                      display: "block",
                      marginBottom: 1,
                    }}
                  >
                    {phase.icon} {t(`phases.${phase.id}`)}
                  </span>
                  <span style={{ fontSize: 10, color: T.muted }}>
                    {phase.typicalMonths}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    padding: "0.2rem 0.6rem",
                    borderRadius: T.radiusFull,
                    textTransform: "uppercase" as const,
                    ...statusStyles[status],
                  }}
                >
                  {status === "current"
                    ? t("phases.current_phase")
                    : status === "past"
                      ? "Past"
                      : "Upcoming"}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Phase history timeline ── */}
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
            {t("phases.phase_history")}
          </span>

          {phaseHistory.map((entry, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "0.75rem",
                padding: "0.75rem 0",
                borderBottom:
                  i < phaseHistory.length - 1
                    ? `1px solid ${T.divider}`
                    : "none",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    entry.phaseId === currentPhaseId ? T.primary : T.accent,
                  marginTop: 6,
                  flexShrink: 0,
                }}
              />
              <div>
                <span style={{ fontSize: 10, color: T.faint, display: "block", marginBottom: 2 }}>
                  {entry.date}
                </span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: T.text,
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 2,
                  }}
                >
                  {t(`phases.${entry.phaseId}`)}
                </span>
                <span style={{ fontSize: "0.8rem", color: T.muted, lineHeight: 1.5 }}>
                  {entry.reason}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
