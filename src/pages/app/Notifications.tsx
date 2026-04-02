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

interface NotificationCategory {
  key: string;
  labelKey: string;
  defaultOn: boolean;
}

const categories: NotificationCategory[] = [
  { key: "weather", labelKey: "settings.notification_weather", defaultOn: true },
  { key: "nri", labelKey: "settings.notification_nri", defaultOn: true },
  { key: "observation", labelKey: "settings.notification_observation", defaultOn: false },
  { key: "community", labelKey: "settings.notification_community", defaultOn: true },
  { key: "growing", labelKey: "settings.notification_growing", defaultOn: true },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 48,
        height: 26,
        borderRadius: 13,
        border: "none",
        backgroundColor: on ? tokens.primary : "#d1cfc9",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 24 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      />
    </button>
  );
}

export default function Notifications() {
  const { t } = useTranslation();
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((c) => [c.key, c.defaultOn]))
  );

  const handleToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: "100vh", padding: 24 }}>
      <h1 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 28, margin: 0 }}>
        {t("settings.notifications")}
      </h1>
      <p style={{ fontFamily: "Work Sans, sans-serif", color: tokens.muted, fontSize: 14, marginTop: 4 }}>
        {t("settings.title")}
      </p>

      {/* Category toggles */}
      <div
        style={{
          marginTop: 24,
          backgroundColor: tokens.surface,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {categories.map((cat, i) => (
          <div
            key={cat.key}
            style={{
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: i > 0 ? "1px solid #eee" : "none",
              fontFamily: "Work Sans, sans-serif",
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 15, color: tokens.text, fontWeight: 500 }}>{t(cat.labelKey)}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: tokens.muted }}>
                {toggles[cat.key] ? "On" : "Off"}
              </p>
            </div>
            <Toggle on={toggles[cat.key]} onToggle={() => handleToggle(cat.key)} />
          </div>
        ))}
      </div>

      {/* Quiet hours */}
      <div
        style={{
          marginTop: 20,
          backgroundColor: tokens.surface,
          borderRadius: 12,
          padding: "16px 20px",
          fontFamily: "Work Sans, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, color: tokens.text, fontWeight: 500 }}>{t("settings.quiet_hours")}</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: tokens.muted }}>9:00 PM – 6:00 AM</p>
          </div>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: tokens.accent,
            }}
          />
        </div>
      </div>

      {/* Safety override */}
      <div
        style={{
          marginTop: 20,
          backgroundColor: "#fdf5e6",
          borderLeft: `4px solid ${tokens.warn}`,
          borderRadius: 10,
          padding: "14px 18px",
          fontFamily: "Work Sans, sans-serif",
        }}
      >
        <p style={{ margin: 0, fontSize: 14, color: tokens.warn, fontWeight: 600 }}>
          Safety override
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: tokens.text, lineHeight: 1.5 }}>
          Frost and severe weather alerts always reach you, even during quiet hours.
        </p>
      </div>

      {/* Summary description from settings */}
      <p
        style={{
          marginTop: 24,
          fontFamily: "Work Sans, sans-serif",
          fontSize: 13,
          color: tokens.muted,
          lineHeight: 1.6,
        }}
      >
        {t("settings.quiet_hours_description")}
      </p>
    </div>
  );
}
