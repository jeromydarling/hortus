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

const demoWorkdays = [
  ...DEMO_COMMUNITY.workdays,
  {
    id: "wd-2",
    scheduledDate: new Date(Date.now() + 9 * 86400000).toISOString().split("T")[0],
    startTime: "10:00 AM",
    focus: "Compost turning and path weeding",
    rsvps: 2,
    weatherFlag: "Chance of afternoon rain — bring a tarp",
  },
];

type RsvpStatus = "attending" | "maybe" | "declined" | null;

export default function Workdays() {
  const { t } = useTranslation();
  const [rsvps, setRsvps] = useState<Record<string, RsvpStatus>>({});

  const handleRsvp = (id: string, status: RsvpStatus) => {
    setRsvps((prev) => ({ ...prev, [id]: prev[id] === status ? null : status }));
  };

  const rsvpBtn = (wdId: string, status: RsvpStatus, label: string, color: string) => {
    const active = rsvps[wdId] === status;
    return (
      <button
        onClick={() => handleRsvp(wdId, status)}
        style={{
          fontFamily: "Work Sans, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          padding: "6px 14px",
          borderRadius: 8,
          border: `1.5px solid ${color}`,
          backgroundColor: active ? color : "transparent",
          color: active ? "#fff" : color,
          cursor: "pointer",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: "100vh", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 28, margin: 0 }}>
          {t("community.workdays_title")}
        </h1>
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
          {t("community.schedule_workday")}
        </button>
      </div>

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {demoWorkdays.map((wd: any) => (
          <div
            key={wd.id}
            style={{
              backgroundColor: tokens.surface,
              borderRadius: 10,
              padding: 18,
              fontFamily: "Work Sans, sans-serif",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: tokens.muted }}>
                  {wd.scheduledDate} &middot; {wd.startTime}
                </p>
                <p style={{ margin: "6px 0 0", fontSize: 16, fontWeight: 600, color: tokens.text }}>
                  {wd.focus}
                </p>
              </div>
              <span style={{ fontSize: 13, color: tokens.muted }}>{t("community.rsvp_count", { count: wd.rsvps })}</span>
            </div>

            {wd.weatherFlag && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  backgroundColor: "#fdf5e6",
                  borderLeft: `3px solid ${tokens.warn}`,
                  fontSize: 13,
                  color: tokens.warn,
                }}
              >
                {wd.weatherFlag}
              </div>
            )}

            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              {rsvpBtn(wd.id, "attending", t("community.rsvp_attending"), tokens.primary)}
              {rsvpBtn(wd.id, "maybe", t("community.rsvp_maybe"), tokens.warn)}
              {rsvpBtn(wd.id, "declined", t("community.rsvp_declined"), tokens.muted)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
