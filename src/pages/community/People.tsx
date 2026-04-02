import React from "react";
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

const roleBadgeColors: Record<string, { bg: string; text: string }> = {
  coordinator: { bg: tokens.primary, text: "#fff" },
  mentor: { bg: tokens.accent, text: "#fff" },
  member: { bg: "#e8e6e1", text: tokens.text },
};

function engagementDots(score: number) {
  const filled = Math.round(score * 5);
  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        marginRight: 3,
        backgroundColor: i < filled ? tokens.primary : "#ddd",
      }}
    />
  ));
}

const signalTypeStyles: Record<string, { border: string; label: string }> = {
  checkin: { border: tokens.warn, label: "nri.signal_checkin" },
  mentor_candidate: { border: tokens.accent, label: "nri.signal_mentor" },
};

export default function People() {
  const { t } = useTranslation();
  const { members, nriSignals } = DEMO_COMMUNITY;
  const totalHours = members.reduce((s, m) => s + m.volunteerHoursYTD, 0);

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: "100vh", padding: 24 }}>
      <h1 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 28, margin: 0 }}>
        {t("community.people_title")}
      </h1>
      <p style={{ fontFamily: "Work Sans, sans-serif", color: tokens.muted, fontSize: 14, marginTop: 4 }}>
        {t("community.member_count", { count: members.length })} &middot;{" "}
        {t("community.volunteer_hours")}: {totalHours} hrs YTD
      </p>

      {/* Members list */}
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {members.map((m) => {
          const badge = roleBadgeColors[m.role] ?? roleBadgeColors.member;
          return (
            <div
              key={m.id}
              style={{
                backgroundColor: tokens.surface,
                borderRadius: 10,
                padding: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: "Work Sans, sans-serif",
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: tokens.text, fontSize: 15 }}>{m.displayName}</span>
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 12,
                    backgroundColor: badge.bg,
                    color: badge.text,
                    textTransform: "capitalize",
                  }}
                >
                  {t(`community.role_${m.role}`)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center" }}>{engagementDots(m.engagementScore)}</div>
                <span style={{ fontSize: 13, color: tokens.muted }}>{t("community.hours_ytd", { hours: m.volunteerHoursYTD })}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* NRI Signals */}
      <h2 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 22, marginTop: 32, marginBottom: 12 }}>
        {t("nri.signals")}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {nriSignals.map((sig, i) => {
          const style = signalTypeStyles[sig.type] ?? { border: tokens.muted, label: sig.type };
          const person = members.find((m) => m.id === sig.personId);
          return (
            <div
              key={i}
              style={{
                backgroundColor: tokens.surface,
                borderLeft: `4px solid ${style.border}`,
                borderRadius: 10,
                padding: 16,
                fontFamily: "Work Sans, sans-serif",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 12,
                    backgroundColor: style.border,
                    color: "#fff",
                  }}
                >
                  {t(style.label)}
                </span>
                {person && <span style={{ fontSize: 14, fontWeight: 600, color: tokens.text }}>{person.displayName}</span>}
              </div>
              <p style={{ margin: 0, fontSize: 14, color: tokens.muted, lineHeight: 1.5 }}>{sig.reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
