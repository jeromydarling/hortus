// @ts-nocheck — Scaffold page. Lovable rewrites from prototype HTML.
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const tokens = {
  primary: "#0d6f74",
  accent: "#5d7d4a",
  warn: "#aa6d22",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  text: "#26231d",
  muted: "#706b63",
};

interface PhenologyEvent {
  id: string;
  species: string;
  phenophase: string;
  date: string;
  firstOfSeason: boolean;
  daysVsLastYear?: number; // negative = earlier, positive = later
}

const demoEvents: PhenologyEvent[] = [
  { id: "pe1", species: "Forsythia", phenophase: "50% bloom", date: "2026-03-30", firstOfSeason: false, daysVsLastYear: -3 },
  { id: "pe2", species: "Red-winged Blackbird", phenophase: "First song", date: "2026-03-25", firstOfSeason: true, daysVsLastYear: 2 },
  { id: "pe3", species: "Crocus", phenophase: "First bloom", date: "2026-03-20", firstOfSeason: true, daysVsLastYear: -5 },
  { id: "pe4", species: "Sugar Maple", phenophase: "Bud swell", date: "2026-03-18", firstOfSeason: true },
  { id: "pe5", species: "Earthworm", phenophase: "First surface activity", date: "2026-03-14", firstOfSeason: true, daysVsLastYear: -1 },
];

const phenophases = [
  "First bloom", "50% bloom", "Full bloom", "Leaf out", "Bud swell",
  "First song", "First sighting", "First surface activity", "Seed set", "Leaf drop",
];

export default function Phenology() {
  const { t } = useTranslation();
  const [species, setSpecies] = useState("");
  const [phenophase, setPhenophase] = useState(phenophases[0]);
  const [events, setEvents] = useState<PhenologyEvent[]>(demoEvents);
  const streakDays = 7; // demo

  const handleLog = () => {
    if (!species) return;
    const ev: PhenologyEvent = {
      id: `pe-${Date.now()}`,
      species,
      phenophase,
      date: new Date().toISOString().split("T")[0],
      firstOfSeason: !events.some((e) => e.species === species && e.phenophase === phenophase),
    };
    setEvents([ev, ...events]);
    setSpecies("");
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
        {t("phenology.title")}
      </h1>
      <p style={{ fontFamily: "Work Sans, sans-serif", color: tokens.muted, fontSize: 14, marginTop: 4 }}>
        {t("phenology.subtitle")}
      </p>

      {/* Streak counter */}
      <div
        style={{
          marginTop: 18,
          backgroundColor: tokens.primary,
          color: "#fff",
          borderRadius: 14,
          padding: 24,
          textAlign: "center",
          fontFamily: "Work Sans, sans-serif",
        }}
      >
        <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>{t("phenology.observation_streak")}</p>
        <p style={{ margin: "6px 0 0", fontSize: 44, fontWeight: 700, fontFamily: "Instrument Serif, serif" }}>
          {streakDays}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 13, opacity: 0.7 }}>
          {t("phenology.streak_message", { count: streakDays })}
        </p>
      </div>

      {/* Log form */}
      <div style={{ marginTop: 24, backgroundColor: tokens.surface, borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 20, margin: "0 0 14px" }}>
          {t("phenology.log_event")}
        </h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 180px" }}>
            <label style={labelStyle}>{t("phenology.species")}</label>
            <input value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="e.g. Forsythia" style={inputStyle} />
          </div>
          <div style={{ flex: "1 1 180px" }}>
            <label style={labelStyle}>{t("phenology.phenophase")}</label>
            <select value={phenophase} onChange={(e) => setPhenophase(e.target.value)} style={inputStyle}>
              {phenophases.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
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
          {t("phenology.log_event")}
        </button>
      </div>

      {/* Timeline */}
      <h2 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 20, marginTop: 28, marginBottom: 12 }}>
        {t("succession.timeline")}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {events.map((ev, i) => (
          <div key={ev.id} style={{ display: "flex", gap: 14 }}>
            {/* Timeline line */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: ev.firstOfSeason ? tokens.warn : tokens.accent,
                  border: ev.firstOfSeason ? `2px solid ${tokens.warn}` : "none",
                  flexShrink: 0,
                  marginTop: 4,
                }}
              />
              {i < events.length - 1 && (
                <div style={{ width: 2, flex: 1, backgroundColor: "#ddd", minHeight: 40 }} />
              )}
            </div>

            {/* Event card */}
            <div
              style={{
                flex: 1,
                backgroundColor: tokens.surface,
                borderRadius: 10,
                padding: 14,
                marginBottom: 10,
                fontFamily: "Work Sans, sans-serif",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: tokens.text }}>{ev.species}</span>
                <span style={{ fontSize: 13, color: tokens.muted }}>{ev.phenophase}</span>
                {ev.firstOfSeason && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 10,
                      backgroundColor: tokens.warn,
                      color: "#fff",
                    }}
                  >
                    {t("phenology.first_of_season")}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 12, color: tokens.muted }}>
                <span>{ev.date}</span>
                {ev.daysVsLastYear !== undefined && (
                  <span style={{ color: ev.daysVsLastYear < 0 ? tokens.accent : tokens.warn }}>
                    {ev.daysVsLastYear < 0
                      ? t("phenology.earlier_than_last", { days: Math.abs(ev.daysVsLastYear) })
                      : t("phenology.later_than_last", { days: ev.daysVsLastYear })}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
