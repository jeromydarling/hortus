import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAncientLibrary } from "@/ancientLibrary";

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

const DIFFICULTY_COLORS: Record<string, { bg: string; fg: string }> = {
  beginner: { bg: "#d7e7d0", fg: "#3a6a28" },
  intermediate: { bg: "#ecdcc3", fg: "#8a6515" },
  advanced: { bg: "#e8d0d0", fg: "#8a2828" },
};

const ALL_TRADITIONS = ["all", "roman", "monastic", "islamic", "tudor"] as const;
const ALL_DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"] as const;

export default function Techniques() {
  const { t } = useTranslation();
  const { techId: routeTechId } = useParams<{ techId?: string }>();
  const {
    techniques,
    getSourceById,
    plantsByTradition,
  } = useAncientLibrary();

  const [tradition, setTradition] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(routeTechId ?? null);
  const [showPlantsFor, setShowPlantsFor] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = techniques;
    if (tradition !== "all") {
      result = result.filter((tech) => tech.tradition === tradition);
    }
    if (difficulty !== "all") {
      result = result.filter((tech) => tech.difficulty === difficulty);
    }
    return result;
  }, [techniques, tradition, difficulty]);

  return (
    <div style={{ fontFamily: T.sans, color: T.text, background: T.bg, minHeight: "100vh" }}>
      {/* ── Header ── */}
      <div style={{ padding: "1.5rem 1.25rem 1rem", background: T.terracottaSoft }}>
        <h1 style={{ fontFamily: T.serif, fontSize: "1.8rem", marginBottom: "0.25rem" }}>
          Ancient Techniques
        </h1>
        <p style={{ fontSize: "0.8rem", color: T.muted }}>
          {techniques.length} time-tested methods for soil, water, and cultivation
        </p>
      </div>

      {/* ── Filters ── */}
      <div style={{ padding: "0.75rem 1.25rem", borderBottom: `1px solid ${T.divider}` }}>
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: T.faint, textTransform: "uppercase" as const, letterSpacing: "0.06em", alignSelf: "center", marginRight: "0.25rem" }}>
            {t("Tradition")}
          </span>
          {ALL_TRADITIONS.map((trad) => {
            const active = tradition === trad;
            const color = trad === "all" ? T.primary : (TRADITION_COLORS[trad] ?? T.muted);
            return (
              <button
                key={trad}
                onClick={() => setTradition(trad)}
                style={{
                  padding: "0.25rem 0.6rem",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  border: `1px solid ${active ? color : T.border}`,
                  borderRadius: T.radiusFull,
                  background: active ? `${color}20` : T.surface,
                  color: active ? color : T.muted,
                  cursor: "pointer",
                  fontFamily: T.sans,
                  textTransform: "capitalize" as const,
                }}
              >
                {trad === "all" ? t("All") : trad}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: T.faint, textTransform: "uppercase" as const, letterSpacing: "0.06em", alignSelf: "center", marginRight: "0.25rem" }}>
            {t("Difficulty")}
          </span>
          {ALL_DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              style={{
                padding: "0.25rem 0.6rem",
                fontSize: "0.7rem",
                fontWeight: 600,
                border: `1px solid ${difficulty === d ? T.primary : T.border}`,
                borderRadius: T.radiusFull,
                background: difficulty === d ? T.primarySoft : T.surface,
                color: difficulty === d ? T.primary : T.muted,
                cursor: "pointer",
                fontFamily: T.sans,
                textTransform: "capitalize" as const,
              }}
            >
              {d === "all" ? t("All") : d}
            </button>
          ))}
        </div>
      </div>

      {/* ── Technique list ── */}
      <div style={{ padding: "0.75rem 1.25rem" }}>
        <p style={{ fontSize: "0.7rem", color: T.faint, marginBottom: "0.5rem" }}>
          {filtered.length} {t("techniques")}
        </p>

        {filtered.map((tech) => {
          const isExpanded = expandedId === tech.id;
          const tradColor = TRADITION_COLORS[tech.tradition] ?? T.muted;
          const diffColors = DIFFICULTY_COLORS[tech.difficulty] ?? { bg: T.surface3, fg: T.muted };
          const source = getSourceById(tech.source);
          const tradPlants = showPlantsFor === tech.id ? plantsByTradition(tech.tradition) : [];

          return (
            <div
              key={tech.id}
              style={{
                background: T.surface,
                border: `1px solid ${isExpanded ? tradColor : T.border}`,
                borderRadius: T.radiusXl,
                marginBottom: "0.75rem",
                overflow: "hidden",
                boxShadow: isExpanded ? T.shadowSm : "none",
                transition: "border-color .15s",
              }}
            >
              {/* Card header — always visible */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : tech.id)}
                style={{
                  padding: "0.85rem 1rem",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", marginBottom: "0.3rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{tech.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
                    <span style={{
                      fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const,
                      letterSpacing: "0.04em",
                      background: `${tradColor}20`, color: tradColor,
                      borderRadius: T.radiusFull, padding: "0.15rem 0.45rem",
                    }}>
                      {tech.tradition}
                    </span>
                    <span style={{
                      fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const,
                      letterSpacing: "0.04em",
                      background: diffColors.bg, color: diffColors.fg,
                      borderRadius: T.radiusFull, padding: "0.15rem 0.45rem",
                    }}>
                      {tech.difficulty}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: T.muted, lineHeight: 1.45, margin: 0 }}>
                    {tech.summary.length > 150 && !isExpanded
                      ? tech.summary.slice(0, 150) + "..."
                      : tech.summary}
                  </p>
                </div>
                <span style={{ fontSize: "0.8rem", color: T.faint, marginLeft: "0.5rem", flexShrink: 0, marginTop: "0.2rem" }}>
                  {isExpanded ? "\u25B2" : "\u25BC"}
                </span>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ padding: "0 1rem 1rem", borderTop: `1px solid ${T.divider}` }}>
                  {/* Source */}
                  {source && (
                    <div style={{ marginTop: "0.75rem", marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: T.faint, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                        {t("Source")}
                      </span>
                      <p style={{ fontSize: "0.8rem", color: T.primary, margin: "0.15rem 0 0" }}>
                        {source.title} — {source.author} ({source.date})
                      </p>
                    </div>
                  )}

                  {/* Why it still matters */}
                  <div style={{ marginBottom: "1rem" }}>
                    <h4 style={{
                      fontFamily: T.serif, fontSize: "1rem", color: T.terracotta,
                      marginBottom: "0.35rem",
                    }}>
                      Why It Still Matters
                    </h4>
                    <p style={{ fontSize: "0.8rem", color: T.text, lineHeight: 1.55, margin: 0 }}>
                      {tech.modern_notes}
                    </p>
                  </div>

                  {/* Step-by-step instructions */}
                  <div style={{ marginBottom: "1rem" }}>
                    <h4 style={{
                      fontFamily: T.serif, fontSize: "1rem", color: T.accent,
                      marginBottom: "0.35rem",
                    }}>
                      Step-by-Step Instructions
                    </h4>
                    <ol style={{ margin: 0, paddingLeft: "1.3rem" }}>
                      {tech.instructions.map((step, i) => (
                        <li key={i} style={{ fontSize: "0.8rem", color: T.text, lineHeight: 1.6, marginBottom: "0.3rem" }}>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Plants that benefit */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPlantsFor(showPlantsFor === tech.id ? null : tech.id);
                    }}
                    style={{
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      border: `1.5px solid ${tradColor}`,
                      borderRadius: T.radiusLg,
                      background: showPlantsFor === tech.id ? `${tradColor}20` : T.surface,
                      color: tradColor,
                      cursor: "pointer",
                      fontFamily: T.sans,
                      marginBottom: showPlantsFor === tech.id ? "0.5rem" : 0,
                    }}
                  >
                    {showPlantsFor === tech.id ? "Hide" : "Show"} Plants That Benefit
                  </button>

                  {showPlantsFor === tech.id && tradPlants.length > 0 && (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                      gap: "0.35rem",
                      marginTop: "0.5rem",
                    }}>
                      {tradPlants.map((plant) => (
                        <div key={plant.id} style={{
                          background: T.surface2,
                          borderRadius: "0.5rem",
                          padding: "0.4rem 0.6rem",
                          border: `1px solid ${T.divider}`,
                        }}>
                          <span style={{ fontWeight: 600, fontSize: "0.72rem", display: "block" }}>
                            {plant.common_name}
                          </span>
                          <span style={{ fontSize: "0.62rem", color: T.muted, fontStyle: "italic" }}>
                            {plant.latin_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
