// @ts-nocheck — Ancient Library screen
import { useState } from "react";
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

const TRADITION_BG: Record<string, string> = {
  roman: "#f3e8e0",
  monastic: "#d7e7e6",
  islamic: "#ecdcc3",
  tudor: "#dee7d8",
};

export default function Traditions() {
  const { t } = useTranslation();
  const { tradId: routeTradId } = useParams<{ tradId?: string }>();
  const {
    traditions,
    plantsByTradition,
    techniquesByTradition,
    getSourceById,
    meta,
  } = useAncientLibrary();

  const [expandedId, setExpandedId] = useState<string | null>(routeTradId ?? null);

  return (
    <div style={{ fontFamily: T.sans, color: T.text, background: T.bg, minHeight: "100vh" }}>
      {/* ── Header ── */}
      <div style={{ padding: "1.5rem 1.25rem 1rem", background: T.terracottaSoft }}>
        <h1 style={{ fontFamily: T.serif, fontSize: "1.8rem", marginBottom: "0.25rem" }}>
          Growing Traditions
        </h1>
        <p style={{ fontSize: "0.8rem", color: T.muted }}>
          Four traditions that shaped how the Western world grows food
        </p>
      </div>

      {/* ── Grid of tradition cards ── */}
      <div
        style={{
          padding: "1.25rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1rem",
        }}
      >
        {traditions.map((trad) => {
          const isExpanded = expandedId === trad.id;
          const color = TRADITION_COLORS[trad.id] ?? T.muted;
          const bgColor = TRADITION_BG[trad.id] ?? T.surface2;
          const tradPlants = isExpanded ? plantsByTradition(trad.id) : [];
          const tradTechniques = isExpanded ? techniquesByTradition(trad.id) : [];

          // Gather unique source IDs from plants and techniques of this tradition
          const sourceIds = isExpanded
            ? Array.from(
                new Set([
                  ...tradPlants.flatMap((p) => p.sources),
                  ...tradTechniques.map((tech) => tech.source),
                ])
              )
            : [];

          return (
            <div
              key={trad.id}
              style={{
                background: T.surface,
                border: `1.5px solid ${isExpanded ? color : T.border}`,
                borderRadius: T.radiusXl,
                overflow: "hidden",
                boxShadow: isExpanded ? T.shadowSm : "none",
                transition: "border-color .15s, box-shadow .15s",
              }}
            >
              {/* Card header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : trad.id)}
                style={{
                  background: bgColor,
                  padding: "1.25rem",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "2rem" }}>{trad.icon}</span>
                  <div>
                    <h2 style={{
                      fontFamily: T.serif, fontSize: "1.35rem", color: color,
                      margin: 0, lineHeight: 1.2,
                    }}>
                      {trad.name}
                    </h2>
                    <span style={{ fontSize: "0.72rem", color: T.muted }}>{trad.period}</span>
                  </div>
                </div>
                <p style={{ fontSize: "0.82rem", color: T.text, lineHeight: 1.55, margin: "0 0 0.75rem" }}>
                  {trad.summary}
                </p>

                {/* Key principles */}
                <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                  {trad.key_principles.map((principle, i) => (
                    <li key={i} style={{ fontSize: "0.78rem", color: T.muted, lineHeight: 1.55, marginBottom: "0.15rem" }}>
                      {principle}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ padding: "1rem 1.25rem", borderTop: `1px solid ${T.divider}` }}>
                  {/* Plants in this tradition */}
                  <div style={{ marginBottom: "1rem" }}>
                    <h3 style={{
                      fontFamily: T.serif, fontSize: "1rem", color: color,
                      marginBottom: "0.5rem",
                    }}>
                      Plants in This Tradition
                    </h3>
                    {tradPlants.length === 0 ? (
                      <p style={{ fontSize: "0.78rem", color: T.faint }}>{t("None found")}</p>
                    ) : (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                        gap: "0.35rem",
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
                            <span style={{
                              fontSize: "0.58rem", fontWeight: 700,
                              textTransform: "uppercase" as const,
                              color: plant.difficulty === "beginner" ? "#3a6a28" : T.muted,
                            }}>
                              {plant.difficulty}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Techniques from this tradition */}
                  <div style={{ marginBottom: "1rem" }}>
                    <h3 style={{
                      fontFamily: T.serif, fontSize: "1rem", color: color,
                      marginBottom: "0.5rem",
                    }}>
                      Techniques from This Tradition
                    </h3>
                    {tradTechniques.length === 0 ? (
                      <p style={{ fontSize: "0.78rem", color: T.faint }}>{t("None found")}</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        {tradTechniques.map((tech) => (
                          <div key={tech.id} style={{
                            background: T.surface2,
                            borderRadius: "0.5rem",
                            padding: "0.5rem 0.75rem",
                            border: `1px solid ${T.divider}`,
                          }}>
                            <span style={{ fontWeight: 600, fontSize: "0.78rem", display: "block" }}>
                              {tech.name}
                            </span>
                            <span style={{ fontSize: "0.72rem", color: T.muted, lineHeight: 1.4 }}>
                              {tech.summary.length > 100 ? tech.summary.slice(0, 100) + "..." : tech.summary}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Source citations */}
                  {sourceIds.length > 0 && (
                    <div>
                      <h3 style={{
                        fontFamily: T.serif, fontSize: "1rem", color: T.muted,
                        marginBottom: "0.4rem",
                      }}>
                        {t("Sources")}
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {sourceIds.map((srcId) => {
                          const src = getSourceById(srcId);
                          if (!src) return null;
                          return (
                            <div key={srcId} style={{ fontSize: "0.75rem", color: T.muted, lineHeight: 1.5 }}>
                              <span style={{ fontWeight: 600, color: T.primary }}>{src.title}</span>
                              {" "}by {src.author} ({src.date})
                            </div>
                          );
                        })}
                      </div>
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
