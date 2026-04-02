import { useState } from "react";
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
  shadowSm: "0 1px 3px rgba(30,25,18,.05),0 6px 18px rgba(30,25,18,.04)",
};

type LangMode = "plain" | "gardener" | "source";

const SOIL_KEYS: {
  key: keyof typeof DEMO_FIXTURE.land.soilProfile;
  labelKey: string;
  descKey: string;
}[] = [
  { key: "texture", labelKey: "loam.texture", descKey: "loam.texture_description" },
  { key: "drainage", labelKey: "loam.drainage", descKey: "loam.drainage_description" },
  { key: "pH", labelKey: "loam.ph", descKey: "loam.ph_description" },
  { key: "organicMatter", labelKey: "loam.organic_matter", descKey: "loam.organic_matter_description" },
  { key: "depth", labelKey: "loam.depth", descKey: "loam.depth_description" },
  { key: "slope", labelKey: "loam.slope", descKey: "loam.slope_description" },
  { key: "waterHolding", labelKey: "loam.water_holding", descKey: "loam.water_holding_description" },
  { key: "workability", labelKey: "loam.workability", descKey: "loam.workability_description" },
  { key: "floodRisk", labelKey: "loam.flood_risk", descKey: "loam.flood_risk_description" },
];

export default function LoamMap() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<LangMode>("plain");

  const land = DEMO_FIXTURE.land;
  const soil = land.soilProfile;

  const tabs: { id: LangMode; labelKey: string }[] = [
    { id: "plain", labelKey: "loam.tab_plain" },
    { id: "gardener", labelKey: "loam.tab_gardener" },
    { id: "source", labelKey: "loam.tab_source" },
  ];

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
          {t("loam.title")}
        </h1>
        <p
          style={{
            fontSize: "0.8rem",
            color: T.muted,
            marginBottom: "1.25rem",
          }}
        >
          {t("loam.subtitle")}
        </p>

        {/* ── Trilingual tabs ── */}
        <div
          style={{
            display: "flex",
            gap: 2,
            background: T.surface3,
            borderRadius: T.radiusLg,
            padding: 3,
            marginBottom: "1.25rem",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              style={{
                flex: 1,
                padding: "0.5rem",
                textAlign: "center",
                fontSize: "0.8rem",
                fontWeight: 600,
                fontFamily: T.sans,
                color: mode === tab.id ? T.text : T.muted,
                background: mode === tab.id ? T.surface : "transparent",
                borderRadius: T.radiusMd,
                border: "none",
                cursor: "pointer",
                boxShadow: mode === tab.id ? T.shadowSm : "none",
              }}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {/* ── Soil attribute grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          {SOIL_KEYS.map((attr) => {
            const entry = soil[attr.key] as Record<string, string>;
            const value = entry[mode] ?? entry.plain ?? "";
            return (
              <div
                key={attr.key}
                style={{
                  background: T.surface2,
                  borderRadius: T.radiusMd,
                  padding: "0.75rem",
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
                  {t(attr.labelKey)}
                </span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: T.text,
                    display: "block",
                    lineHeight: 1.4,
                  }}
                >
                  {value}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Sun exposure ── */}
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
            {t("loam.sun_exposure")}
          </span>
          <span
            style={{
              fontFamily: T.serif,
              fontSize: "1.15rem",
              color: T.text,
              display: "block",
              marginBottom: "0.25rem",
            }}
          >
            {land.sunExposure.hoursEstimate}h {t("loam.sun_exposure_description")}
          </span>
          <span style={{ fontSize: "0.8rem", color: T.muted }}>
            {land.sunExposure.bestSpot}
          </span>
        </div>

        {/* ── Hardiness zone + frost dates ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "1.25rem",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.09em",
                textTransform: "uppercase" as const,
                color: T.faint,
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              {t("loam.hardiness_zone")}
            </span>
            <span
              style={{
                fontFamily: T.serif,
                fontSize: "1.15rem",
                color: T.text,
              }}
            >
              {t("loam.hardiness_zone_description")}: {land.hardinessZone}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                background: T.surface2,
                borderRadius: T.radiusMd,
                padding: "0.75rem",
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
                {t("loam.last_spring_frost")}
              </span>
              <span
                style={{ fontSize: "0.875rem", fontWeight: 600, color: T.text }}
              >
                {land.frostDates.lastSpring}
              </span>
            </div>

            <div
              style={{
                background: T.surface2,
                borderRadius: T.radiusMd,
                padding: "0.75rem",
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
                {t("loam.first_fall_frost")}
              </span>
              <span
                style={{ fontSize: "0.875rem", fontWeight: 600, color: T.text }}
              >
                {land.frostDates.firstFall}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
