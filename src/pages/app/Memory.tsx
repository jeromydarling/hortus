import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DEMO_FIXTURE } from "@/demo/fixture";

/* ── Design tokens ── */
const T = {
  primary: "#0d6f74",
  primarySoft: "#d7e7e6",
  accent: "#5d7d4a",
  accentSoft: "#dee7d8",
  warn: "#aa6d22",
  warnSoft: "#ecdcc3",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  surface2: "#f5f1ea",
  surface3: "#eee8de",
  border: "#d7d2c8",
  divider: "#e5e0d8",
  text: "#26231d",
  muted: "#706b63",
  faint: "#a9a39b",
  radiusMd: "0.65rem",
  radiusLg: "1rem",
  radiusXl: "1.35rem",
  radiusFull: "9999px",
  serif: "'Instrument Serif', serif",
  sans: "'Work Sans', sans-serif",
};

type FilterTab = "all" | "notes" | "voice" | "photos";

/* ── Badge colors per observation type ── */
const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  note: { bg: T.primarySoft, color: T.primary },
  voice: { bg: T.accentSoft, color: T.accent },
  photo: { bg: T.warnSoft, color: T.warn },
};

/* ── Relative time helper ── */
function relativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function Memory() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterTab>("all");

  const observations = DEMO_FIXTURE.observations;
  const streak = observations.length;

  const filtered =
    filter === "all"
      ? observations
      : filter === "notes"
        ? observations.filter((o) => o.type === "note")
        : filter === "voice"
          ? observations.filter((o) => o.type === "voice")
          : observations.filter((o) => o.type === "photo");

  const tabs: { id: FilterTab; labelKey: string }[] = [
    { id: "all", labelKey: "logs.filter_all" },
    { id: "notes", labelKey: "logs.filter_notes" },
    { id: "voice", labelKey: "logs.filter_voice" },
    { id: "photos", labelKey: "logs.filter_photos" },
  ];

  return (
    <div style={{ fontFamily: T.sans, color: T.text, background: T.bg, minHeight: "100vh" }}>
      <div style={{ padding: "1.25rem" }}>
        {/* ── Header ── */}
        <h1
          style={{
            fontFamily: T.serif,
            fontSize: "1.5rem",
            color: T.text,
            marginBottom: "0.25rem",
          }}
        >
          {t("logs.title")}
        </h1>
        <p
          style={{ fontSize: "0.8rem", color: T.muted, marginBottom: "1.25rem" }}
        >
          {t("logs.subtitle")}
        </p>

        {/* ── Streak counter ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "1.25rem",
            marginBottom: "1rem",
          }}
        >
          <span style={{ fontSize: "2rem", flexShrink: 0 }}>{"\u{1F525}"}</span>
          <span
            style={{
              fontFamily: T.serif,
              fontSize: "3rem",
              color: T.warn,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {streak}
          </span>
          <div>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: T.muted,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                display: "block",
                marginBottom: 4,
              }}
            >
              {t("logs.streak")}
            </span>
            <span style={{ fontSize: 10, color: T.faint }}>
              {t("logs.streak_days", { count: streak })}
            </span>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[
              { key: "logs.add_note", emoji: "\u{1F4DD}" },
              { key: "logs.add_voice", emoji: "\u{1F3A4}" },
              { key: "logs.add_photo", emoji: "\u{1F4F7}" },
            ].map((btn) => (
              <button
                key={btn.key}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase" as const,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: T.radiusLg,
                  background: T.surface2,
                  color: T.muted,
                  cursor: "pointer",
                  fontFamily: T.sans,
                }}
              >
                {btn.emoji} {t(btn.key)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div
          style={{
            display: "flex",
            gap: 2,
            background: T.surface3,
            borderRadius: T.radiusLg,
            padding: 3,
            marginBottom: "1.25rem",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                flex: 1,
                padding: "0.5rem",
                textAlign: "center",
                fontSize: "0.8rem",
                fontWeight: 600,
                fontFamily: T.sans,
                color: filter === tab.id ? T.text : T.muted,
                background: filter === tab.id ? T.surface : "transparent",
                borderRadius: T.radiusMd,
                border: "none",
                cursor: "pointer",
              }}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {/* ── Observations list ── */}
        {filtered.length === 0 ? (
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusXl,
              padding: "2rem 1.25rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: T.serif,
                fontStyle: "italic",
                fontSize: "0.875rem",
                color: T.muted,
              }}
            >
              {t("logs.empty_log")}
            </p>
          </div>
        ) : (
          filtered.map((obs, i) => {
            const badge = (TYPE_BADGE[obs.type] ?? TYPE_BADGE["note"])!;
            return (
              <div
                key={obs.id}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  padding: "0.75rem 0",
                  borderBottom:
                    i < filtered.length - 1
                      ? `1px solid ${T.divider}`
                      : "none",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: badge.color,
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  {/* Meta row */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.1rem 0.4rem",
                        borderRadius: T.radiusFull,
                        fontSize: 9,
                        fontWeight: 700,
                        background: badge.bg,
                        color: badge.color,
                        textTransform: "uppercase" as const,
                      }}
                    >
                      {t(`logs.observation_type_${obs.type}`)}
                    </span>
                    <span style={{ fontSize: 10, color: T.faint }}>
                      {relativeTime(obs.createdAt)}
                    </span>
                  </div>

                  {/* Content */}
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: T.text,
                      lineHeight: 1.5,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {obs.content}
                  </p>

                  {/* Tags */}
                  <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                    {obs.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: "inline-block",
                          padding: "0.1rem 0.4rem",
                          borderRadius: T.radiusFull,
                          fontSize: 9,
                          fontWeight: 700,
                          background: T.surface3,
                          color: T.muted,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {/* Phase badge */}
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.1rem 0.4rem",
                        borderRadius: T.radiusFull,
                        fontSize: 9,
                        fontWeight: 700,
                        background: T.primarySoft,
                        color: T.primary,
                      }}
                    >
                      {t(`phases.${obs.phaseAtTime}`)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
