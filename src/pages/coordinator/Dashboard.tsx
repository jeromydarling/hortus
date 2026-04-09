/**
 * Coordinator Dashboard — Multi-garden management overview.
 *
 * For extension agents and community garden coordinators who oversee
 * multiple gardens and gardeners. Aggregates NRI signals, health scores,
 * visit history, and alerts across all gardens under the coordinator's care.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";

// ---------------------------------------------------------------------------
// Design tokens (shared across Hortus)
// ---------------------------------------------------------------------------

const T = {
  primary: "#0d6f74",
  primarySoft: "#d7e7e6",
  accent: "#5d7d4a",
  accentSoft: "#dee7d8",
  warn: "#aa6d22",
  warnSoft: "#ecdcc3",
  danger: "#b5403a",
  dangerSoft: "#f0d5d3",
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

interface DemoGarden {
  id: string;
  name: string;
  members: number;
  phase: string;
  lastVisit: string;
  alerts: number;
  healthScore: number;
  address: string;
  weatherState: "clear" | "caution" | "protect";
}

const DEMO_GARDENS: DemoGarden[] = [
  { id: "g1", name: "Sundown Edge Co-op", members: 6, phase: "firstSigns", lastVisit: "2026-04-01", alerts: 1, healthScore: 82, address: "4821 Oak St, Savage, MN", weatherState: "caution" },
  { id: "g2", name: "Riverside Community Garden", members: 12, phase: "preparation", lastVisit: "2026-03-28", alerts: 0, healthScore: 91, address: "200 River Rd, Burnsville, MN", weatherState: "clear" },
  { id: "g3", name: "Cedar Heights Urban Farm", members: 8, phase: "firstSigns", lastVisit: "2026-03-15", alerts: 2, healthScore: 65, address: "1430 Cedar Ave, Minneapolis, MN", weatherState: "protect" },
  { id: "g4", name: "St. Mark's Church Garden", members: 4, phase: "rest", lastVisit: "2026-02-20", alerts: 1, healthScore: 48, address: "302 Elm St, St. Paul, MN", weatherState: "clear" },
];

const NRI_SIGNALS_AGGREGATED = [
  { gardenId: "g3", gardenName: "Cedar Heights Urban Farm", type: "checkin" as const, person: "Marcus T.", reason: "Marcus hasn't logged in 18 days and missed the last two workdays." },
  { gardenId: "g1", gardenName: "Sundown Edge Co-op", type: "checkin" as const, person: "James K.", reason: "James's engagement score dropped below 0.2. May need a check-in." },
  { gardenId: "g3", gardenName: "Cedar Heights Urban Farm", type: "mentor_candidate" as const, person: "Amara D.", reason: "Amara is in her third season with consistent records. Ready to mentor." },
  { gardenId: "g2", gardenName: "Riverside Community Garden", type: "ready_for_more" as const, person: "Chen L.", reason: "Chen has maxed out their plot and expressed interest in a second bed." },
];

const VISITS_THIS_WEEK = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date("2026-04-09");
  return Math.max(0, Math.ceil((now.getTime() - d.getTime()) / 86_400_000));
}

function healthColor(score: number): string {
  if (score >= 75) return T.accent;
  if (score >= 50) return T.warn;
  return T.danger;
}

function healthLabel(score: number): string {
  if (score >= 75) return "Good";
  if (score >= 50) return "Fair";
  return "Needs Attention";
}

const signalMeta: Record<string, { color: string; label: string }> = {
  checkin: { color: T.warn, label: "nri.signal_checkin" },
  mentor_candidate: { color: T.accent, label: "nri.signal_mentor" },
  ready_for_more: { color: T.primary, label: "nri.signal_ready" },
  overwhelm: { color: T.danger, label: "nri.signal_overwhelm" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CoordinatorDashboard() {
  const { t } = useTranslation();
  const [selectedGarden, setSelectedGarden] = useState<string | null>(null);

  const totalGardeners = DEMO_GARDENS.reduce((s, g) => s + g.members, 0);
  const totalAlerts = DEMO_GARDENS.reduce((s, g) => s + g.alerts, 0);

  const filteredGardens = selectedGarden
    ? DEMO_GARDENS.filter((g) => g.id === selectedGarden)
    : DEMO_GARDENS;

  return (
    <div style={{ fontFamily: T.sans, color: T.text, background: T.bg, minHeight: "100vh" }}>
      {/* ── Header ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${T.primarySoft} 0%, ${T.accentSoft} 100%)`,
          padding: "1.5rem 1.25rem 1.25rem",
        }}
      >
        <h1
          style={{
            fontFamily: T.serif,
            fontSize: "1.8rem",
            lineHeight: 1.15,
            margin: 0,
            marginBottom: "0.35rem",
          }}
        >
          {t("coordinator.dashboard_title", "Coordinator Dashboard")}
        </h1>
        <p style={{ fontSize: "0.875rem", color: T.muted, margin: 0 }}>
          {t("coordinator.gardens_overview", "Managing {{count}} gardens", { count: DEMO_GARDENS.length })}
        </p>
      </div>

      <div style={{ padding: "1.25rem" }}>
        {/* ── Summary cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}
        >
          <SummaryCard
            label={t("coordinator.total_gardens", "Total Gardens")}
            value={String(DEMO_GARDENS.length)}
            color={T.primary}
          />
          <SummaryCard
            label={t("coordinator.total_gardeners", "Total Gardeners")}
            value={String(totalGardeners)}
            color={T.accent}
          />
          <SummaryCard
            label={t("coordinator.active_alerts", "Active Alerts")}
            value={String(totalAlerts)}
            color={totalAlerts > 0 ? T.warn : T.accent}
          />
          <SummaryCard
            label={t("coordinator.visits_this_week", "Visits This Week")}
            value={String(VISITS_THIS_WEEK)}
            color={T.primary}
          />
        </div>

        {/* ── NRI Signals (aggregated) ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            overflow: "hidden",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${T.primary}, color-mix(in srgb, ${T.primary} 70%, ${T.accent}))`,
              padding: "0.85rem 1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: T.serif, fontSize: "1.05rem", color: "#fff" }}>
              {t("nri.signals", "NRI Signals")}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,.7)",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              {NRI_SIGNALS_AGGREGATED.length} {t("coordinator.across_gardens", "across all gardens")}
            </span>
          </div>

          <div style={{ padding: "0.75rem 1.25rem" }}>
            {NRI_SIGNALS_AGGREGATED.map((sig, i) => {
              const meta = signalMeta[sig.type] ?? { color: T.muted, label: sig.type };
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "flex-start",
                    padding: "0.75rem 0",
                    borderBottom: i < NRI_SIGNALS_AGGREGATED.length - 1 ? `1px solid ${T.divider}` : "none",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: meta.color,
                      flexShrink: 0,
                      marginTop: 6,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 2 }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: T.text }}>
                        {sig.person}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: T.radiusFull,
                          background: `${meta.color}20`,
                          color: meta.color,
                        }}
                      >
                        {t(meta.label)}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: T.muted, lineHeight: 1.45 }}>
                      {sig.reason}
                    </p>
                    <span style={{ fontSize: "0.7rem", color: T.faint, marginTop: 2, display: "block" }}>
                      {sig.gardenName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Gardens list ── */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h2 style={{ fontFamily: T.serif, fontSize: "1.3rem", margin: 0 }}>
              {t("coordinator.gardens", "Gardens")}
            </h2>
            {selectedGarden && (
              <button
                onClick={() => setSelectedGarden(null)}
                style={{
                  fontSize: "0.75rem",
                  color: T.primary,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: T.sans,
                  fontWeight: 600,
                }}
              >
                {t("common.view_all", "View all")}
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filteredGardens.map((garden) => (
              <div
                key={garden.id}
                onClick={() => setSelectedGarden(garden.id)}
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderLeft: `4px solid ${healthColor(garden.healthScore)}`,
                  borderRadius: T.radiusLg,
                  padding: "1rem 1.25rem",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem", display: "block", marginBottom: 2 }}>
                      {garden.name}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: T.faint }}>{garden.address}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        color: healthColor(garden.healthScore),
                        display: "block",
                        lineHeight: 1,
                      }}
                    >
                      {garden.healthScore}
                    </span>
                    <span style={{ fontSize: "0.65rem", color: T.faint, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {healthLabel(garden.healthScore)}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                  {/* Phase badge */}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: T.radiusFull,
                      background: `${T.primary}15`,
                      color: T.primary,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t(`phases.${garden.phase}`)}
                  </span>

                  {/* Members */}
                  <span style={{ fontSize: "0.75rem", color: T.muted }}>
                    {garden.members} {t("coordinator.members_label", "members")}
                  </span>

                  {/* Last visit */}
                  <span style={{ fontSize: "0.75rem", color: T.muted }}>
                    {t("coordinator.last_visit", "Last visit")}: {daysSince(garden.lastVisit)}d {t("coordinator.ago", "ago")}
                  </span>

                  {/* Alerts */}
                  {garden.alerts > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: T.radiusFull,
                        background: T.warnSoft,
                        color: T.warn,
                      }}
                    >
                      {garden.alerts} {garden.alerts === 1 ? t("coordinator.alert", "alert") : t("coordinator.alerts_label", "alerts")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "1rem 1.25rem",
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
              marginBottom: "0.65rem",
            }}
          >
            {t("coordinator.quick_actions", "Quick Actions")}
          </span>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <ActionButton label={t("coordinator.plan_visit_route", "Plan Visit Route")} color={T.primary} />
            <ActionButton label={t("coordinator.send_broadcast", "Send Broadcast")} color={T.accent} />
            <ActionButton label={t("coordinator.generate_report", "Generate Report")} color={T.primary} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
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

function ActionButton({ label, color }: { label: string; color: string }) {
  return (
    <button
      style={{
        flex: "1 1 auto",
        minWidth: 120,
        padding: "0.6rem 0.85rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.03em",
        border: `1.5px solid ${color}`,
        borderRadius: T.radiusLg,
        background: `${color}10`,
        color,
        cursor: "pointer",
        fontFamily: T.sans,
        textAlign: "center",
        transition: "background 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}
