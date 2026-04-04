// @ts-nocheck — Ancient Library screen
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAncientLibrary } from "@/ancientLibrary";
import type { AncientQuote } from "@/ancientLibrary";

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
  terracotta: "#a0522d",
  terracottaSoft: "#f3e8e0",
  radiusLg: "1rem",
  radiusXl: "1.35rem",
  radiusFull: "9999px",
  serif: "'Instrument Serif', serif",
  sans: "'Work Sans', sans-serif",
  shadowSm: "0 1px 3px rgba(30,25,18,.05),0 6px 18px rgba(30,25,18,.04)",
};

const TRADITION_COLORS: Record<string, string> = {
  roman: "#a0522d",
  monastic: "#0d6f74",
  islamic: "#aa6d22",
  tudor: "#5d7d4a",
};

export default function AncientHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    plants,
    techniques,
    currentMonth,
    randomQuote,
    plantsByDifficulty,
  } = useAncientLibrary();

  const [quote, setQuote] = useState<AncientQuote>(randomQuote);

  useEffect(() => {
    setQuote(randomQuote);
  }, [randomQuote]);

  const beginnerPlants = plantsByDifficulty("beginner").slice(0, 6);

  const featuredTechIds = ["roman_raised_beds", "two_pit_composting", "qanat_irrigation"];
  const featuredTechniques = techniques.filter((tech) =>
    featuredTechIds.includes(tech.id)
  ).slice(0, 3);
  // Fallback: if we don't find 3, just take the first 3
  const displayTechniques = featuredTechniques.length >= 3
    ? featuredTechniques
    : techniques.slice(0, 3);

  const monthTasks = currentMonth?.tasks.slice(0, 3) ?? [];

  return (
    <div style={{ fontFamily: T.sans, color: T.text, background: T.bg, minHeight: "100vh" }}>
      {/* ── Header ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${T.terracottaSoft} 0%, ${T.primarySoft} 100%)`,
          padding: "2rem 1.25rem 1.5rem",
        }}
      >
        <h1
          style={{
            fontFamily: T.serif,
            fontSize: "2rem",
            lineHeight: 1.1,
            marginBottom: "0.5rem",
            color: T.text,
          }}
        >
          {t("Ancient Library")}
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: T.muted,
            lineHeight: 1.55,
            marginBottom: "1.25rem",
            maxWidth: 520,
          }}
        >
          Ever Ancient, Ever New — grow with wisdom from Roman farmers, monastery
          gardens, and Islamic golden-age agronomists.
        </p>

        {/* Random quote */}
        <div
          style={{
            background: "rgba(255,255,255,0.6)",
            borderLeft: `3px solid ${T.terracotta}`,
            borderRadius: "0 8px 8px 0",
            padding: "0.75rem 1rem",
          }}
        >
          <p
            style={{
              fontFamily: T.serif,
              fontStyle: "italic",
              fontSize: "0.9rem",
              color: T.text,
              lineHeight: 1.5,
              marginBottom: "0.25rem",
            }}
          >
            "{quote.text}"
          </p>
          <span style={{ fontSize: "0.75rem", color: T.muted }}>
            — {quote.author}, <em>{quote.source}</em>
          </span>
        </div>
      </div>

      {/* ── CTA cards ── */}
      <div style={{ padding: "1.25rem" }}>
        {/* ── Card 1: Easy Ancient Crops ── */}
        <div
          onClick={() => navigate("/ancient/plants")}
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            overflow: "hidden",
            marginBottom: "1rem",
            cursor: "pointer",
            boxShadow: T.shadowSm,
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${T.accent}, color-mix(in srgb, ${T.accent} 70%, ${T.primary}))`,
              padding: "0.75rem 1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: T.serif, fontSize: "1.05rem", color: "#fff" }}>
              Start Here: Easy Ancient Crops
            </span>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,.7)" }}>
              {beginnerPlants.length} {t("plants")}
            </span>
          </div>
          <div
            style={{
              padding: "0.75rem 1rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "0.5rem",
            }}
          >
            {beginnerPlants.map((plant) => (
              <div
                key={plant.id}
                style={{
                  background: T.surface2,
                  borderRadius: T.radiusLg,
                  padding: "0.6rem 0.75rem",
                  border: `1px solid ${T.divider}`,
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    display: "block",
                    marginBottom: "0.2rem",
                  }}
                >
                  {plant.common_name}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.05em",
                    background: T.accentSoft,
                    color: T.accent,
                    borderRadius: T.radiusFull,
                    padding: "0.15rem 0.45rem",
                    marginBottom: "0.3rem",
                  }}
                >
                  {plant.category}
                </span>
                <p style={{ fontSize: "0.7rem", color: T.muted, lineHeight: 1.4, margin: 0 }}>
                  {plant.ancient_uses[0]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Card 2: Ancient Techniques ── */}
        <div
          onClick={() => navigate("/ancient/techniques")}
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            overflow: "hidden",
            marginBottom: "1rem",
            cursor: "pointer",
            boxShadow: T.shadowSm,
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${T.terracotta}, color-mix(in srgb, ${T.terracotta} 70%, ${T.warn}))`,
              padding: "0.75rem 1.25rem",
            }}
          >
            <span style={{ fontFamily: T.serif, fontSize: "1.05rem", color: "#fff" }}>
              Ancient Techniques
            </span>
          </div>
          <div style={{ padding: "0.75rem 1rem" }}>
            {displayTechniques.map((tech, i) => (
              <div
                key={tech.id}
                style={{
                  padding: "0.6rem 0",
                  borderBottom: i < displayTechniques.length - 1 ? `1px solid ${T.divider}` : "none",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.05em",
                    background: `${TRADITION_COLORS[tech.tradition] ?? T.muted}20`,
                    color: TRADITION_COLORS[tech.tradition] ?? T.muted,
                    borderRadius: T.radiusFull,
                    padding: "0.2rem 0.5rem",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {tech.tradition}
                </span>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "0.8rem", display: "block" }}>
                    {tech.name}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: T.muted, lineHeight: 1.4 }}>
                    {tech.summary.length > 100
                      ? tech.summary.slice(0, 100) + "..."
                      : tech.summary}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Card 3: Season by Season ── */}
        <div
          onClick={() => navigate("/ancient/calendar")}
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            overflow: "hidden",
            cursor: "pointer",
            boxShadow: T.shadowSm,
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${T.primary}, color-mix(in srgb, ${T.primary} 70%, ${T.accent}))`,
              padding: "0.75rem 1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: T.serif, fontSize: "1.05rem", color: "#fff" }}>
              Season by Season
            </span>
            {currentMonth && (
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                  background: "rgba(255,255,255,.2)",
                  color: "#fff",
                  borderRadius: T.radiusFull,
                  padding: "0.2rem 0.6rem",
                }}
              >
                {t("Current")}
              </span>
            )}
          </div>
          {currentMonth && (
            <div style={{ padding: "0.75rem 1rem" }}>
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  {currentMonth.name}
                </span>
                <span style={{ fontSize: "0.8rem", color: T.muted, marginLeft: "0.5rem" }}>
                  — {currentMonth.theme}
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                {monthTasks.map((task, i) => (
                  <li
                    key={i}
                    style={{ fontSize: "0.78rem", color: T.muted, lineHeight: 1.6 }}
                  >
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
