import { useTranslation } from "react-i18next";

interface YieldDashboardProps {
  beds: Array<{
    name: string;
    sqft: number;
    totalLbs: number;
    crops: Array<{ name: string; lbs: number }>;
  }>;
  seasonTotal: { lbs: number; sqft: number };
}

const defaultProps: YieldDashboardProps = {
  beds: [
    { name: "Bed 1 - Tomatoes", sqft: 48, totalLbs: 62, crops: [{ name: "Roma Tomato", lbs: 38 }, { name: "Cherry Tomato", lbs: 24 }] },
    { name: "Bed 2 - Greens", sqft: 32, totalLbs: 18, crops: [{ name: "Lettuce", lbs: 8 }, { name: "Spinach", lbs: 6 }, { name: "Kale", lbs: 4 }] },
    { name: "Bed 3 - Squash", sqft: 64, totalLbs: 85, crops: [{ name: "Zucchini", lbs: 45 }, { name: "Butternut", lbs: 40 }] },
    { name: "Bed 4 - Herbs", sqft: 16, totalLbs: 4, crops: [{ name: "Basil", lbs: 2 }, { name: "Cilantro", lbs: 1 }, { name: "Parsley", lbs: 1 }] },
    { name: "Bed 5 - Beans", sqft: 40, totalLbs: 28, crops: [{ name: "Green Bean", lbs: 18 }, { name: "Dry Bean", lbs: 10 }] },
    { name: "Bed 6 - Root Crops", sqft: 48, totalLbs: 52, crops: [{ name: "Carrot", lbs: 22 }, { name: "Beet", lbs: 15 }, { name: "Potato", lbs: 15 }] },
  ],
  seasonTotal: { lbs: 249, sqft: 248 },
};

const colors = {
  primary: "#0d6f74",
  accent: "#5d7d4a",
  warn: "#aa6d22",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  text: "#26231d",
  muted: "#706b63",
  border: "#e8e5de",
};

export function YieldDashboard(props: Partial<YieldDashboardProps> = {}) {
  const p = { ...defaultProps, ...props };
  const { t } = useTranslation();

  const bedsWithYield = p.beds.map((bed) => ({
    ...bed,
    yieldPerSqft: bed.sqft > 0 ? bed.totalLbs / bed.sqft : 0,
  }));

  const sorted = [...bedsWithYield].sort((a, b) => b.yieldPerSqft - a.yieldPerSqft);
  const maxYield = Math.max(...sorted.map((b) => b.yieldPerSqft), 0.01);
  const bestBed = sorted[0];
  const worstBed = sorted[sorted.length - 1];
  const seasonYieldPerSqft =
    p.seasonTotal.sqft > 0 ? (p.seasonTotal.lbs / p.seasonTotal.sqft).toFixed(2) : "0.00";

  return (
    <div style={{ fontFamily: "'Work Sans', system-ui, sans-serif", background: colors.bg, color: colors.text }}>
      {/* Season summary */}
      <div style={cardStyle}>
        <h2 style={headingStyle}>{t("yield.title", "Yield Dashboard")}</h2>
        <p style={{ fontSize: 13, color: colors.muted, margin: "4px 0 16px" }}>
          {t("yield.subtitle", "Yield per square foot across all beds this season")}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: colors.primary }}>
              {p.seasonTotal.lbs}
            </div>
            <div style={{ fontSize: 12, color: colors.muted }}>
              {t("yield.total_lbs", "Total lbs")}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: colors.primary }}>
              {p.seasonTotal.sqft}
            </div>
            <div style={{ fontSize: 12, color: colors.muted }}>
              {t("yield.total_sqft", "Total sq ft")}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: colors.accent }}>
              {seasonYieldPerSqft}
            </div>
            <div style={{ fontSize: 12, color: colors.muted }}>
              {t("yield.avg_per_sqft", "Avg lbs / sq ft")}
            </div>
          </div>
        </div>
      </div>

      {/* Best / worst callout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <div style={{ ...cardStyle, borderLeft: `3px solid ${colors.accent}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: colors.accent }}>
            {t("yield.most_productive", "Most Productive")}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{bestBed?.name}</div>
          <div style={{ fontSize: 13, color: colors.muted }}>
            {bestBed?.yieldPerSqft.toFixed(2)} {t("yield.lbs_sqft", "lbs/sqft")}
          </div>
        </div>
        <div style={{ ...cardStyle, borderLeft: `3px solid ${colors.warn}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: colors.warn }}>
            {t("yield.least_productive", "Least Productive")}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{worstBed?.name}</div>
          <div style={{ fontSize: 13, color: colors.muted }}>
            {worstBed?.yieldPerSqft.toFixed(2)} {t("yield.lbs_sqft", "lbs/sqft")}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ ...cardStyle, marginTop: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>
          {t("yield.yield_per_sqft", "Yield per Square Foot")}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sorted.map((bed) => {
            const pct = (bed.yieldPerSqft / maxYield) * 100;
            const isBest = bed.name === bestBed?.name;
            const isWorst = bed.name === worstBed?.name;
            const barColor = isBest ? colors.accent : isWorst ? colors.warn : colors.primary;
            return (
              <div key={bed.name}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{bed.name}</span>
                  <span style={{ fontSize: 12, color: colors.muted }}>
                    {bed.yieldPerSqft.toFixed(2)} {t("yield.lbs_sqft", "lbs/sqft")}
                  </span>
                </div>
                <div
                  style={{
                    background: colors.border,
                    borderRadius: 4,
                    height: 14,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: barColor,
                      borderRadius: 4,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                  {bed.crops.map((c) => c.name).join(", ")} &middot; {bed.totalLbs} lbs / {bed.sqft} sqft
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: 24,
  fontWeight: 400,
  margin: 0,
  color: "#26231d",
};

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 8,
  border: "1px solid #e8e5de",
  padding: "16px 20px",
};

export default YieldDashboard;
