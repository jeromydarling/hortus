import { useTranslation } from "react-i18next";

interface EconomicImpactProps {
  groceryValueSaved: number;
  localSpend: number;
  seedsNowSpend: number;
  donatedValue: number;
  compostValue: number;
  totalImpact: number;
  monthlyBreakdown: Array<{ month: string; saved: number; spent: number }>;
}

const defaultProps: EconomicImpactProps = {
  groceryValueSaved: 1124,
  localSpend: 285,
  seedsNowSpend: 48,
  donatedValue: 310,
  compostValue: 95,
  totalImpact: 1862,
  monthlyBreakdown: [
    { month: "Mar", saved: 20, spent: 120 },
    { month: "Apr", saved: 45, spent: 85 },
    { month: "May", saved: 80, spent: 40 },
    { month: "Jun", saved: 165, spent: 20 },
    { month: "Jul", saved: 240, spent: 10 },
    { month: "Aug", saved: 260, spent: 5 },
    { month: "Sep", saved: 180, spent: 5 },
    { month: "Oct", saved: 95, spent: 30 },
    { month: "Nov", saved: 39, spent: 18 },
  ],
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

export function EconomicImpact(props: Partial<EconomicImpactProps> = {}) {
  const p = { ...defaultProps, ...props };
  const { t } = useTranslation();

  const maxMonthly = Math.max(
    ...p.monthlyBreakdown.map((m) => Math.max(m.saved, m.spent)),
    1
  );

  const breakdownCards: { label: string; value: number; color: string; icon: string }[] = [
    {
      label: t("impact.grocery_saved", "Grocery Value Saved"),
      value: p.groceryValueSaved,
      color: colors.accent,
      icon: "\ud83e\udd66",
    },
    {
      label: t("impact.local_spend", "Local Nursery Spend"),
      value: p.localSpend,
      color: colors.primary,
      icon: "\ud83c\udfea",
    },
    {
      label: t("impact.donated_value", "Donated Food Value"),
      value: p.donatedValue,
      color: colors.warn,
      icon: "\ud83e\udd1d",
    },
    {
      label: t("impact.compost_value", "Compost Value"),
      value: p.compostValue,
      color: "#6b5b3e",
      icon: "\u267b\ufe0f",
    },
  ];

  return (
    <div style={{ fontFamily: "'Work Sans', system-ui, sans-serif", background: colors.bg, color: colors.text }}>
      {/* Total impact hero */}
      <div style={{ ...cardStyle, textAlign: "center" }}>
        <h2 style={headingStyle}>{t("impact.title", "Economic Impact")}</h2>
        <p style={{ fontSize: 13, color: colors.muted, margin: "4px 0 16px" }}>
          {t("impact.subtitle", "Total garden economic impact this season")}
        </p>
        <div style={{ fontSize: 48, fontWeight: 700, color: colors.accent, lineHeight: 1 }}>
          ${p.totalImpact.toLocaleString()}
        </div>
        <div style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>
          {t("impact.total_label", "Total value created by your garden")}
        </div>
      </div>

      {/* Breakdown cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginTop: 12,
        }}
      >
        {breakdownCards.map((card) => (
          <div
            key={card.label}
            style={{
              ...cardStyle,
              padding: "14px 16px",
              borderLeft: `3px solid ${card.color}`,
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 4 }}>{card.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: card.color }}>
              ${card.value.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div style={{ ...cardStyle, marginTop: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>
          {t("impact.monthly_breakdown", "Monthly Breakdown")}
        </h3>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, fontSize: 11, color: colors.muted }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: colors.accent, display: "inline-block" }} />
            {t("impact.saved_label", "Saved")}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: colors.primary, display: "inline-block" }} />
            {t("impact.spent_label", "Spent")}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 140 }}>
          {p.monthlyBreakdown.map((m) => {
            const savedHeight = (m.saved / maxMonthly) * 120;
            const spentHeight = (m.spent / maxMonthly) * 120;
            return (
              <div
                key={m.month}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 120 }}>
                  <div
                    style={{
                      width: 12,
                      height: savedHeight,
                      background: colors.accent,
                      borderRadius: "2px 2px 0 0",
                      transition: "height 0.3s ease",
                    }}
                    title={`$${m.saved} saved`}
                  />
                  <div
                    style={{
                      width: 12,
                      height: spentHeight,
                      background: colors.primary,
                      borderRadius: "2px 2px 0 0",
                      transition: "height 0.3s ease",
                    }}
                    title={`$${m.spent} spent`}
                  />
                </div>
                <div style={{ fontSize: 10, color: colors.muted }}>{m.month}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Local multiplier callout */}
      <div
        style={{
          ...cardStyle,
          marginTop: 12,
          background: "#f0f7f7",
          borderColor: colors.primary,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>{"\ud83c\udfdb\ufe0f"}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.primary }}>
              {t("impact.local_multiplier_title", "The Local Multiplier Effect")}
            </div>
            <p style={{ fontSize: 13, color: colors.muted, margin: "6px 0 0", lineHeight: 1.5 }}>
              {t(
                "impact.local_multiplier_body",
                "Every dollar spent at local nurseries, seed swaps, and farm stands circulates 2-3x more in your community compared to big-box stores. Your ${{localSpend}} in local garden spending generated an estimated ${{multiplied}} in local economic activity.",
                {
                  localSpend: p.localSpend,
                  multiplied: (p.localSpend * 2.5).toFixed(0),
                }
              )}
            </p>
          </div>
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

export default EconomicImpact;
