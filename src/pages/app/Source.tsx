/* eslint-disable @typescript-eslint/no-unused-vars */
import { useTranslation } from "react-i18next";

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

/* ── Crop pattern data (from seed pack JSON) ── */
const CROP_PATTERNS = [
  {
    id: "firstGarden",
    name: "Your First Garden",
    tagline: "Five easy wins to build your confidence.",
    cropCount: 5,
    zoneRange: "3\u20139",
    estimatedCost: "$5\u2013$15 in seeds",
  },
  {
    id: "saladEveryDay",
    name: "Salad Every Day",
    tagline: "Cut-and-come-again greens all season.",
    cropCount: 5,
    zoneRange: "3\u201310",
    estimatedCost: "$8\u2013$18 in seeds",
  },
  {
    id: "salsaGarden",
    name: "Salsa Garden",
    tagline: "Grow your own chips-and-dip night.",
    cropCount: 5,
    zoneRange: "4\u201310",
    estimatedCost: "$8\u2013$20 in seeds",
  },
  {
    id: "herbWindowsill",
    name: "Windowsill Herbs",
    tagline: "No yard? No problem.",
    cropCount: 5,
    zoneRange: "Any (indoor)",
    estimatedCost: "$5\u2013$12 in seeds + containers",
  },
  {
    id: "feedTheFamily",
    name: "Feed the Family",
    tagline: "Real food from real ground.",
    cropCount: 8,
    zoneRange: "3\u20139",
    estimatedCost: "$15\u2013$30 in seeds",
  },
  {
    id: "pollinatorPatch",
    name: "Pollinator Patch",
    tagline: "Feed the bees. They'll feed you back.",
    cropCount: 5,
    zoneRange: "3\u201310",
    estimatedCost: "$8\u2013$15 in seeds",
  },
];

const SEEDS_NOW_URL = "https://www.seedsnow.com";

export default function Source() {
  const { t } = useTranslation();

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
          {t("source.title")}
        </h1>
        <p
          style={{ fontSize: "0.8rem", color: T.muted, marginBottom: "1.25rem" }}
        >
          {t("source.subtitle")}
        </p>

        {/* ── Seeds Now featured section ── */}
        <div
          style={{
            background: T.accentSoft,
            border: `1px solid ${T.accent}`,
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
            {t("source.seeds_now")}
          </span>
          <p
            style={{
              fontFamily: T.serif,
              fontSize: "1.15rem",
              color: T.text,
              marginBottom: "0.5rem",
            }}
          >
            {t("source.seeds_now_description")}
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <a
              href={SEEDS_NOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                padding: "0.5rem 1rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                background: T.accent,
                color: "#fff",
                borderRadius: T.radiusFull,
                textDecoration: "none",
                fontFamily: T.sans,
                border: "none",
                cursor: "pointer",
              }}
            >
              {t("source.browse_all")} &rarr;
            </a>
            {["source.browse_vegetables", "source.browse_herbs", "source.browse_flowers"].map(
              (key) => (
                <button
                  key={key}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    border: `1.5px solid ${T.border}`,
                    borderRadius: T.radiusFull,
                    background: T.surface,
                    color: T.muted,
                    cursor: "pointer",
                    fontFamily: T.sans,
                  }}
                >
                  {t(key)}
                </button>
              ),
            )}
          </div>
        </div>

        {/* ── Crop patterns ── */}
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            color: T.faint,
            display: "block",
            marginBottom: "0.75rem",
          }}
        >
          {t("source.crop_patterns")}
        </span>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          {CROP_PATTERNS.map((pattern) => (
            <div
              key={pattern.id}
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusXl,
                padding: "1rem",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: T.text,
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                {pattern.name}
              </span>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: T.muted,
                  display: "block",
                  marginBottom: "0.5rem",
                  lineHeight: 1.4,
                }}
              >
                {pattern.tagline}
              </span>

              {/* Meta tags */}
              <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    padding: "0.15rem 0.5rem",
                    borderRadius: T.radiusFull,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    background: T.surface3,
                    color: T.muted,
                  }}
                >
                  {pattern.cropCount} crops
                </span>
                <span
                  style={{
                    padding: "0.15rem 0.5rem",
                    borderRadius: T.radiusFull,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    background: T.surface3,
                    color: T.muted,
                  }}
                >
                  {t("source.zone_range")}: {pattern.zoneRange}
                </span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: T.faint,
                  display: "block",
                  marginTop: "0.35rem",
                }}
              >
                {t("source.estimated_cost")}: {pattern.estimatedCost}
              </span>
            </div>
          ))}
        </div>

        {/* ── Browse all seeds link ── */}
        <div
          style={{
            background: T.accentSoft,
            border: `1px solid ${T.accent}`,
            borderRadius: T.radiusLg,
            padding: "0.75rem 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <span
            style={{ fontSize: "0.875rem", fontWeight: 600, color: T.accent }}
          >
            {t("source.browse_all")}
          </span>
          <a
            href={SEEDS_NOW_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "0.4rem 0.8rem",
              fontSize: 10,
              fontWeight: 700,
              background: T.accent,
              color: "#fff",
              border: "none",
              borderRadius: T.radiusFull,
              cursor: "pointer",
              fontFamily: T.sans,
              textDecoration: "none",
            }}
          >
            Seeds Now &rarr;
          </a>
        </div>

        {/* ── Local sources ── */}
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
            {t("source.local_sources")}
          </span>
          <p
            style={{
              fontSize: "0.875rem",
              color: T.muted,
              marginBottom: "0.75rem",
              lineHeight: 1.55,
            }}
          >
            {t("source.sourcing_preference")}: {t("source.preference_local")}
          </p>
          <button
            style={{
              padding: "0.6rem 1.25rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              border: `1.5px solid ${T.border}`,
              borderRadius: T.radiusFull,
              background: T.surface2,
              color: T.muted,
              cursor: "pointer",
              fontFamily: T.sans,
            }}
          >
            {t("source.find_local")}
          </button>
        </div>
      </div>
    </div>
  );
}
