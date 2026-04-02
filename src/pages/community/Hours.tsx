// @ts-nocheck — Scaffold page. Lovable rewrites from prototype HTML.
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DEMO_COMMUNITY } from "../../demo/fixture";

const tokens = {
  primary: "#0d6f74",
  accent: "#5d7d4a",
  warn: "#aa6d22",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  text: "#26231d",
  muted: "#706b63",
};

const activityKeys = ["activity_workday", "activity_tending", "activity_training", "activity_coordination", "activity_other"] as const;

interface HourEntry {
  id: string;
  activity: string;
  hours: number;
  notes: string;
  date: string;
}

const demoEntries: HourEntry[] = [
  { id: "h1", activity: "activity_workday", hours: 3, notes: "Spring bed prep workday", date: "2026-03-28" },
  { id: "h2", activity: "activity_tending", hours: 1.5, notes: "Watered beds, checked mulch depth", date: "2026-03-25" },
  { id: "h3", activity: "activity_coordination", hours: 1, notes: "Planned workday schedule with Maya", date: "2026-03-22" },
];

export default function Hours() {
  const { t } = useTranslation();
  const [activity, setActivity] = useState(activityKeys[0]);
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<HourEntry[]>(demoEntries);

  const totalYTD = DEMO_COMMUNITY.members.reduce((s, m) => s + m.volunteerHoursYTD, 0);

  const handleLog = () => {
    if (!hours) return;
    const entry: HourEntry = {
      id: `h-${Date.now()}`,
      activity,
      hours: parseFloat(hours),
      notes,
      date: new Date().toISOString().split("T")[0],
    };
    setEntries([entry, ...entries]);
    setHours("");
    setNotes("");
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "Work Sans, sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: tokens.muted,
    marginBottom: 4,
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "Work Sans, sans-serif",
    fontSize: 14,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: "100vh", padding: 24 }}>
      <h1 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 28, margin: 0 }}>
        {t("community.hours_title")}
      </h1>

      {/* Summary */}
      <div
        style={{
          marginTop: 16,
          backgroundColor: tokens.primary,
          color: "#fff",
          borderRadius: 12,
          padding: 20,
          fontFamily: "Work Sans, sans-serif",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>{t("community.volunteer_hours")} (YTD)</p>
        <p style={{ margin: "6px 0 0", fontSize: 36, fontWeight: 700, fontFamily: "Instrument Serif, serif" }}>{totalYTD}</p>
        <p style={{ margin: "2px 0 0", fontSize: 13, opacity: 0.7 }}>
          {t("community.member_count", { count: DEMO_COMMUNITY.members.length })}
        </p>
      </div>

      {/* Log form */}
      <div style={{ marginTop: 24, backgroundColor: tokens.surface, borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 20, margin: "0 0 16px" }}>
          {t("community.log_hours")}
        </h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 180px" }}>
            <label style={labelStyle}>{t("harvest.variety")}</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)} style={inputStyle}>
              {activityKeys.map((k) => (
                <option key={k} value={k}>
                  {t(`community.${k}`)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: "0 0 100px" }}>
            <label style={labelStyle}>{t("community.volunteer_hours")}</label>
            <input type="number" step="0.5" min="0" value={hours} onChange={(e) => setHours(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: "2 1 200px" }}>
            <label style={labelStyle}>{t("planner.notes")}</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <button
          onClick={handleLog}
          style={{
            marginTop: 14,
            fontFamily: "Work Sans, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            padding: "9px 22px",
            borderRadius: 8,
            border: "none",
            backgroundColor: tokens.primary,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {t("community.log_hours")}
        </button>
      </div>

      {/* Recent entries */}
      <h2 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 20, marginTop: 28, marginBottom: 12 }}>
        Recent Entries
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map((e) => (
          <div
            key={e.id}
            style={{
              backgroundColor: tokens.surface,
              borderRadius: 10,
              padding: 14,
              fontFamily: "Work Sans, sans-serif",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 10,
                  backgroundColor: tokens.accent,
                  color: "#fff",
                  marginRight: 8,
                }}
              >
                {t(`community.${e.activity}`)}
              </span>
              <span style={{ fontSize: 14, color: tokens.text }}>{e.notes}</span>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: tokens.primary }}>{e.hours}h</p>
              <p style={{ margin: 0, fontSize: 12, color: tokens.muted }}>{e.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
