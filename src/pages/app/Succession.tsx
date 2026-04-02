import React from "react";
import { useTranslation } from "react-i18next";
import { DEMO_FIXTURE } from "../../demo/fixture";

const tokens = {
  primary: "#0d6f74",
  accent: "#5d7d4a",
  warn: "#aa6d22",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  text: "#26231d",
  muted: "#706b63",
};

interface Succession {
  id: string;
  bed: string;
  cropOut: string;
  cropIn: string;
  transitionDate: string;
  hasGap: boolean;
  gapDays?: number;
}

const demoSuccessions: Succession[] = [
  { id: "s1", bed: "Bed 1", cropOut: "Sugar Snap Peas", cropIn: "Bush Beans", transitionDate: "2026-07-01", hasGap: false },
  { id: "s2", bed: "Bed 1", cropOut: "Lettuce mix", cropIn: "Fall Spinach", transitionDate: "2026-08-15", hasGap: true, gapDays: 12 },
  { id: "s3", bed: "Bed 2", cropOut: "Tomatoes", cropIn: "Garlic", transitionDate: "2026-10-15", hasGap: false },
  { id: "s4", bed: "Bed 2", cropOut: "Basil", cropIn: "Cover Crop (Rye)", transitionDate: "2026-09-20", hasGap: false },
];

const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

// Simple timeline helpers
const dateToProgress = (dateStr: string) => {
  const d = new Date(dateStr);
  const start = new Date("2026-04-01").getTime();
  const end = new Date("2026-10-31").getTime();
  return Math.max(0, Math.min(100, ((d.getTime() - start) / (end - start)) * 100));
};

export default function Succession() {
  const { t } = useTranslation();
  const gaps = demoSuccessions.filter((s) => s.hasGap);

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: "100vh", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 28, margin: 0 }}>
            {t("succession.title")}
          </h1>
          <p style={{ fontFamily: "Work Sans, sans-serif", color: tokens.muted, fontSize: 14, marginTop: 4 }}>
            {t("succession.subtitle")}
          </p>
        </div>
        <button
          style={{
            fontFamily: "Work Sans, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            padding: "8px 18px",
            borderRadius: 8,
            border: "none",
            backgroundColor: tokens.primary,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {t("succession.add_succession")}
        </button>
      </div>

      {/* Timeline visualization */}
      <div style={{ marginTop: 24, backgroundColor: tokens.surface, borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 20, margin: "0 0 16px" }}>
          {t("succession.timeline")}
        </h2>

        {/* Month headers */}
        <div style={{ display: "flex", marginBottom: 8, paddingLeft: 80 }}>
          {months.map((m) => (
            <div
              key={m}
              style={{
                flex: 1,
                fontFamily: "Work Sans, sans-serif",
                fontSize: 11,
                color: tokens.muted,
                textAlign: "center",
              }}
            >
              {m}
            </div>
          ))}
        </div>

        {/* Bed rows */}
        {DEMO_FIXTURE.plots.map((plot) => {
          const successions = demoSuccessions.filter((s) => s.bed === plot.name);
          return (
            <div key={plot.id} style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <div
                style={{
                  width: 80,
                  flexShrink: 0,
                  fontFamily: "Work Sans, sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: tokens.text,
                }}
              >
                {plot.name}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 28,
                  backgroundColor: "#eae8e3",
                  borderRadius: 6,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {successions.map((s) => {
                  const pos = dateToProgress(s.transitionDate);
                  return (
                    <div
                      key={s.id}
                      style={{
                        position: "absolute",
                        left: `${pos - 1}%`,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        backgroundColor: s.hasGap ? tokens.warn : tokens.primary,
                      }}
                      title={`${s.cropOut} → ${s.cropIn}`}
                    />
                  );
                })}
                {/* Crop segments (simplified) */}
                {plot.crops.map((crop, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${i * 25}%`,
                      top: 4,
                      bottom: 4,
                      width: "22%",
                      backgroundColor: tokens.accent,
                      opacity: 0.3,
                      borderRadius: 4,
                    }}
                    title={crop.cropName}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gap alerts */}
      {gaps.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2 style={{ fontFamily: "Instrument Serif, serif", color: tokens.warn, fontSize: 20, marginBottom: 10 }}>
            {t("succession.gap_alert")}
          </h2>
          {gaps.map((g) => (
            <div
              key={g.id}
              style={{
                backgroundColor: "#fdf5e6",
                borderLeft: `4px solid ${tokens.warn}`,
                borderRadius: 10,
                padding: 14,
                marginBottom: 10,
                fontFamily: "Work Sans, sans-serif",
              }}
            >
              <p style={{ margin: 0, fontSize: 14, color: tokens.warn, fontWeight: 600 }}>
                {t("succession.gap_description", { bed: g.bed, days: g.gapDays })}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: tokens.muted }}>
                {g.cropOut} finishes before {g.cropIn} is ready
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Transition cards */}
      <h2 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 20, marginTop: 24, marginBottom: 12 }}>
        Transitions
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {demoSuccessions.map((s) => (
          <div
            key={s.id}
            style={{
              backgroundColor: tokens.surface,
              borderRadius: 10,
              padding: 16,
              fontFamily: "Work Sans, sans-serif",
              borderLeft: s.hasGap ? `4px solid ${tokens.warn}` : `4px solid ${tokens.accent}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: tokens.text }}>{s.bed}</span>
              <span style={{ fontSize: 12, color: tokens.muted }}>{s.transitionDate}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 14, color: tokens.muted }}>{s.cropOut}</span>
              <span style={{ fontSize: 16, color: tokens.primary }}>→</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: tokens.text }}>{s.cropIn}</span>
            </div>
            {s.hasGap && (
              <p style={{ margin: "6px 0 0", fontSize: 12, color: tokens.warn, fontWeight: 600 }}>
                {t("succession.gap_alert")} — {s.gapDays} days
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
