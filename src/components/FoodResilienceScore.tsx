import { useState } from "react";
import { useTranslation } from "react-i18next";

interface FoodResilienceProps {
  lbsProduced: number;
  sqftCultivated: number;
  varietiesGrown: number;
  daysOfFood: number;
  groceryValueSaved: number;
  seedVarietiesSaved: number;
  cropsShared: number;
  score: number; // 0-100
}

const defaultProps: FoodResilienceProps = {
  lbsProduced: 247,
  sqftCultivated: 320,
  varietiesGrown: 18,
  daysOfFood: 42,
  groceryValueSaved: 1124,
  seedVarietiesSaved: 6,
  cropsShared: 34,
  score: 58,
};

// Design tokens
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

function scoreColor(score: number): string {
  if (score < 30) return "#c0392b";
  if (score <= 60) return "#aa6d22";
  return "#5d7d4a";
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
      <svg width={180} height={180} viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={colors.border}
          strokeWidth={strokeWidth}
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x="90"
          y="82"
          textAnchor="middle"
          style={{ fontSize: 36, fontWeight: 700, fill: color }}
        >
          {score}
        </text>
        <text
          x="90"
          y="106"
          textAnchor="middle"
          style={{ fontSize: 13, fill: colors.muted }}
        >
          / 100
        </text>
      </svg>
    </div>
  );
}

const metricIcons: Record<string, string> = {
  lbsProduced: "\u2696\ufe0f",
  sqftCultivated: "\ud83d\udcd0",
  varietiesGrown: "\ud83c\udf3f",
  daysOfFood: "\ud83d\udcc5",
  groceryValueSaved: "\ud83d\udcb2",
  seedVarietiesSaved: "\ud83c\udf31",
  cropsShared: "\ud83e\udd1d",
};

export function FoodResilienceScore(props: Partial<FoodResilienceProps> = {}) {
  const p = { ...defaultProps, ...props };
  const { t } = useTranslation();
  const [tipsOpen, setTipsOpen] = useState(false);

  const metrics: { key: string; value: string; label: string }[] = [
    { key: "lbsProduced", value: `${p.lbsProduced} lbs`, label: t("resilience.lbs_produced", "Pounds Produced") },
    { key: "sqftCultivated", value: `${p.sqftCultivated} sq ft`, label: t("resilience.sqft_cultivated", "Area Cultivated") },
    { key: "varietiesGrown", value: `${p.varietiesGrown}`, label: t("resilience.varieties_grown", "Varieties Grown") },
    { key: "daysOfFood", value: `${p.daysOfFood}`, label: t("resilience.days_of_food", "Days of Food") },
    { key: "groceryValueSaved", value: `$${p.groceryValueSaved.toLocaleString()}`, label: t("resilience.grocery_value_saved", "Grocery Value Saved") },
    { key: "seedVarietiesSaved", value: `${p.seedVarietiesSaved}`, label: t("resilience.seed_varieties_saved", "Seed Varieties Saved") },
    { key: "cropsShared", value: `${p.cropsShared} lbs`, label: t("resilience.crops_shared", "Crops Shared") },
  ];

  const tips = [
    t("resilience.tip_diversity", "Grow more crop varieties to reduce dependence on any single crop."),
    t("resilience.tip_season_extension", "Use season extension (cold frames, row cover) to add growing weeks."),
    t("resilience.tip_seed_saving", "Save seeds from your best-performing heirloom varieties each year."),
    t("resilience.tip_preservation", "Learn to can, ferment, and dehydrate to extend your harvest."),
    t("resilience.tip_sharing", "Share surplus with neighbors -- community resilience is personal resilience."),
    t("resilience.tip_perennials", "Add perennial food crops (berries, herbs, fruit trees) for low-effort yields."),
  ];

  return (
    <div style={{ fontFamily: "'Work Sans', system-ui, sans-serif", background: colors.bg, color: colors.text }}>
      {/* Header */}
      <div style={cardStyle}>
        <h2 style={headingStyle}>
          {t("resilience.title", "Food Resilience Score")}
        </h2>
        <p style={{ fontSize: 13, color: colors.muted, margin: "4px 0 0" }}>
          {t(
            "resilience.subtitle",
            "Inspired by Strong Towns: Could your household survive on local food for a month?"
          )}
        </p>

        <ScoreGauge score={p.score} />

        <p style={{ textAlign: "center", fontSize: 14, color: colors.muted, margin: 0 }}>
          {p.score < 30
            ? t("resilience.level_beginning", "Beginning -- keep planting, every square foot counts")
            : p.score <= 60
            ? t("resilience.level_developing", "Developing -- real progress toward food independence")
            : t("resilience.level_resilient", "Resilient -- your household has meaningful food security")}
        </p>
      </div>

      {/* Metrics grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        {metrics.map((m) => (
          <div key={m.key} style={{ ...cardStyle, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{metricIcons[m.key]}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.primary }}>{m.value}</div>
            <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tips expandable */}
      <div style={{ ...cardStyle, marginTop: 16 }}>
        <button
          onClick={() => setTipsOpen(!tipsOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 0,
            fontFamily: "inherit",
            color: colors.text,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            {t("resilience.tips_title", "What improves your score?")}
          </span>
          <span
            style={{
              fontSize: 18,
              transform: tipsOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              color: colors.muted,
            }}
          >
            &#9660;
          </span>
        </button>
        {tipsOpen && (
          <ul style={{ margin: "12px 0 0", paddingLeft: 20, listStyleType: "disc" }}>
            {tips.map((tip, i) => (
              <li key={i} style={{ fontSize: 13, color: colors.muted, lineHeight: 1.6, marginBottom: 4 }}>
                {tip}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: 24,
  fontWeight: 400,
  margin: 0,
  color: colors.text,
};

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  padding: "16px 20px",
};

export default FoodResilienceScore;
