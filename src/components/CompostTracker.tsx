import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CompostEntry {
  type: "green" | "brown" | "temperature" | "turn" | "moisture" | "note";
  material?: string;
  date: string;
}

interface CompostPile {
  id: string;
  name: string;
  type: "pile" | "bin" | "tumbler" | "worm_bin" | "bokashi";
  status: "active" | "curing" | "ready" | "applied";
  startedAt: string;
  estimatedReadyAt?: string;
  lastEntry?: { type: string; material: string; date: string };
  temperatureF?: number;
  entries: CompostEntry[];
}

interface CompostTrackerProps {
  piles: CompostPile[];
  onAddEntry?: (pileId: string) => void;
  onNewPile?: () => void;
}

const defaultPiles: CompostPile[] = [
  {
    id: "1",
    name: "Main Pile",
    type: "bin",
    status: "active",
    startedAt: "2026-02-15",
    estimatedReadyAt: "2026-06-15",
    temperatureF: 142,
    lastEntry: { type: "green", material: "Kitchen scraps", date: "2026-03-31" },
    entries: [
      { type: "green", material: "Kitchen scraps", date: "2026-03-31" },
      { type: "turn", date: "2026-03-28" },
      { type: "temperature", material: "142F", date: "2026-03-28" },
      { type: "brown", material: "Dried leaves", date: "2026-03-25" },
      { type: "green", material: "Grass clippings", date: "2026-03-22" },
      { type: "moisture", material: "Watered pile", date: "2026-03-20" },
      { type: "brown", material: "Cardboard strips", date: "2026-03-18" },
      { type: "green", material: "Veggie trimmings", date: "2026-03-15" },
    ],
  },
  {
    id: "2",
    name: "Worm Bin",
    type: "worm_bin",
    status: "active",
    startedAt: "2026-01-10",
    temperatureF: undefined,
    lastEntry: { type: "green", material: "Coffee grounds + banana peel", date: "2026-03-30" },
    entries: [
      { type: "green", material: "Coffee grounds + banana peel", date: "2026-03-30" },
      { type: "note", material: "Worms looking healthy, good moisture", date: "2026-03-26" },
      { type: "green", material: "Lettuce scraps", date: "2026-03-23" },
      { type: "brown", material: "Shredded newspaper", date: "2026-03-20" },
      { type: "green", material: "Apple cores", date: "2026-03-17" },
    ],
  },
  {
    id: "3",
    name: "Fall Pile",
    type: "pile",
    status: "ready",
    startedAt: "2025-10-01",
    estimatedReadyAt: "2026-03-01",
    temperatureF: 68,
    lastEntry: { type: "note", material: "Ready to apply, dark and crumbly", date: "2026-03-15" },
    entries: [
      { type: "note", material: "Ready to apply, dark and crumbly", date: "2026-03-15" },
      { type: "temperature", material: "68F - ambient", date: "2026-03-10" },
      { type: "turn", date: "2026-02-28" },
    ],
  },
];

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

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "#e8f0e0", color: "#3d5a2e", label: "Active" },
  curing: { bg: "#f5f0e8", color: "#aa6d22", label: "Curing" },
  ready: { bg: "#e0eef0", color: "#0d6f74", label: "Ready" },
  applied: { bg: "#f0ede6", color: "#706b63", label: "Applied" },
};

const typeLabels: Record<string, string> = {
  pile: "Open Pile",
  bin: "Bin",
  tumbler: "Tumbler",
  worm_bin: "Worm Bin",
  bokashi: "Bokashi",
};

const entryIcons: Record<string, string> = {
  green: "\ud83e\udd66",
  brown: "\ud83c\udf42",
  temperature: "\ud83c\udf21\ufe0f",
  turn: "\ud83d\udd04",
  moisture: "\ud83d\udca7",
  note: "\ud83d\udcdd",
};

