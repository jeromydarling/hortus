import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAncientLibrary } from "@/ancientLibrary";

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
  terracotta: "#a0522d",
  terracottaSoft: "#f3e8e0",
  radiusLg: "1rem",
  radiusXl: "1.35rem",
  radiusFull: "9999px",
  serif: "'Instrument Serif', serif",
  sans: "'Work Sans', sans-serif",
  shadowSm: "0 1px 3px rgba(30,25,18,.05),0 6px 18px rgba(30,25,18,.04)",
};

/** Ancient context blurbs connecting each month to historical scheduling traditions. */
const ANCIENT_CONTEXT: Record<number, string> = {
  1: "Palladius advised January as a time of rest and planning. Monastic calendars called it the month of contemplation, when monks reviewed seed stores and prepared garden plans by candlelight. The Islamic tradition similarly recognized winter's pause as essential for the soil to regenerate.",
  2: "In Palladius' Opus Agriculturae, February was for pruning vines and fruit trees while they slept. Monastery gardeners began testing soil warmth by feel, and Tudor almanacs marked Candlemas (Feb 2) as the hinge of winter — 'half your wood and half your hay.'",
  3: "March was the Roman new year for agriculture. Palladius prescribed sowing of early greens and leeks. Monastic gardens followed the Benedictine calendar of ora et labora — work in the garden intensified alongside Lenten prayers. Islamic agronomists described March as when water channels must be cleared.",
  4: "Palladius wrote extensively on April sowings. Tusser's Five Hundred Points of Good Husbandry lists dozens of April tasks. Monastery records show this as the month of greatest labor in the physic garden, with medicinal herbs sown according to lunar calendars.",
  5: "The Roman calendar marked May as a month of vigilance — protecting young plants from late cold. Monastic gardeners processed first harvests of salad herbs. Islamic water engineers checked qanat flows as summer approached.",
  6: "June was harvest time for early crops across all traditions. Palladius described hay-making and herb-drying. The monastic infirmary garden was at its peak, supplying medicines. Tudor gardens began succession plantings.",
  7: "High summer required constant watering — Roman villa gardens used lead pipes, while Islamic gardens relied on gravity-fed channels. Monastic communities preserved herbs through drying and tincturing. Tusser advised 'in July, some harvest, in July, more seeding.'",
  8: "August was the month of abundance and preservation. Palladius detailed fruit preservation in honey. Monastic cellars filled with dried herbs and preserved vegetables. Islamic agronomists described grafting techniques best performed in late summer heat.",
  9: "September marked the Roman vintage and orchard harvest. Monastic communities began autumn sowing of overwintering crops. Al-Awwam described September as ideal for transplanting fruit trees in Mediterranean climates.",
  10: "October was the great planting month. Palladius prescribed garlic, broad beans, and winter greens. Tusser's October list includes dozens of overwintering sowings. Monastic gardens shifted to root crop harvest and cellar storage.",
  11: "November was devoted to soil care across traditions. Roman farmers spread manure and composted spent crops. Monastic gardens undertook major bed preparation, and Islamic texts described autumn irrigation shutdowns to let soil rest.",
  12: "December was the quietest garden month. Palladius wrote of tool repair and planning. Monasteries reviewed their year's records, assessed seed viability, and prepared planting calendars for the coming year. The garden rested, as did the gardener.",
};

