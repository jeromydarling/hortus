// @ts-nocheck — Scaffold page
/**
 * GardenDetail — Single-garden detail view for coordinators.
 *
 * Shows member engagement, recent observations, NRI signals,
 * visit history, and provides a "Log Visit" action for the selected garden.
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

interface DemoMember {
  id: string;
  displayName: string;
  role: "coordinator" | "mentor" | "member";
  engagementScore: number;
  volunteerHoursYTD: number;
  lastActive: string;
}

interface DemoObservation {
  id: string;
  author: string;
  content: string;
  type: "note" | "voice" | "photo";
  createdAt: string;
}

interface DemoVisit {
  id: string;
  date: string;
  coordinator: string;
  duration: string;
  notes: string;
  gps: { lat: number; lng: number };
}

interface DemoSignal {
  personId: string;
  personName: string;
  type: "checkin" | "mentor_candidate" | "ready_for_more" | "overwhelm";
  reason: string;
}

const GARDEN = {
  id: "g3",
  name: "Cedar Heights Urban Farm",
  address: "1430 Cedar Ave, Minneapolis, MN 55404",
  phase: "firstSigns",
  weatherState: "protect" as const,
  weatherHeadline: "Wind advisory until 6 PM. Protect row covers.",
  healthScore: 65,
  hardinessZone: "4b",
  plotCount: 12,
  totalArea: "0.4 acres",
};

const MEMBERS: DemoMember[] = [
  { id: "m1", displayName: "Amara D.", role: "coordinator", engagementScore: 0.91, volunteerHoursYTD: 28, lastActive: "2026-04-08" },
  { id: "m2", displayName: "Marcus T.", role: "member", engagementScore: 0.22, volunteerHoursYTD: 3, lastActive: "2026-03-22" },
  { id: "m3", displayName: "Fatima A.", role: "mentor", engagementScore: 0.85, volunteerHoursYTD: 18, lastActive: "2026-04-07" },
  { id: "m4", displayName: "David K.", role: "member", engagementScore: 0.64, volunteerHoursYTD: 9, lastActive: "2026-04-05" },
  { id: "m5", displayName: "Sarah L.", role: "member", engagementScore: 0.73, volunteerHoursYTD: 11, lastActive: "2026-04-06" },
  { id: "m6", displayName: "Tomoko H.", role: "member", engagementScore: 0.55, volunteerHoursYTD: 6, lastActive: "2026-04-02" },
  { id: "m7", displayName: "Luis R.", role: "member", engagementScore: 0.38, volunteerHoursYTD: 4, lastActive: "2026-03-28" },
  { id: "m8", displayName: "Emily W.", role: "member", engagementScore: 0.47, volunteerHoursYTD: 5, lastActive: "2026-04-01" },
];

const OBSERVATIONS: DemoObservation[] = [
  { id: "o1", author: "Amara D.", content: "Row covers on beds 3-5 held through last night's wind. Lettuce looking strong.", type: "note", createdAt: "2026-04-08T14:30:00Z" },
  { id: "o2", author: "Fatima A.", content: "Compost pile at the north end is ready to turn. Temperature peaked last week.", type: "note", createdAt: "2026-04-07T09:15:00Z" },
  { id: "o3", author: "Sarah L.", content: "Spotted first earthworms in bed 7 while prepping for peas. Soil temp 43F.", type: "note", createdAt: "2026-04-06T16:00:00Z" },
  { id: "o4", author: "David K.", content: "Forsythia along the west fence is at about 60% bloom. Crocuses fully open.", type: "voice", createdAt: "2026-04-05T11:00:00Z" },
];

const NRI_SIGNALS: DemoSignal[] = [
  { personId: "m2", personName: "Marcus T.", type: "checkin", reason: "Marcus hasn't logged in 18 days and missed the last two workdays. May need a wellness check." },
  { personId: "m3", personName: "Fatima A.", type: "mentor_candidate", reason: "Fatima is in her third season with consistent records and high engagement. Ready to mentor." },
  { personId: "m7", personName: "Luis R.", type: "checkin", reason: "Luis's activity dropped significantly in March. Consider a casual outreach." },
];

const VISIT_HISTORY: DemoVisit[] = [
  { id: "v1", date: "2026-03-15", coordinator: "You", duration: "45 min", notes: "Spring assessment. Beds 1-4 need chip refresh. Irrigation lines checked.", gps: { lat: 44.9537, lng: -93.2477 } },
  { id: "v2", date: "2026-02-22", coordinator: "You", duration: "30 min", notes: "Winter check. Tool shed inventory complete. Ordered replacement hoses.", gps: { lat: 44.9537, lng: -93.2477 } },
  { id: "v3", date: "2026-01-10", coordinator: "Pat M.", duration: "20 min", notes: "Quick check on compost piles. All covered for winter.", gps: { lat: 44.9538, lng: -93.2476 } },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date("2026-04-09");
  return Math.max(0, Math.ceil((now.getTime() - d.getTime()) / 86_400_000));
}

function engagementDots(score: number) {
  const filled = Math.round(score * 5);
  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        marginRight: 2,
        backgroundColor: i < filled ? T.primary : "#ddd",
      }}
    />
  ));
}

function healthColor(score: number): string {
  if (score >= 75) return T.accent;
  if (score >= 50) return T.warn;
  return T.danger;
}

const roleBadgeColors: Record<string, { bg: string; text: string }> = {
  coordinator: { bg: T.primary, text: "#fff" },
  mentor: { bg: T.accent, text: "#fff" },
  member: { bg: "#e8e6e1", text: T.text },
};

const signalMeta: Record<string, { color: string; label: string }> = {
  checkin: { color: T.warn, label: "nri.signal_checkin" },
  mentor_candidate: { color: T.accent, label: "nri.signal_mentor" },
  ready_for_more: { color: T.primary, label: "nri.signal_ready" },
  overwhelm: { color: T.danger, label: "nri.signal_overwhelm" },
};

const obsTypeIcon: Record<string, string> = {
  note: "N",
  voice: "V",
  photo: "P",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GardenDetail() {
  const { t } = useTranslation();
  const [showLogVisit, setShowLogVisit] = useState(false);

  return (
    <div style={{ fontFamily: T.sans, color: T.text, background: T.bg, minHeight: "100vh" }}>
      {/* ── Header ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${T.accentSoft} 0%, ${T.primarySoft} 100%)`,
          padding: "1.5rem 1.25rem 1.25rem",
        }}
      >
        <p style={{ fontSize: "0.75rem", color: T.muted, margin: "0 0 0.25rem" }}>
          {t("coordinator.dashboard_title", "Coordinator Dashboard")} /
        </p>
        <h1 style={{ fontFamily: T.serif, fontSize: "1.6rem", lineHeight: 1.15, margin: "0 0 0.5rem" }}>
          {GARDEN.name}
        </h1>
        <p style={{ fontSize: "0.8rem", color: T.muted, margin: "0 0 0.75rem" }}>
          {GARDEN.address}
        </p>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Phase badge */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: T.radiusFull,
              background: `${T.primary}1f`,
              border: `1px solid ${T.primary}40`,
              color: T.primary,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {t(`phases.${GARDEN.phase}`)}
          </span>

          {/* Health score */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: T.radiusFull,
              background: `${healthColor(GARDEN.healthScore)}15`,
              color: healthColor(GARDEN.healthScore),
            }}
          >
            {t("coordinator.health_score", "Health")}: {GARDEN.healthScore}
          </span>

          {/* Zone */}
          <span style={{ fontSize: "0.75rem", color: T.muted }}>
            Zone {GARDEN.hardinessZone}
          </span>

          {/* Area */}
          <span style={{ fontSize: "0.75rem", color: T.muted }}>
            {GARDEN.totalArea}
          </span>
        </div>
      </div>

      <div style={{ padding: "1.25rem" }}>
        {/* ── Weather alert ── */}
        {GARDEN.weatherState !== "clear" && (
          <div
            style={{
              background: GARDEN.weatherState === "protect" ? T.dangerSoft : T.warnSoft,
              border: `1px solid ${GARDEN.weatherState === "protect" ? T.danger : T.warn}`,
              borderRadius: T.radiusLg,
              padding: "0.75rem 1rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
              marginBottom: "1rem",
            }}
          >
            <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 2 }}>
              {GARDEN.weatherState === "protect" ? "\u26A0\uFE0F" : "\u2601\uFE0F"}
            </span>
            <div>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: GARDEN.weatherState === "protect" ? T.danger : T.warn,
                  display: "block",
                  marginBottom: 2,
                }}
              >
                {t(`weather.state_${GARDEN.weatherState}`)}
              </span>
              <span style={{ fontSize: "0.8rem", color: T.muted }}>
                {GARDEN.weatherHeadline}
              </span>
            </div>
          </div>
        )}

        {/* ── Members ── */}
        <Section title={t("community.members", "Members")} count={MEMBERS.length}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {MEMBERS.map((m) => {
              const badge = roleBadgeColors[m.role] ?? roleBadgeColors.member;
              const daysInactive = daysSince(m.lastActive);
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0",
                    borderBottom: `1px solid ${T.divider}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{m.displayName}</span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: 10,
                        background: badge.bg,
                        color: badge.text,
                        textTransform: "capitalize",
                      }}
                    >
                      {t(`community.role_${m.role}`)}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>{engagementDots(m.engagementScore)}</div>
                    <span style={{ fontSize: "0.7rem", color: daysInactive > 7 ? T.warn : T.faint, minWidth: 40, textAlign: "right" }}>
                      {daysInactive === 0 ? t("common.today", "Today") : `${daysInactive}d`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Recent observations ── */}
        <Section title={t("coordinator.recent_observations", "Recent Observations")} count={OBSERVATIONS.length}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {OBSERVATIONS.map((obs) => (
              <div
                key={obs.id}
                style={{
                  padding: "0.65rem 0",
                  borderBottom: `1px solid ${T.divider}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: T.surface3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: T.muted,
                      flexShrink: 0,
                    }}
                  >
                    {obsTypeIcon[obs.type] ?? "?"}
                  </span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{obs.author}</span>
                  <span style={{ fontSize: "0.7rem", color: T.faint }}>
                    {daysSince(obs.createdAt.split("T")[0])}d {t("coordinator.ago", "ago")}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: T.muted, lineHeight: 1.5, paddingLeft: 26 }}>
                  {obs.content}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── NRI Signals ── */}
        <Section title={t("nri.signals", "NRI Signals")} count={NRI_SIGNALS.length}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {NRI_SIGNALS.map((sig, i) => {
              const meta = signalMeta[sig.type] ?? { color: T.muted, label: sig.type };
              return (
                <div
                  key={i}
                  style={{
                    background: T.surface2,
                    borderLeft: `4px solid ${meta.color}`,
                    borderRadius: T.radiusLg,
                    padding: "0.75rem 1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: T.radiusFull,
                        background: meta.color,
                        color: "#fff",
                      }}
                    >
                      {t(meta.label)}
                    </span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{sig.personName}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: T.muted, lineHeight: 1.5 }}>
                    {sig.reason}
                  </p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Visit History ── */}
        <Section title={t("coordinator.visit_history", "Visit History")} count={VISIT_HISTORY.length}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {VISIT_HISTORY.map((visit) => (
              <div
                key={visit.id}
                style={{
                  padding: "0.65rem 0",
                  borderBottom: `1px solid ${T.divider}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{visit.date}</span>
                    <span style={{ fontSize: "0.75rem", color: T.faint }}>{visit.coordinator}</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: T.muted }}>{visit.duration}</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: T.muted, lineHeight: 1.45 }}>
                  {visit.notes}
                </p>
                <span style={{ fontSize: "0.65rem", color: T.faint, marginTop: 2, display: "block" }}>
                  GPS: {visit.gps.lat.toFixed(4)}, {visit.gps.lng.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Log Visit button ── */}
        {!showLogVisit ? (
          <button
            onClick={() => setShowLogVisit(true)}
            style={{
              width: "100%",
              padding: "0.85rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              fontFamily: T.sans,
              background: T.primary,
              color: "#fff",
              border: "none",
              borderRadius: T.radiusLg,
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            {t("coordinator.log_visit", "Log Visit")}
          </button>
        ) : (
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusXl,
              padding: "1.25rem",
              marginTop: "0.5rem",
            }}
          >
            <h3 style={{ fontFamily: T.serif, fontSize: "1.1rem", margin: "0 0 1rem" }}>
              {t("coordinator.log_visit", "Log Visit")}
            </h3>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: T.muted, marginBottom: 4 }}>
                {t("coordinator.visit_notes", "Visit Notes")}
              </label>
              <textarea
                placeholder={t("coordinator.visit_notes_placeholder", "What did you observe or accomplish?")}
                style={{
                  width: "100%",
                  minHeight: 80,
                  padding: "0.65rem",
                  fontSize: "0.85rem",
                  fontFamily: T.sans,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusLg,
                  background: T.surface2,
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: T.muted, marginBottom: 4 }}>
                {t("coordinator.issues_flagged", "Issues Flagged")}
              </label>
              <input
                type="text"
                placeholder={t("coordinator.issues_placeholder", "Any issues to flag?")}
                style={{
                  width: "100%",
                  padding: "0.65rem",
                  fontSize: "0.85rem",
                  fontFamily: T.sans,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusLg,
                  background: T.surface2,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <p style={{ fontSize: "0.75rem", color: T.faint, margin: "0 0 0.75rem" }}>
              GPS: 44.9537, -93.2477 (auto-captured)
            </p>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setShowLogVisit(false)}
                style={{
                  flex: 1,
                  padding: "0.65rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  fontFamily: T.sans,
                  background: T.primary,
                  color: "#fff",
                  border: "none",
                  borderRadius: T.radiusLg,
                  cursor: "pointer",
                }}
              >
                {t("common.save", "Save")}
              </button>
              <button
                onClick={() => setShowLogVisit(false)}
                style={{
                  flex: 1,
                  padding: "0.65rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  fontFamily: T.sans,
                  background: "none",
                  color: T.muted,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusLg,
                  cursor: "pointer",
                }}
              >
                {t("common.cancel", "Cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared section wrapper
// ---------------------------------------------------------------------------

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusXl,
        padding: "1rem 1.25rem",
        marginBottom: "1.25rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
        <h2 style={{ fontFamily: T.serif, fontSize: "1.1rem", margin: 0 }}>{title}</h2>
        {count !== undefined && (
          <span style={{ fontSize: "0.75rem", color: T.faint }}>{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}