function computeGreenBrownRatio(entries: CompostEntry[]): { green: number; brown: number } {
  let green = 0;
  let brown = 0;
  for (const e of entries) {
    if (e.type === "green") green++;
    if (e.type === "brown") brown++;
  }
  return { green, brown };
}

function progressPercent(startedAt: string, estimatedReadyAt?: string): number {
  if (!estimatedReadyAt) return 0;
  const start = new Date(startedAt).getTime();
  const end = new Date(estimatedReadyAt).getTime();
  const now = Date.now();
  if (end <= start) return 100;
  const pct = ((now - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, pct));
}

function tempColor(f: number): string {
  if (f < 90) return colors.muted;
  if (f < 130) return colors.warn;
  if (f <= 160) return colors.accent;
  return "#c0392b";
}

export function CompostTracker(props: Partial<CompostTrackerProps> = {}) {
  const piles = props.piles ?? defaultPiles;
  const onAddEntry = props.onAddEntry;
  const onNewPile = props.onNewPile;
  const { t } = useTranslation();
  const [expandedPile, setExpandedPile] = useState<string | null>(piles[0]?.id ?? null);

  return (
    <div style={{ fontFamily: "'Work Sans', system-ui, sans-serif", background: colors.bg, color: colors.text }}>
      {/* Header */}
      <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={headingStyle}>{t("compost.title", "Compost Tracker")}</h2>
          <p style={{ fontSize: 13, color: colors.muted, margin: "4px 0 0" }}>
            {t("compost.subtitle", "Monitor your piles, bins, and worm systems")}
          </p>
        </div>
        <button
          onClick={onNewPile ?? (() => {})}
          style={buttonStyle}
        >
          {t("compost.new_pile", "New Pile")}
        </button>
      </div>

      {/* Pile cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        {piles.map((pile) => {
          const status = statusColors[pile.status as keyof typeof statusColors] ?? statusColors.active as { bg: string; color: string; label: string };
          const progress = pile.status === "ready" || pile.status === "applied"
            ? 100
            : progressPercent(pile.startedAt, pile.estimatedReadyAt);
          const ratio = computeGreenBrownRatio(pile.entries);
          const totalRatio = ratio.green + ratio.brown;
          const greenPct = totalRatio > 0 ? (ratio.green / totalRatio) * 100 : 50;
          const isExpanded = expandedPile === pile.id;
          const recentEntries = pile.entries.slice(0, 5);

          return (
            <div key={pile.id} style={cardStyle}>
              {/* Pile header */}
              <div
                style={{ cursor: "pointer" }}
                onClick={() => setExpandedPile(isExpanded ? null : pile.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{pile.name}</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        padding: "2px 7px",
                        borderRadius: 4,
                        background: status.bg,
                        color: status.color,
                      }}
                    >
                      {t(`compost.status_${pile.status}`, status.label)}
                    </span>
                    <span style={{ fontSize: 11, color: colors.muted }}>
                      {t(`compost.type_${pile.type}`, typeLabels[pile.type] ?? pile.type)}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 16,
                      color: colors.muted,
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    &#9660;
                  </span>
                </div>

                {/* Progress bar */}
                {pile.estimatedReadyAt && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: colors.muted, marginBottom: 4 }}>
                      <span>{t("compost.started", "Started")} {pile.startedAt}</span>
                      <span>
                        {progress >= 100
                          ? t("compost.ready_label", "Ready!")
                          : `${t("compost.est_ready", "Est. ready")} ${pile.estimatedReadyAt}`}
                      </span>
                    </div>
                    <div style={{ background: colors.border, borderRadius: 4, height: 8, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${progress}%`,
                          height: "100%",
                          background: progress >= 100 ? colors.accent : colors.primary,
                          borderRadius: 4,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${colors.border}` }}>
                  {/* Temperature + Green/Brown row */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    {/* Temperature gauge */}
                    {pile.temperatureF != null && (
                      <div
                        style={{
                          flex: 1,
                          background: colors.surface,
                          borderRadius: 6,
                          padding: "12px 14px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>
                          {t("compost.temperature", "Temperature")}
                        </div>
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: tempColor(pile.temperatureF),
                          }}
                        >
                          {pile.temperatureF}&deg;F
                        </div>
                        <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                          {pile.temperatureF < 90
                            ? t("compost.temp_cool", "Cool -- needs activity")
                            : pile.temperatureF < 130
                            ? t("compost.temp_warm", "Warm -- decomposing")
                            : pile.temperatureF <= 160
                            ? t("compost.temp_hot", "Hot -- active thermophilic")
                            : t("compost.temp_too_hot", "Too hot -- turn pile")}
                        </div>
                      </div>
                    )}

                    {/* Green/brown ratio */}
                    <div
                      style={{
                        flex: 1,
                        background: colors.surface,
                        borderRadius: 6,
                        padding: "12px 14px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>
                        {t("compost.green_brown_ratio", "Green : Brown Ratio")}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: colors.text }}>
                        {ratio.green} : {ratio.brown}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          height: 8,
                          borderRadius: 4,
                          overflow: "hidden",
                          marginTop: 8,
                        }}
                      >
                        <div
                          style={{
                            width: `${greenPct}%`,
                            background: colors.accent,
                            transition: "width 0.3s ease",
                          }}
                        />
                        <div
                          style={{
                            width: `${100 - greenPct}%`,
                            background: "#8b6914",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 10, color: colors.muted, marginTop: 4 }}>
                        {t("compost.ideal_ratio", "Ideal: ~1 green to 2-3 brown")}
                      </div>
                    </div>
                  </div>

                  {/* Recent entries timeline */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                      {t("compost.recent_entries", "Recent Entries")}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {recentEntries.map((entry, i) => (
                        <div
                          key={`${entry.date}-${i}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            fontSize: 13,
                          }}
                        >
                          <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 }}>
                            {entryIcons[entry.type] ?? "\ud83d\udcdd"}
                          </span>
                          <div
                            style={{
                              width: 2,
                              height: 24,
                              background: i < recentEntries.length - 1 ? colors.border : "transparent",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: 500 }}>
                              {t(`compost.entry_type_${entry.type}`, entry.type)}
                            </span>
                            {entry.material && (
                              <span style={{ color: colors.muted }}> &mdash; {entry.material}</span>
                            )}
                          </div>
                          <span style={{ fontSize: 11, color: colors.muted, flexShrink: 0 }}>
                            {entry.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Entry button */}
                  <button
                    onClick={() => (onAddEntry ?? (() => {}))(pile.id)}
                    style={{
                      ...buttonStyle,
                      background: "white",
                      color: colors.primary,
                      border: `1px solid ${colors.primary}`,
                      width: "100%",
                    }}
                  >
                    {t("compost.add_entry", "Add Entry")}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* NRI Composting tip */}
      <div
        style={{
          ...cardStyle,
          marginTop: 12,
          background: "#f0f7f7",
          borderColor: colors.primary,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ fontSize: 24, flexShrink: 0 }}>{"\ud83c\udf3f"}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.primary }}>
              {t("compost.nri_tip_title", "NRI Composting Tip")}
            </div>
            <p style={{ fontSize: 13, color: colors.muted, margin: "6px 0 0", lineHeight: 1.5 }}>
              {t(
                "compost.nri_tip_body",
                "Healthy compost is a miniature ecosystem. The organisms breaking down your pile -- bacteria, fungi, insects, worms -- are the same ones that build living soil in your garden beds. A thermophilic pile (130-160F) destroys weed seeds and pathogens, while a slower cool pile preserves more fungal diversity. Match your method to your need: hot compost for speed and sanitation, cool compost or worm bins for biology. Either way, you are feeding the soil food web."
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

const buttonStyle: React.CSSProperties = {
  background: "#0d6f74",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "8px 16px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'Work Sans', system-ui, sans-serif",
};

export default CompostTracker;
