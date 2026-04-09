// @ts-nocheck — Scaffold page
/**
 * RouteOptimizer — Daily visit route planner for coordinators.
 *
 * Prioritizes gardens needing visits by: days since last visit,
 * active alerts, and upcoming events. Supports drag-to-reorder
 * and shows estimated travel times between stops.
 */

import { useState, useCallback } from "react";
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

interface RouteStop {
  id: string;
  name: string;
  address: string;
  daysSinceVisit: number;
  alerts: number;
  upcomingEvent: string | null;
  priorityScore: number;
  estimatedVisitMin: number;
  travelMinToNext: number | null;
  gps: { lat: number; lng: number };
}

const INITIAL_STOPS: RouteStop[] = [
  {
    id: "g4",
    name: "St. Mark's Church Garden",
    address: "302 Elm St, St. Paul, MN",
    daysSinceVisit: 48,
    alerts: 1,
    upcomingEvent: null,
    priorityScore: 95,
    estimatedVisitMin: 30,
    travelMinToNext: 18,
    gps: { lat: 44.9425, lng: -93.1015 },
  },
  {
    id: "g3",
    name: "Cedar Heights Urban Farm",
    address: "1430 Cedar Ave, Minneapolis, MN",
    daysSinceVisit: 25,
    alerts: 2,
    upcomingEvent: "Workday Apr 12",
    priorityScore: 88,
    estimatedVisitMin: 45,
    travelMinToNext: 22,
    gps: { lat: 44.9537, lng: -93.2477 },
  },
  {
    id: "g2",
    name: "Riverside Community Garden",
    address: "200 River Rd, Burnsville, MN",
    daysSinceVisit: 12,
    alerts: 0,
    upcomingEvent: "Spring planting Apr 15",
    priorityScore: 55,
    estimatedVisitMin: 45,
    travelMinToNext: 15,
    gps: { lat: 44.7295, lng: -93.2810 },
  },
  {
    id: "g1",
    name: "Sundown Edge Co-op",
    address: "4821 Oak St, Savage, MN",
    daysSinceVisit: 8,
    alerts: 1,
    upcomingEvent: null,
    priorityScore: 42,
    estimatedVisitMin: 30,
    travelMinToNext: null,
    gps: { lat: 44.7260, lng: -93.3560 },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function priorityColor(score: number): string {
  if (score >= 80) return T.danger;
  if (score >= 50) return T.warn;
  return T.accent;
}

function priorityLabel(score: number): string {
  if (score >= 80) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RouteOptimizer() {
  const { t } = useTranslation();
  const [stops, setStops] = useState<RouteStop[]>(INITIAL_STOPS);
  const [routeStarted, setRouteStarted] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const totalVisitTime = stops.reduce((s, stop) => s + stop.estimatedVisitMin, 0);
  const totalTravelTime = stops.reduce((s, stop) => s + (stop.travelMinToNext ?? 0), 0);
  const totalTime = totalVisitTime + totalTravelTime;

  const moveStop = useCallback((fromIdx: number, toIdx: number) => {
    setStops((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, removed);
      return next;
    });
  }, []);

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
          {t("coordinator.route_title", "Route Planner")}
        </h1>
        <p style={{ fontSize: "0.875rem", color: T.muted, margin: 0 }}>
          {t("coordinator.route_subtitle", "Plan your garden visit route for today")}
        </p>
      </div>

      <div style={{ padding: "1.25rem" }}>
        {/* ── Summary bar ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.5rem",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: "0.65rem 0.85rem", textAlign: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: T.faint, display: "block", marginBottom: 2 }}>
              {t("coordinator.stops", "Stops")}
            </span>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: T.primary }}>{stops.length}</span>
          </div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: "0.65rem 0.85rem", textAlign: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: T.faint, display: "block", marginBottom: 2 }}>
              {t("coordinator.visit_time", "Visit Time")}
            </span>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: T.accent }}>{totalVisitTime}m</span>
          </div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: "0.65rem 0.85rem", textAlign: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: T.faint, display: "block", marginBottom: 2 }}>
              {t("coordinator.total_time", "Total")}
            </span>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: T.text }}>{Math.floor(totalTime / 60)}h {totalTime % 60}m</span>
          </div>
        </div>

        {/* ── Map placeholder ── */}
        <div
          style={{
            background: T.surface2,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "1.5rem 1.25rem",
            textAlign: "center",
            marginBottom: "1.25rem",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: T.primarySoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 0.75rem",
              fontSize: "1.2rem",
            }}
          >
            {"\uD83D\uDDFA\uFE0F"}
          </div>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: T.muted, margin: "0 0 0.25rem" }}>
            {t("coordinator.route_map", "Route Map")}
          </p>
          <p style={{ fontSize: "0.75rem", color: T.faint, margin: "0 0 1rem" }}>
            {t("coordinator.map_placeholder", "Map integration coming soon. Route pins will appear here.")}
          </p>

          {/* Mini route visualization */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
            {stops.map((stop, i) => (
              <div key={stop.id} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: T.primary,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      margin: "0 auto 2px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: "0.55rem", color: T.faint, display: "block", maxWidth: 50, lineHeight: 1.2 }}>
                    {stop.name.split(" ")[0]}
                  </span>
                </div>
                {i < stops.length - 1 && (
                  <div style={{ display: "flex", alignItems: "center", padding: "0 4px", marginBottom: 14 }}>
                    <div style={{ width: 24, height: 2, background: T.border }} />
                    <span style={{ fontSize: "0.55rem", color: T.faint, padding: "0 2px" }}>
                      {stop.travelMinToNext}m
                    </span>
                    <div style={{ width: 24, height: 2, background: T.border }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Route stops (drag-to-reorder) ── */}
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
              padding: "0.85rem 1.25rem",
              borderBottom: `1px solid ${T.divider}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ fontFamily: T.serif, fontSize: "1.1rem", margin: 0 }}>
              {t("coordinator.route_stops", "Route Stops")}
            </h2>
            <span style={{ fontSize: "0.7rem", color: T.faint }}>
              {t("coordinator.drag_to_reorder", "Drag to reorder")}
            </span>
          </div>

          <div style={{ padding: "0.25rem 0" }}>
            {stops.map((stop, i) => (
              <div key={stop.id}>
                <div
                  draggable
                  onDragStart={() => setDragIdx(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIdx !== null && dragIdx !== i) {
                      moveStop(dragIdx, i);
                    }
                    setDragIdx(null);
                  }}
                  onDragEnd={() => setDragIdx(null)}
                  style={{
                    padding: "1rem 1.25rem",
                    display: "flex",
                    gap: "0.85rem",
                    alignItems: "flex-start",
                    cursor: "grab",
                    opacity: dragIdx === i ? 0.5 : 1,
                    borderBottom: `1px solid ${T.divider}`,
                    transition: "opacity 0.15s ease",
                  }}
                >
                  {/* Stop number */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: T.primary,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* Stop details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: "0.9rem", display: "block", marginBottom: 2 }}>
                          {stop.name}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: T.faint }}>{stop.address}</span>
                      </div>
                      {/* Priority badge */}
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: T.radiusFull,
                          background: `${priorityColor(stop.priorityScore)}15`,
                          color: priorityColor(stop.priorityScore),
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          flexShrink: 0,
                        }}
                      >
                        {priorityLabel(stop.priorityScore)}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.65rem", marginTop: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: "0.7rem", color: T.muted }}>
                        {t("coordinator.last_visit", "Last visit")}: {stop.daysSinceVisit}d {t("coordinator.ago", "ago")}
                      </span>
                      {stop.alerts > 0 && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: T.radiusFull,
                            background: T.warnSoft,
                            color: T.warn,
                          }}
                        >
                          {stop.alerts} {stop.alerts === 1 ? "alert" : "alerts"}
                        </span>
                      )}
                      {stop.upcomingEvent && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            padding: "1px 6px",
                            borderRadius: T.radiusFull,
                            background: T.accentSoft,
                            color: T.accent,
                          }}
                        >
                          {stop.upcomingEvent}
                        </span>
                      )}
                      <span style={{ fontSize: "0.65rem", color: T.faint }}>
                        ~{stop.estimatedVisitMin} min visit
                      </span>
                    </div>
                  </div>

                  {/* Drag handle */}
                  <div style={{ flexShrink: 0, color: T.faint, fontSize: "1.1rem", cursor: "grab", lineHeight: 1, marginTop: 4 }}>
                    {"\u2261"}
                  </div>
                </div>

                {/* Travel time between stops */}
                {stop.travelMinToNext !== null && i < stops.length - 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.35rem 1.25rem 0.35rem 3.35rem",
                      color: T.faint,
                      fontSize: "0.7rem",
                    }}
                  >
                    <div style={{ flex: "0 0 1px", height: 16, background: T.border, marginLeft: 13 }} />
                    <span>{stop.travelMinToNext} min {t("coordinator.travel", "travel")}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Start route button ── */}
        <button
          onClick={() => setRouteStarted(!routeStarted)}
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1rem",
            fontWeight: 700,
            fontFamily: T.sans,
            background: routeStarted ? T.accent : T.primary,
            color: "#fff",
            border: "none",
            borderRadius: T.radiusLg,
            cursor: "pointer",
            boxShadow: T.shadowSm,
          }}
        >
          {routeStarted
            ? t("coordinator.route_active", "Route Active - Tap to End")
            : t("coordinator.start_route", "Start Route")
          }
        </button>

        {routeStarted && (
          <p style={{ fontSize: "0.75rem", color: T.accent, textAlign: "center", marginTop: "0.5rem", fontWeight: 600 }}>
            {t("coordinator.route_started_msg", "Route started. Navigate to your first stop.")}
          </p>
        )}
      </div>
    </div>
  );
}