export default function Calendar() {
  const { t } = useTranslation();
  const { calendar, currentMonth } = useAncientLibrary();

  const [expandedMonth, setExpandedMonth] = useState<number | null>(
    currentMonth?.month ?? null
  );

  const currentMonthNum = currentMonth?.month ?? new Date().getMonth() + 1;

  return (
    <div style={{ fontFamily: T.sans, color: T.text, background: T.bg, minHeight: "100vh" }}>
      {/* ── Header ── */}
      <div style={{ padding: "1.5rem 1.25rem 1rem", background: T.terracottaSoft }}>
        <h1 style={{ fontFamily: T.serif, fontSize: "1.8rem", marginBottom: "0.25rem" }}>
          Seasonal Calendar
        </h1>
        <p style={{ fontSize: "0.8rem", color: T.muted, maxWidth: 560 }}>
          Follow the ancient rhythm — month by month guidance rooted in Palladius,
          Tusser, and monastic traditions
        </p>
      </div>

      {/* ── Calendar description ── */}
      <div style={{ padding: "1rem 1.25rem 0.5rem" }}>
        <p style={{
          fontFamily: T.serif,
          fontStyle: "italic",
          fontSize: "0.88rem",
          color: T.muted,
          lineHeight: 1.6,
          borderLeft: `3px solid ${T.terracotta}`,
          paddingLeft: "0.75rem",
          margin: "0 0 1rem",
        }}>
          {calendar.description}
        </p>
      </div>

      {/* ── Month cards ── */}
      <div style={{ padding: "0 1.25rem 1.25rem" }}>
        {calendar.months.map((month) => {
          const isCurrent = month.month === currentMonthNum;
          const isExpanded = expandedMonth === month.month;
          const context = ANCIENT_CONTEXT[month.month] ?? "";

          return (
            <div
              key={month.month}
              onClick={() => setExpandedMonth(isExpanded ? null : month.month)}
              style={{
                background: T.surface,
                border: `1.5px solid ${isCurrent ? T.primary : T.border}`,
                borderRadius: T.radiusXl,
                marginBottom: "0.75rem",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: isCurrent ? `0 0 0 2px ${T.primary}30` : "none",
                transition: "border-color .15s",
              }}
            >
              {/* Month header */}
              <div style={{
                padding: "0.85rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      {month.name}
                    </span>
                    {isCurrent && (
                      <span style={{
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.06em",
                        background: T.primarySoft,
                        color: T.primary,
                        borderRadius: T.radiusFull,
                        padding: "0.15rem 0.5rem",
                      }}>
                        {t("Current")}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontFamily: T.serif,
                    fontStyle: "italic",
                    fontSize: "0.82rem",
                    color: T.terracotta,
                  }}>
                    {month.theme}
                  </span>

                  {/* Tasks preview (collapsed: show 3, expanded: show all) */}
                  {!isExpanded && (
                    <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.1rem" }}>
                      {month.tasks.slice(0, 3).map((task, i) => (
                        <li key={i} style={{ fontSize: "0.75rem", color: T.muted, lineHeight: 1.55 }}>
                          {task}
                        </li>
                      ))}
                      {month.tasks.length > 3 && (
                        <li style={{ fontSize: "0.7rem", color: T.faint, listStyle: "none", marginLeft: "-1.1rem" }}>
                          +{month.tasks.length - 3} more...
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                <span style={{ fontSize: "0.8rem", color: T.faint, marginLeft: "0.5rem", flexShrink: 0, marginTop: "0.2rem" }}>
                  {isExpanded ? "\u25B2" : "\u25BC"}
                </span>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ padding: "0 1rem 1rem", borderTop: `1px solid ${T.divider}` }}>
                  {/* Full task list */}
                  <div style={{ marginTop: "0.75rem", marginBottom: "1rem" }}>
                    <h4 style={{
                      fontFamily: T.serif, fontSize: "1rem", color: T.accent,
                      marginBottom: "0.4rem",
                    }}>
                      Tasks
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                      {month.tasks.map((task, i) => (
                        <li key={i} style={{ fontSize: "0.8rem", color: T.text, lineHeight: 1.65, marginBottom: "0.15rem" }}>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ancient context */}
                  {context && (
                    <div>
                      <h4 style={{
                        fontFamily: T.serif, fontSize: "1rem", color: T.terracotta,
                        marginBottom: "0.4rem",
                      }}>
                        Ancient Context
                      </h4>
                      <p style={{
                        fontSize: "0.8rem",
                        color: T.muted,
                        lineHeight: 1.6,
                        margin: 0,
                        background: T.terracottaSoft,
                        borderRadius: T.radiusLg,
                        padding: "0.75rem",
                      }}>
                        {context}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
