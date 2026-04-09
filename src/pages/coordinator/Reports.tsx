/**
 * Reports — Grant-ready reporting for coordinators.
 *
 * Generates exportable reports with volunteer hours, food production,
 * engagement metrics, and garden activity summaries. Supports date range
 * filtering and PDF/CSV export.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const T = {
  primary: "#0d6f74",
  primarySoft: "#d7e7e6",
  accent: "#5d7d4a",
  accentSoft: "#dee7d8",
  warn: "#aa6d22",
  warnSoft: "#ecdcc3",
  danger: "#b5403a",
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

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const METRICS = {
  totalVolunteerHours: 482,
  foodProducedLbs: 1245,
  gardenersServed: 30,
  gardensActive: 4,
};

const MONTHLY_HOURS = [
  { month: "Jan", hours: 28 },
  { month: "Feb", hours: 35 },
  { month: "Mar", hours: 52 },
  { month: "Apr", hours: 68 },
  { month: "May", hours: 85 },
  { month: "Jun", hours: 72 },
  { month: "Jul", hours: 45 },
  { month: "Aug", hours: 38 },
  { month: "Sep", hours: 32 },
  { month: "Oct", hours: 18 },
  { month: "Nov", hours: 6 },
  { month: "Dec", hours: 3 },
];

const FOOD_BY_GARDEN = [
  { garden: "Sundown Edge Co-op", lbs: 285, color: T.primary },
  { garden: "Riverside Community", lbs: 520, color: T.accent },
  { garden: "Cedar Heights", lbs: 340, color: T.warn },
  { garden: "St. Mark's Church", lbs: 100, color: "#8b6f5c" },
];

const ENGAGEMENT_TREND = [
  { month: "Jan", score: 0.45 },
  { month: "Feb", score: 0.48 },
  { month: "Mar", score: 0.55 },
  { month: "Apr", score: 0.62 },
  { month: "May", score: 0.71 },
  { month: "Jun", score: 0.68 },
  { month: "Jul", score: 0.64 },
  { month: "Aug", score: 0.59 },
  { month: "Sep", score: 0.55 },
  { month: "Oct", score: 0.48 },
  { month: "Nov", score: 0.42 },
  { month: "Dec", score: 0.38 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function barHeight(value: number, max: number, maxPx: number): number {
  return Math.max(4, (value / max) * maxPx);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Reports() {
  const { t } = useTranslation();
  const [dateFrom, setDateFrom] = useState("2025-04-01");
  const [dateTo, setDateTo] = useState("2026-04-09");

  const maxHours = Math.max(...MONTHLY_HOURS.map((m) => m.hours));
  const maxFood = Math.max(...FOOD_BY_GARDEN.map((g) => g.lbs));

  return (
    <div style={{ fontFamily: T.sans, color: T.text, background: T.bg, minHeight: "100vh" }}>
      {/* ── Header ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${T.primarySoft} 0%, ${T.accentSoft} 100%)`,
          padding: "1.5rem 1.25rem 1.25rem",
        }}
      >
        <h1 style={{ fontFamily: T.serif, fontSize: "1.8rem", lineHeight: 1.15, margin: 0, marginBottom: "0.35rem" }}>
          {t("coordinator.reports_title", "Reports")}
        </h1>
        <p style={{ fontSize: "0.875rem", color: T.muted, margin: 0 }}>
          {t("coordinator.reports_subtitle", "Grant-ready metrics and exports")}
        </p>
      </div>

      <div style={{ padding: "1.25rem" }}>
        {/* ── Date range selector ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusLg,
            padding: "0.85rem 1rem",
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: T.muted }}>
            {t("coordinator.date_range", "Date Range")}:
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              padding: "4px 8px",
              fontSize: "0.8rem",
              fontFamily: T.sans,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              background: T.surface2,
              color: T.text,
            }}
          />
          <span style={{ fontSize: "0.8rem", color: T.faint }}>{t("coordinator.to", "to")}</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              padding: "4px 8px",
              fontSize: "0.8rem",
              fontFamily: T.sans,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              background: T.surface2,
              color: T.text,
            }}
          />
        </div>

        {/* ── Metrics cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}
        >
          <MetricCard
            label={t("coordinator.volunteer_hours", "Total Volunteer Hours")}
            value={METRICS.totalVolunteerHours.toLocaleString()}
            color={T.primary}
          />
          <MetricCard
            label={t("coordinator.food_produced", "Food Produced (lbs)")}
            value={METRICS.foodProducedLbs.toLocaleString()}
            color={T.accent}
          />
          <MetricCard
            label={t("coordinator.gardeners_served", "Gardeners Served")}
            value={String(METRICS.gardenersServed)}
            color={T.warn}
          />
          <MetricCard
            label={t("coordinator.gardens_active", "Gardens Active")}
            value={String(METRICS.gardensActive)}
            color={T.primary}
          />
        </div>

        {/* ── Export buttons ── */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.25rem",
          }}
        >
          <button
            style={{
              flex: 1,
              padding: "0.75rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              fontFamily: T.sans,
              background: T.primary,
              color: "#fff",
              border: "none",
              borderRadius: T.radiusLg,
              cursor: "pointer",
            }}
          >
            {t("coordinator.download_pdf", "Download PDF Report")}
          </button>
          <button
            style={{
              flex: 1,
              padding: "0.75rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              fontFamily: T.sans,
              background: "none",
              color: T.primary,
              border: `2px solid ${T.primary}`,
              borderRadius: T.radiusLg,
              cursor: "pointer",
            }}
          >
            {t("coordinator.download_csv", "Download CSV Data")}
          </button>
        </div>

        {/* ── Chart: Monthly Volunteer Hours ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "1.25rem",
            marginBottom: "1.25rem",
          }}
        >
          <h2 style={{ fontFamily: T.serif, fontSize: "1.1rem", margin: "0 0 1rem" }}>
            {t("coordinator.monthly_hours_chart", "Monthly Volunteer Hours")}
          </h2>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140 }}>
            {MONTHLY_HOURS.map((m) => (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "0.6rem", color: T.muted, marginBottom: 2 }}>
                  {m.hours}
                </span>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 28,
                    height: barHeight(m.hours, maxHours, 100),
                    background: `linear-gradient(180deg, ${T.primary} 0%, ${T.accent} 100%)`,
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.3s ease",
                  }}
                />
                <span style={{ fontSize: "0.55rem", color: T.faint, marginTop: 4 }}>{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Chart: Food Production by Garden ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "1.25rem",
            marginBottom: "1.25rem",
          }}
        >
          <h2 style={{ fontFamily: T.serif, fontSize: "1.1rem", margin: "0 0 1rem" }}>
            {t("coordinator.food_by_garden_chart", "Food Production by Garden")}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {FOOD_BY_GARDEN.map((g) => (
              <div key={g.garden}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{g.garden}</span>
                  <span style={{ fontSize: "0.8rem", color: T.muted }}>{g.lbs} lbs</span>
                </div>
                <div
                  style={{
                    height: 10,
                    background: T.surface3,
                    borderRadius: 5,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(g.lbs / maxFood) * 100}%`,
                      background: g.color,
                      borderRadius: 5,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: T.text }}>
              {t("coordinator.total_label", "Total")}: {FOOD_BY_GARDEN.reduce((s, g) => s + g.lbs, 0).toLocaleString()} lbs
            </span>
          </div>
        </div>

        {/* ── Chart: Engagement Trend ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "1.25rem",
          }}
        >
          <h2 style={{ fontFamily: T.serif, fontSize: "1.1rem", margin: "0 0 1rem" }}>
            {t("coordinator.engagement_trend_chart", "Engagement Trend")}
          </h2>

          {/* Line chart approximated with bars and a connecting visual */}
          <div style={{ position: "relative", height: 140 }}>
            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1.0].map((level) => (
              <div
                key={level}
                style={{
                  position: "absolute",
                  bottom: `${level * 100}%`,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: T.divider,
                }}
              />
            ))}

            {/* Data points */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: "100%", position: "relative", zIndex: 1 }}>
              {ENGAGEMENT_TREND.map((m) => {
                const height = m.score * 100;
                return (
                  <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: "0.55rem", color: T.muted, marginBottom: 2 }}>
                      {Math.round(m.score * 100)}%
                    </span>
                    <div
                      style={{
                        width: 8,
                        height: `${height}%`,
                        minHeight: 4,
                        background: m.score >= 0.6 ? T.accent : m.score >= 0.45 ? T.warn : T.danger,
                        borderRadius: 4,
                        transition: "height 0.3s ease",
                      }}
                    />
                    <span style={{ fontSize: "0.55rem", color: T.faint, marginTop: 4 }}>{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.85rem", justifyContent: "center" }}>
            <LegendItem color={T.accent} label={t("coordinator.high_engagement", "High (60%+)")} />
            <LegendItem color={T.warn} label={t("coordinator.moderate_engagement", "Moderate (45-60%)")} />
            <LegendItem color={T.danger} label={t("coordinator.low_engagement", "Low (<45%)")} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusLg,
        padding: "0.85rem 1rem",
        boxShadow: T.shadowSm,
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
          marginBottom: "0.3rem",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: "1.5rem", fontWeight: 700, color, display: "block", lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      <span style={{ fontSize: "0.65rem", color: T.muted }}>{label}</span>
    </div>
  );
}
