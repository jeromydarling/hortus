/**
 * VisitLog — GPS-verified visit tracking for coordinators.
 *
 * Allows coordinators to start visits with GPS capture, log notes and photos,
 * flag issues, and review visit history across all managed gardens.
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

const GARDENS = [
  { id: "g1", name: "Sundown Edge Co-op" },
  { id: "g2", name: "Riverside Community Garden" },
  { id: "g3", name: "Cedar Heights Urban Farm" },
  { id: "g4", name: "St. Mark's Church Garden" },
];

interface DemoVisit {
  id: string;
  gardenId: string;
  gardenName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  notes: string;
  issuesFlagged: string[];
  photos: number;
  gps: { lat: number; lng: number };
}

const VISIT_HISTORY: DemoVisit[] = [
  {
    id: "v1",
    gardenId: "g1",
    gardenName: "Sundown Edge Co-op",
    date: "2026-04-08",
    startTime: "9:15 AM",
    endTime: "10:00 AM",
    duration: "45 min",
    notes: "Bed prep underway. Chip layer on beds 1-2 refreshed. Discussed spring plan with Maya.",
    issuesFlagged: ["Irrigation valve on bed 3 needs replacement"],
    photos: 3,
    gps: { lat: 44.7260, lng: -93.3560 },
  },
  {
    id: "v2",
    gardenId: "g2",
    gardenName: "Riverside Community Garden",
    date: "2026-04-07",
    startTime: "10:30 AM",
    endTime: "11:15 AM",
    duration: "45 min",
    notes: "All beds prepped for spring. Tool inventory complete. Ordered new wheelbarrow.",
    issuesFlagged: [],
    photos: 1,
    gps: { lat: 44.7295, lng: -93.2810 },
  },
  {
    id: "v3",
    gardenId: "g3",
    gardenName: "Cedar Heights Urban Farm",
    date: "2026-04-04",
    startTime: "2:00 PM",
    endTime: "2:45 PM",
    duration: "45 min",
    notes: "Met with Amara about mentoring program. Wind damage to row covers on beds 3-5.",
    issuesFlagged: ["Row covers need repair", "Shed lock broken"],
    photos: 5,
    gps: { lat: 44.9537, lng: -93.2477 },
  },
  {
    id: "v4",
    gardenId: "g1",
    gardenName: "Sundown Edge Co-op",
    date: "2026-04-01",
    startTime: "8:45 AM",
    endTime: "9:30 AM",
    duration: "45 min",
    notes: "Spring assessment. Forsythia at 45% bloom. Soil still cool but workable.",
    issuesFlagged: [],
    photos: 2,
    gps: { lat: 44.7261, lng: -93.3559 },
  },
  {
    id: "v5",
    gardenId: "g4",
    gardenName: "St. Mark's Church Garden",
    date: "2026-03-28",
    startTime: "1:00 PM",
    endTime: "1:30 PM",
    duration: "30 min",
    notes: "Winter cleanup. Removed dead annuals. Garden still largely dormant.",
    issuesFlagged: ["Fence post leaning on south side"],
    photos: 0,
    gps: { lat: 44.9425, lng: -93.1015 },
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VisitLog() {
  const { t } = useTranslation();
  const [activeVisit, setActiveVisit] = useState(false);
  const [visitStartTime, setVisitStartTime] = useState<string | null>(null);
  const [selectedGarden, setSelectedGarden] = useState("");
  const [notes, setNotes] = useState("");
  const [issues, setIssues] = useState("");
  const [filterGarden, setFilterGarden] = useState<string>("all");

  const filteredHistory = filterGarden === "all"
    ? VISIT_HISTORY
    : VISIT_HISTORY.filter((v) => v.gardenId === filterGarden);

  function startVisit() {
    setActiveVisit(true);
    setVisitStartTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }

  function endVisit() {
    setActiveVisit(false);
    setVisitStartTime(null);
    setSelectedGarden("");
    setNotes("");
    setIssues("");
  }

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
          {t("coordinator.visit_log_title", "Visit Log")}
        </h1>
        <p style={{ fontSize: "0.875rem", color: T.muted, margin: 0 }}>
          {t("coordinator.visit_log_subtitle", "GPS-verified garden visit tracking")}
        </p>
      </div>

      <div style={{ padding: "1.25rem" }}>
        {/* ── Active visit / Start visit ── */}
        {!activeVisit ? (
          <button
            onClick={startVisit}
            style={{
              width: "100%",
              padding: "1rem",
              fontSize: "1rem",
              fontWeight: 700,
              fontFamily: T.sans,
              background: T.primary,
              color: "#fff",
              border: "none",
              borderRadius: T.radiusLg,
              cursor: "pointer",
              marginBottom: "1.25rem",
              boxShadow: T.shadowSm,
            }}
          >
            {t("coordinator.start_visit", "Start Visit")}
          </button>
        ) : (
          <div
            style={{
              background: T.surface,
              border: `2px solid ${T.primary}`,
              borderRadius: T.radiusXl,
              padding: "1.25rem",
              marginBottom: "1.25rem",
            }}
          >
            {/* Active visit indicator */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: T.danger,
                    display: "inline-block",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: T.primary }}>
                  {t("coordinator.visit_in_progress", "Visit in Progress")}
                </span>
              </div>
              <span style={{ fontSize: "0.8rem", color: T.muted }}>
                {t("coordinator.started_at", "Started")}: {visitStartTime}
              </span>
            </div>

            {/* GPS capture */}
            <div
              style={{
                background: T.primarySoft,
                borderRadius: T.radiusLg,
                padding: "0.65rem 0.85rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: T.primary, fontWeight: 600 }}>
                GPS {t("coordinator.captured", "captured")}:
              </span>
              <span style={{ fontSize: "0.75rem", color: T.muted }}>
                44.7260, -93.3560
              </span>
              <span style={{ fontSize: "0.65rem", color: T.faint, marginLeft: "auto" }}>
                +/- 5m
              </span>
            </div>

            {/* Garden select */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: T.muted, marginBottom: 4 }}>
                {t("coordinator.select_garden", "Garden")}
              </label>
              <select
                value={selectedGarden}
                onChange={(e) => setSelectedGarden(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem",
                  fontSize: "0.85rem",
                  fontFamily: T.sans,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusLg,
                  background: T.surface2,
                  color: T.text,
                  boxSizing: "border-box",
                }}
              >
                <option value="">{t("coordinator.choose_garden", "Choose garden...")}</option>
                {GARDENS.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: T.muted, marginBottom: 4 }}>
                {t("coordinator.visit_notes", "Notes")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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

            {/* Photo upload */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: T.muted, marginBottom: 4 }}>
                {t("coordinator.photos", "Photos")}
              </label>
              <div
                style={{
                  border: `2px dashed ${T.border}`,
                  borderRadius: T.radiusLg,
                  padding: "1.25rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: T.surface2,
                }}
              >
                <span style={{ fontSize: "0.8rem", color: T.faint }}>
                  {t("coordinator.tap_to_upload", "Tap to add photos")}
                </span>
              </div>
            </div>

            {/* Issues flagged */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: T.muted, marginBottom: 4 }}>
                {t("coordinator.issues_flagged", "Issues Flagged")}
              </label>
              <input
                type="text"
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
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

            {/* End visit */}
            <button
              onClick={endVisit}
              style={{
                width: "100%",
                padding: "0.85rem",
                fontSize: "0.9rem",
                fontWeight: 700,
                fontFamily: T.sans,
                background: T.accent,
                color: "#fff",
                border: "none",
                borderRadius: T.radiusLg,
                cursor: "pointer",
              }}
            >
              {t("coordinator.end_visit", "End Visit & Save")}
            </button>
          </div>
        )}

        {/* ── Map placeholder ── */}
        <div
          style={{
            background: T.surface2,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "2rem 1.25rem",
            textAlign: "center",
            marginBottom: "1.25rem",
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
            {t("coordinator.visit_map", "Visit Locations Map")}
          </p>
          <p style={{ fontSize: "0.75rem", color: T.faint, margin: 0 }}>
            {t("coordinator.map_placeholder", "Map integration coming soon. Visit pins will appear here.")}
          </p>

          {/* Mini visit pin markers */}
          <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginTop: "1rem" }}>
            {VISIT_HISTORY.slice(0, 4).map((v) => (
              <div key={v.id} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: T.primary,
                    margin: "0 auto 4px",
                    border: "2px solid #fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  }}
                />
                <span style={{ fontSize: "0.6rem", color: T.faint }}>{v.gardenName.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Visit History ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.85rem 1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${T.divider}`,
            }}
          >
            <h2 style={{ fontFamily: T.serif, fontSize: "1.1rem", margin: 0 }}>
              {t("coordinator.visit_history", "Visit History")}
            </h2>
            <select
              value={filterGarden}
              onChange={(e) => setFilterGarden(e.target.value)}
              style={{
                padding: "4px 8px",
                fontSize: "0.75rem",
                fontFamily: T.sans,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                background: T.surface2,
                color: T.text,
              }}
            >
              <option value="all">{t("coordinator.all_gardens", "All gardens")}</option>
              {GARDENS.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div style={{ padding: "0.5rem 1.25rem" }}>
            {filteredHistory.map((visit, i) => (
              <div
                key={visit.id}
                style={{
                  padding: "0.85rem 0",
                  borderBottom: i < filteredHistory.length - 1 ? `1px solid ${T.divider}` : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", display: "block" }}>{visit.gardenName}</span>
                    <span style={{ fontSize: "0.75rem", color: T.faint }}>
                      {visit.date} &middot; {visit.startTime} - {visit.endTime} ({visit.duration})
                    </span>
                  </div>
                  {visit.photos > 0 && (
                    <span style={{ fontSize: "0.7rem", color: T.muted, background: T.surface3, padding: "2px 6px", borderRadius: 6 }}>
                      {visit.photos} {t("coordinator.photos_label", "photos")}
                    </span>
                  )}
                </div>
                <p style={{ margin: "4px 0", fontSize: "0.8rem", color: T.muted, lineHeight: 1.45 }}>
                  {visit.notes}
                </p>
                {visit.issuesFlagged.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    {visit.issuesFlagged.map((issue, j) => (
                      <span
                        key={j}
                        style={{
                          display: "inline-block",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: T.radiusFull,
                          background: T.warnSoft,
                          color: T.warn,
                          marginRight: 4,
                          marginTop: 2,
                        }}
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                )}
                <span style={{ fontSize: "0.65rem", color: T.faint, display: "block", marginTop: 4 }}>
                  GPS: {visit.gps.lat.toFixed(4)}, {visit.gps.lng.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
