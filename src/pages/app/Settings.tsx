import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const tokens = {
  primary: "#0d6f74",
  accent: "#5d7d4a",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  text: "#26231d",
  muted: "#706b63",
};

type LanguageMode = "plain" | "gardener" | "source";
type GardenType = "solo" | "community";

export default function Settings() {
  const { t, i18n } = useTranslation();

  const [displayName, setDisplayName] = useState("Demo Gardener");
  const [language, setLanguage] = useState<"en" | "es">(
    (i18n.language?.startsWith("es") ? "es" : "en") as "en" | "es"
  );
  const [languageMode, setLanguageMode] = useState<LanguageMode>("plain");
  const [gardenType, setGardenType] = useState<GardenType>("solo");
  const [notifications, setNotifications] = useState({
    weather: true,
    nri: true,
    observation: true,
    community: false,
    growing: true,
  });
  const [editingName, setEditingName] = useState(false);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLanguageChange = (lang: "en" | "es") => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 20,
    color: tokens.text,
    fontWeight: 400,
    marginBottom: 12,
    marginTop: 32,
  };

  const row: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #eae7e1",
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 14,
  };

  const label: React.CSSProperties = {
    color: tokens.text,
    fontWeight: 500,
  };

  const pillGroup: React.CSSProperties = {
    display: "flex",
    gap: 4,
    backgroundColor: "#eae7e1",
    borderRadius: 8,
    padding: 3,
  };

  const pill = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    borderRadius: 6,
    border: "none",
    backgroundColor: active ? tokens.surface : "transparent",
    color: active ? tokens.primary : tokens.muted,
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
  });

  const toggle = (on: boolean): React.CSSProperties => ({
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: on ? tokens.primary : "#d4d0c8",
    position: "relative",
    cursor: "pointer",
    transition: "background-color 0.2s",
    flexShrink: 0,
  });

  const toggleDot = (on: boolean): React.CSSProperties => ({
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    position: "absolute",
    top: 2,
    left: on ? 22 : 2,
    transition: "left 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: tokens.bg,
        padding: "24px 16px 64px",
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 30,
            color: tokens.text,
            fontWeight: 400,
            marginBottom: 4,
          }}
        >
          {t("settings.title")}
        </h1>

        {/* ---- Profile ---- */}
        <h2 style={sectionTitle}>{t("settings.profile")}</h2>
        <div style={row}>
          <span style={label}>{t("settings.display_name")}</span>
          {editingName ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #d4d0c8",
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: 14,
                  color: tokens.text,
                  width: 160,
                  outline: "none",
                }}
              />
              <button
                onClick={() => setEditingName(false)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: tokens.primary,
                  color: "#fff",
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t("common.save")}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: tokens.muted }}>{displayName}</span>
              <button
                onClick={() => setEditingName(true)}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: 13,
                  color: tokens.primary,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {t("common.edit")}
              </button>
            </div>
          )}
        </div>

        {/* ---- Language ---- */}
        <h2 style={sectionTitle}>{t("settings.language")}</h2>
        <div style={row}>
          <span style={label}>{t("settings.language")}</span>
          <div style={pillGroup}>
            <button
              onClick={() => handleLanguageChange("en")}
              style={pill(language === "en")}
            >
              {t("settings.language_english")}
            </button>
            <button
              onClick={() => handleLanguageChange("es")}
              style={pill(language === "es")}
            >
              {t("settings.language_spanish")}
            </button>
          </div>
        </div>

        <div style={row}>
          <span style={label}>{t("settings.language_mode")}</span>
          <div style={pillGroup}>
            {(["plain", "gardener", "source"] as LanguageMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setLanguageMode(m)}
                style={pill(languageMode === m)}
              >
                {t(`settings.language_mode_${m}`)}
              </button>
            ))}
          </div>
        </div>

        {/* ---- Garden Type ---- */}
        <h2 style={sectionTitle}>{t("settings.garden_type")}</h2>
        <div style={row}>
          <span style={label}>{t("settings.garden_type")}</span>
          <div style={pillGroup}>
            <button
              onClick={() => setGardenType("solo")}
              style={pill(gardenType === "solo")}
            >
              {t("settings.garden_type_solo")}
            </button>
            <button
              onClick={() => setGardenType("community")}
              style={pill(gardenType === "community")}
            >
              {t("settings.garden_type_community")}
            </button>
          </div>
        </div>

        {/* ---- Notifications ---- */}
        <h2 style={sectionTitle}>{t("settings.notifications")}</h2>
        {([
          { key: "weather" as const, label: t("settings.notification_weather") },
          { key: "nri" as const, label: t("settings.notification_nri") },
          { key: "observation" as const, label: t("settings.notification_observation") },
          { key: "community" as const, label: t("settings.notification_community") },
          { key: "growing" as const, label: t("settings.notification_growing") },
        ]).map((item) => (
          <div key={item.key} style={row}>
            <span style={label}>{item.label}</span>
            <div
              onClick={() => toggleNotification(item.key)}
              style={toggle(notifications[item.key])}
            >
              <div style={toggleDot(notifications[item.key])} />
            </div>
          </div>
        ))}

        {/* Quiet hours */}
        <div style={row}>
          <span style={label}>{t("settings.quiet_hours")}</span>
          <span style={{ color: tokens.muted, fontSize: 13 }}>
            {t("settings.quiet_hours_description")}
          </span>
        </div>

        {/* ---- Subscription ---- */}
        <h2 style={sectionTitle}>{t("settings.subscription")}</h2>
        <div style={row}>
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: 6,
                backgroundColor: tokens.accent,
                color: "#fff",
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                marginRight: 8,
              }}
            >
              Seedling
            </span>
            <span style={{ color: tokens.muted, fontSize: 13 }}>
              {t("common.free_trial")}
            </span>
          </div>
          <button
            style={{
              background: "none",
              border: "none",
              fontFamily: "'Work Sans', sans-serif",
              fontSize: 13,
              color: tokens.primary,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {t("settings.manage_subscription")}
          </button>
        </div>

        {/* ---- About ---- */}
        <h2 style={sectionTitle}>{t("settings.about")}</h2>
        <div style={row}>
          <span style={label}>{t("settings.version")}</span>
          <span style={{ color: tokens.muted, fontSize: 13 }}>2.0.0</span>
        </div>

        {/* Sign out */}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <button
            onClick={() => {
              // In production: call signOut() from useAuth
              window.location.href = "/auth/login";
            }}
            style={{
              padding: "12px 32px",
              borderRadius: 10,
              border: `1px solid #c0392b`,
              backgroundColor: "transparent",
              color: "#c0392b",
              fontFamily: "'Work Sans', sans-serif",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {t("common.sign_out")}
          </button>
        </div>
      </div>
    </div>
  );
}
