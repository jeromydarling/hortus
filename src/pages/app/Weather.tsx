/* eslint-disable @typescript-eslint/no-unused-vars */
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
  radiusLg: "1rem",
  radiusXl: "1.35rem",
  radiusFull: "9999px",
  serif: "'Instrument Serif', serif",
  sans: "'Work Sans', sans-serif",
};

/* ── State colors ── */
const STATE_STYLES: Record<string, { bg: string; border: string; labelColor: string }> = {
  clear: { bg: "#dee7d8", border: "#5d7d4a", labelColor: "#5d7d4a" },
  caution: { bg: "#ecdcc3", border: "#aa6d22", labelColor: "#aa6d22" },
  delay: { bg: "#e8c9a8", border: "#aa6d22", labelColor: "#aa6d22" },
  protect: { bg: "#e5b8b8", border: "#b34040", labelColor: "#b34040" },
  suspend: { bg: "#d4b8b8", border: "#8b2020", labelColor: "#8b2020" },
};

/* ── Demo forecast data ── */
const DEMO_FORECAST = [
  { day: "TODAY", icon: "\u{26C5}", hi: "52\u00B0", lo: "34\u00B0" },
  { day: "THU", icon: "\u{2600}\uFE0F", hi: "56\u00B0", lo: "38\u00B0" },
  { day: "FRI", icon: "\u{1F324}\uFE0F", hi: "54\u00B0", lo: "36\u00B0" },
  { day: "SAT", icon: "\u{1F327}\uFE0F", hi: "48\u00B0", lo: "33\u00B0" },
  { day: "SUN", icon: "\u{2600}\uFE0F", hi: "58\u00B0", lo: "39\u00B0" },
];

/* ── Demo alerts ── */
const DEMO_ALERTS = [
  { type: "frost", text: "Frost advisory tonight. Cover tender transplants." },
];

export default function Weather() {
  const { t } = useTranslation();
  const weather = DEMO_FIXTURE.weather;
  const stateStyle = (STATE_STYLES[weather.state] ?? STATE_STYLES["clear"])!;

  const aqiLabel =
    weather.aqi <= 50
      ? t("weather.aqi_good")
      : weather.aqi <= 100
        ? t("weather.aqi_moderate")
        : t("weather.aqi_sensitive");
  const aqiColor = weather.aqi <= 50 ? T.accent : weather.aqi <= 100 ? T.warn : "#b34040";

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
          {t("weather.title")}
        </h1>
        <p
          style={{
            fontSize: "0.8rem",
            color: T.muted,
            marginBottom: "1.25rem",
          }}
        >
          {DEMO_FIXTURE.land.displayName} &middot; Zone {DEMO_FIXTURE.land.hardinessZone}
        </p>

        {/* ── Hazard state banner ── */}
        <div
          style={{
            background: stateStyle.bg,
            border: `1px solid ${stateStyle.border}`,
            borderRadius: T.radiusXl,
            padding: "1.25rem",
            marginBottom: "1rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: stateStyle.labelColor,
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            {t("weather.current")}
          </span>
          <span
            style={{
              fontFamily: T.serif,
              fontSize: "1.5rem",
              color: T.text,
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            {t(`weather.state_${weather.state}`)}
          </span>
          <span style={{ fontSize: "0.875rem", color: T.muted }}>
            {weather.headline}
          </span>
        </div>

        {/* ── Current conditions ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "1.25rem",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase" as const,
              color: T.faint,
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            {t("weather.current")}
          </span>
          <p
            style={{
              fontSize: "0.875rem",
              color: T.muted,
              lineHeight: 1.55,
            }}
          >
            {weather.forecast}
          </p>
        </div>

        {/* ── Forecast row ── */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            marginBottom: "1rem",
            paddingBottom: 2,
          }}
        >
          {DEMO_FORECAST.map((f) => (
            <div
              key={f.day}
              style={{
                flexShrink: 0,
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusLg,
                padding: "0.75rem 1rem",
                textAlign: "center",
                minWidth: 72,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  color: T.faint,
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                {f.day}
              </span>
              <span
                style={{
                  fontSize: "1.1rem",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                {f.icon}
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: T.text,
                }}
              >
                {f.hi}
              </span>
              <span style={{ fontSize: 9, color: T.muted, display: "block" }}>
                {f.lo}
              </span>
            </div>
          ))}
        </div>

        {/* ── AQI ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "1.25rem",
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.09em",
                textTransform: "uppercase" as const,
                color: T.faint,
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              {t("weather.aqi")}
            </span>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: aqiColor,
              }}
            >
              {aqiLabel}
            </span>
          </div>
          <span
            style={{
              fontFamily: T.serif,
              fontSize: "1.5rem",
              fontWeight: 400,
              color: aqiColor,
            }}
          >
            {weather.aqi}
          </span>
        </div>

        {/* ── Active alerts ── */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusXl,
            padding: "1.25rem",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase" as const,
              color: T.faint,
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            {t("weather.alerts")}
          </span>

          {DEMO_ALERTS.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: T.muted }}>
              {t("weather.no_alerts")}
            </p>
          ) : (
            DEMO_ALERTS.map((alert, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                  padding: "0.75rem 0",
                  borderBottom:
                    i < DEMO_ALERTS.length - 1
                      ? `1px solid ${T.divider}`
                      : "none",
                }}
              >
                <span
                  style={{
                    color: T.warn,
                    fontWeight: 700,
                    fontSize: "1rem",
                    flexShrink: 0,
                  }}
                >
                  {"\u2716"}
                </span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: T.muted,
                    lineHeight: 1.4,
                  }}
                >
                  {alert.text}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
