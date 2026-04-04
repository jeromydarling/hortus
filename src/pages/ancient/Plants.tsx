import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAncientLibrary } from "@/ancientLibrary";
import type { AncientPlant } from "@/ancientLibrary";

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

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  herb: { bg: "#d7e7d0", fg: "#3a6a28" },
  vegetable: { bg: "#d7e7e6", fg: "#0d6f74" },
  fruit: { bg: "#ecdcc3", fg: "#8a6515" },
  grain: { bg: "#f3e8e0", fg: "#a0522d" },
  legume: { bg: "#e0e3f3", fg: "#3a3a8a" },
  flower: { bg: "#f3e0f0", fg: "#8a3a7a" },
};

const ALL_DIFFICULTIES = ["all", "beginner", "intermediate"] as const;
const ALL_CATEGORIES = ["all", "herb", "vegetable", "fruit"] as const;
const ALL_TRADITIONS = ["roman", "monastic", "islamic", "tudor"] as const;

export default function Plants() {
  const { t } = useTranslation();
  const { plantId: routePlantId } = useParams<{ plantId?: string }>();
  const {
    plants,
    search,
    getSourceById,
    techniques,
  } = useAncientLibrary();

  const [difficulty, setDifficulty] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [selectedTraditions, setSelectedTraditions] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(routePlantId ?? null);

  const filtered = useMemo(() => {
    let result: AncientPlant[] = query.trim() ? search(query.trim()) : plants;

    if (difficulty !== "all") {
      result = result.filter((p) => p.difficulty === difficulty);
    }
    if (category !== "all") {
      result = result.filter((p) => p.category.toLowerCase() === category);
    }
    if (selectedTraditions.size > 0) {
      result = result.filter((p) =>
        p.traditions.some((trad) => selectedTraditions.has(trad))
      );
    }
    return result;
  }, [plants, search, query, difficulty, category, selectedTraditions]);

  const selectedPlant = selectedPlantId
    ? plants.find((p) => p.id === selectedPlantId)
    : null;

  const toggleTradition = (trad: string) => {
    setSelectedTraditions((prev) => {
      const next = new Set(prev);
      if (next.has(trad)) next.delete(trad);
      else next.add(trad);
      return next;
    });
  };

  const relatedTechniques = selectedPlant
    ? techniques.filter((tech) =>
        selectedPlant.traditions.includes(tech.tradition)
      )
    : [];

  return (
    <div style={{ fontFamily: T.sans, color: T.text, background: T.bg, minHeight: "100vh" }}>
      {/* ── Header ── */}
      <div style={{ padding: "1.5rem 1.25rem 1rem", background: T.terracottaSoft }}>
        <h1 style={{ fontFamily: T.serif, fontSize: "1.8rem", marginBottom: "0.25rem" }}>
          Ancient Plants
        </h1>
        <p style={{ fontSize: "0.8rem", color: T.muted }}>
          {plants.length} plants from antiquity and the medieval world
        </p>
      </div>

      {/* ── Filters ── */}
      <div style={{ padding: "0.75rem 1.25rem", borderBottom: `1px solid ${T.divider}` }}>
        {/* Search */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("Search plants...")}
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusLg,
            background: T.surface,
            fontFamily: T.sans,
            fontSize: "0.8rem",
            color: T.text,
            outline: "none",
            marginBottom: "0.6rem",
            boxSizing: "border-box" as const,
          }}
        />

        {/* Difficulty pills */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
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

        {/* Category pills */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: T.faint, textTransform: "uppercase" as const, letterSpacing: "0.06em", alignSelf: "center", marginRight: "0.25rem" }}>
            {t("Category")}
          </span>
          {ALL_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: "0.25rem 0.6rem",
                fontSize: "0.7rem",
                fontWeight: 600,
                border: `1px solid ${category === c ? T.accent : T.border}`,
                borderRadius: T.radiusFull,
                background: category === c ? T.accentSoft : T.surface,
                color: category === c ? T.accent : T.muted,
                cursor: "pointer",
                fontFamily: T.sans,
                textTransform: "capitalize" as const,
              }}
            >
              {c === "all" ? t("All") : c}
            </button>
          ))}
        </div>

        {/* Tradition chips */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: T.faint, textTransform: "uppercase" as const, letterSpacing: "0.06em", alignSelf: "center", marginRight: "0.25rem" }}>
            {t("Tradition")}
          </span>
          {ALL_TRADITIONS.map((trad) => {
            const active = selectedTraditions.has(trad);
            const color = TRADITION_COLORS[trad] ?? T.muted;
            return (
              <button
                key={trad}
                onClick={() => toggleTradition(trad)}
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
                {trad}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content area ── */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 280px)" }}>
        {/* ── Plant list ── */}
        <div
          style={{
            flex: selectedPlant ? "0 0 50%" : "1",
            padding: "0.75rem 1.25rem",
            overflowY: "auto",
            maxHeight: "calc(100vh - 280px)",
          }}
        >
          <p style={{ fontSize: "0.7rem", color: T.faint, marginBottom: "0.5rem" }}>
            {filtered.length} {t("results")}
          </p>
          {filtered.map((plant) => (
            <div
              key={plant.id}
              onClick={() => setSelectedPlantId(plant.id)}
              style={{
                background: selectedPlantId === plant.id ? T.primarySoft : T.surface,
                border: `1px solid ${selectedPlantId === plant.id ? T.primary : T.border}`,
                borderRadius: T.radiusLg,
                padding: "0.75rem 1rem",
                marginBottom: "0.5rem",
                cursor: "pointer",
                transition: "border-color .15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.3rem" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {plant.common_name}
                  </span>
                  <span
                    style={{
                      fontStyle: "italic",
                      fontSize: "0.75rem",
                      color: T.muted,
                      marginLeft: "0.4rem",
                    }}
                  >
                    {plant.latin_name}
                  </span>
                </div>
              </div>

              {/* Badges row */}
              <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                {/* Category badge */}
                <span
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.04em",
                    background: (CATEGORY_COLORS[plant.category.toLowerCase()] ?? { bg: T.surface3 }).bg,
                    color: (CATEGORY_COLORS[plant.category.toLowerCase()] ?? { fg: T.muted }).fg,
                    borderRadius: T.radiusFull,
                    padding: "0.15rem 0.45rem",
                  }}
                >
                  {plant.category}
                </span>
                {/* Difficulty badge */}
                <span
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.04em",
                    background: (DIFFICULTY_COLORS[plant.difficulty] ?? { bg: T.surface3 }).bg,
                    color: (DIFFICULTY_COLORS[plant.difficulty] ?? { fg: T.muted }).fg,
                    borderRadius: T.radiusFull,
                    padding: "0.15rem 0.45rem",
                  }}
                >
                  {plant.difficulty}
                </span>
                {/* Tradition chips */}
                {plant.traditions.map((trad) => (
                  <span
                    key={trad}
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 600,
                      textTransform: "capitalize" as const,
                      color: TRADITION_COLORS[trad] ?? T.muted,
                      background: `${TRADITION_COLORS[trad] ?? T.muted}15`,
                      borderRadius: T.radiusFull,
                      padding: "0.15rem 0.45rem",
                    }}
                  >
                    {trad}
                  </span>
                ))}
              </div>

              <p style={{ fontSize: "0.72rem", color: T.muted, lineHeight: 1.45, margin: 0 }}>
                {plant.ancient_uses[0]}
              </p>
              <p style={{ fontSize: "0.7rem", color: T.faint, lineHeight: 1.4, margin: "0.2rem 0 0" }}>
                {plant.growing_notes.split(".")[0]}.
              </p>
            </div>
          ))}
        </div>

        {/* ── Plant detail panel ── */}
        {selectedPlant && (
          <div
            style={{
              flex: "0 0 50%",
              borderLeft: `1px solid ${T.divider}`,
              padding: "1.25rem",
              overflowY: "auto",
              maxHeight: "calc(100vh - 280px)",
              background: T.surface,
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPlantId(null)}
              style={{
                float: "right",
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                color: T.muted,
                padding: "0.25rem",
              }}
            >
              x
            </button>

            {/* Overview */}
            <h2 style={{ fontFamily: T.serif, fontSize: "1.5rem", marginBottom: "0.15rem" }}>
              {selectedPlant.common_name}
            </h2>
            <p style={{ fontStyle: "italic", fontSize: "0.85rem", color: T.muted, marginBottom: "0.75rem" }}>
              {selectedPlant.latin_name}
            </p>

            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" as const,
                background: (DIFFICULTY_COLORS[selectedPlant.difficulty] ?? { bg: T.surface3 }).bg,
                color: (DIFFICULTY_COLORS[selectedPlant.difficulty] ?? { fg: T.muted }).fg,
                borderRadius: T.radiusFull, padding: "0.2rem 0.55rem",
              }}>
                {selectedPlant.difficulty}
              </span>
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" as const,
                background: (CATEGORY_COLORS[selectedPlant.category.toLowerCase()] ?? { bg: T.surface3 }).bg,
                color: (CATEGORY_COLORS[selectedPlant.category.toLowerCase()] ?? { fg: T.muted }).fg,
                borderRadius: T.radiusFull, padding: "0.2rem 0.55rem",
              }}>
                {selectedPlant.category}
              </span>
              {selectedPlant.traditions.map((trad) => (
                <span key={trad} style={{
                  fontSize: "0.65rem", fontWeight: 600, textTransform: "capitalize" as const,
                  color: TRADITION_COLORS[trad] ?? T.muted,
                  background: `${TRADITION_COLORS[trad] ?? T.muted}20`,
                  borderRadius: T.radiusFull, padding: "0.2rem 0.55rem",
                }}>
                  {trad}
                </span>
              ))}
            </div>

            {/* In the Ancient Garden */}
            <div style={{ marginBottom: "1.25rem" }}>
              <h3 style={{
                fontFamily: T.serif, fontSize: "1.1rem", color: T.terracotta,
                marginBottom: "0.5rem", borderBottom: `1px solid ${T.divider}`, paddingBottom: "0.3rem",
              }}>
                In the Ancient Garden
              </h3>
              <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                {selectedPlant.ancient_uses.map((use, i) => (
                  <li key={i} style={{ fontSize: "0.8rem", color: T.text, lineHeight: 1.6 }}>
                    {use}
                  </li>
                ))}
              </ul>
              {selectedPlant.sources.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: T.faint, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                    {t("Sources")}
                  </span>
                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                    {selectedPlant.sources.map((srcId) => {
                      const src = getSourceById(srcId);
                      return src ? (
                        <span key={srcId} style={{
                          fontSize: "0.68rem", color: T.primary,
                          background: T.primarySoft, borderRadius: T.radiusFull,
                          padding: "0.15rem 0.5rem",
                        }}>
                          {src.title}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* How to Grow Today */}
            <div style={{ marginBottom: "1.25rem" }}>
              <h3 style={{
                fontFamily: T.serif, fontSize: "1.1rem", color: T.accent,
                marginBottom: "0.5rem", borderBottom: `1px solid ${T.divider}`, paddingBottom: "0.3rem",
              }}>
                How to Grow Today
              </h3>
              <ul style={{ margin: 0, paddingLeft: "1.1rem", listStyle: "none" }}>
                <li style={{ fontSize: "0.8rem", lineHeight: 1.6, marginBottom: "0.25rem" }}>
                  <strong>Sun:</strong> {selectedPlant.sun}
                </li>
                <li style={{ fontSize: "0.8rem", lineHeight: 1.6, marginBottom: "0.25rem" }}>
                  <strong>Water:</strong> {selectedPlant.water}
                </li>
                <li style={{ fontSize: "0.8rem", lineHeight: 1.6, marginBottom: "0.25rem" }}>
                  <strong>Soil:</strong> {selectedPlant.soil}
                </li>
              </ul>
              <p style={{ fontSize: "0.8rem", color: T.text, lineHeight: 1.55, marginTop: "0.5rem" }}>
                {selectedPlant.growing_notes}
              </p>
            </div>

            {/* Beginner callout */}
            {selectedPlant.difficulty === "beginner" && (
              <div style={{
                background: "#d7e7d0",
                border: "1px solid #5d7d4a",
                borderRadius: T.radiusLg,
                padding: "0.75rem 1rem",
                marginBottom: "1.25rem",
              }}>
                <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#3a6a28", display: "block", marginBottom: "0.2rem" }}>
                  Good for New Gardeners!
                </span>
                <span style={{ fontSize: "0.75rem", color: "#3a6a28", lineHeight: 1.5 }}>
                  This plant is forgiving and well-suited to first-time growers. Ancient gardeners prized it for the same reason — it thrives with basic care.
                </span>
              </div>
            )}

            {/* Related techniques */}
            {relatedTechniques.length > 0 && (
              <div>
                <h3 style={{
                  fontFamily: T.serif, fontSize: "1.1rem", color: T.muted,
                  marginBottom: "0.5rem", borderBottom: `1px solid ${T.divider}`, paddingBottom: "0.3rem",
                }}>
                  Related Techniques
                </h3>
                {relatedTechniques.slice(0, 4).map((tech) => (
                  <div key={tech.id} style={{
                    background: T.surface2, borderRadius: T.radiusLg,
                    padding: "0.5rem 0.75rem", marginBottom: "0.35rem",
                    border: `1px solid ${T.divider}`,
                  }}>
                    <span style={{ fontWeight: 600, fontSize: "0.78rem" }}>{tech.name}</span>
                    <span style={{
                      fontSize: "0.6rem", fontWeight: 600, textTransform: "capitalize" as const,
                      color: TRADITION_COLORS[tech.tradition] ?? T.muted,
                      marginLeft: "0.4rem",
                    }}>
                      ({tech.tradition})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
