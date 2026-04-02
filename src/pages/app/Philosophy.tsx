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

interface PhilosophyData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  gifts: string[];
  costs: string[];
  bestFor: string[];
  soilFit: string[];
}

const philosophies: PhilosophyData[] = [
  {
    id: "backToEden",
    name: "Back to Eden",
    tagline: "Cover the ground and let it do the work.",
    description:
      "Deep wood chip mulching. No tilling. Minimal watering once established. Based on Paul Gautschi's observation that forest floors grow without human intervention.",
    icon: "\uD83C\uDF32",
    gifts: [
      "Very low maintenance once established",
      "Almost no weeding",
      "Builds incredible soil over time",
      "Free or cheap materials (arborist chips)",
    ],
    costs: [
      "Heavy upfront labor (chip hauling)",
      "Takes 1-2 seasons to break in",
      "Not ideal for root crops year one",
    ],
    bestFor: [
      "Patient beginners",
      "Large plots",
      "People who hate weeding",
      "Anyone near free wood chips",
    ],
    soilFit: ["Works on any soil -- the chips create their own layer"],
  },
  {
    id: "noDig",
    name: "No-Dig",
    tagline: "Build up. Never break the soil.",
    description:
      "Charles Dowding's method. Layer compost on top of existing ground. Plant directly into compost. Never disturb soil biology.",
    icon: "\uD83E\uDEA8",
    gifts: [
      "Fast to start -- beds can be planted same day",
      "Excellent soil biology preservation",
      "Great yields from year one",
      "Less physical strain",
    ],
    costs: [
      "Compost can be expensive if buying",
      "Needs annual top-dressing",
      "Requires good compost sourcing",
    ],
    bestFor: [
      "Urban gardeners",
      "Small to medium plots",
      "People who want results this season",
      "Anyone with access to compost",
    ],
    soilFit: ["Excellent on clay (builds on top)", "Good on any soil type"],
  },
  {
    id: "kitchenGarden",
    name: "Kitchen Garden",
    tagline: "Grow what you eat. Eat what you grow.",
    description:
      "Traditional raised-bed vegetable gardening focused on feeding the household. Practical, beautiful, productive.",
    icon: "\uD83C\uDF75",
    gifts: [
      "Direct connection between garden and table",
      "Organized and manageable",
      "Great for families",
      "Visually beautiful",
    ],
    costs: [
      "Raised bed materials cost money",
      "Requires regular attention",
      "Soil amendments needed",
    ],
    bestFor: [
      "Families",
      "Cooks",
      "People who want a pretty, productive garden",
      "Suburban yards",
    ],
    soilFit: ["Best with amended or imported soil in raised beds"],
  },
  {
    id: "habitatFirst",
    name: "Habitat First",
    tagline: "Grow for the birds, the bees, and the soil.",
    description:
      "Prioritize native plants, pollinator support, and ecological function. Food production is a bonus, not the goal.",
    icon: "\uD83D\uDC1D",
    gifts: [
      "Low maintenance once established",
      "Supports local ecosystem",
      "Beautiful and wild",
      "Resilient to climate swings",
    ],
    costs: [
      "Less food production",
      "Can look 'messy' to neighbors",
      "Native plant sourcing takes effort",
    ],
    bestFor: [
      "Nature lovers",
      "People with large or wild spaces",
      "Community gardens with ecological goals",
      "Anyone wanting to help pollinators",
    ],
    soilFit: ["Works with existing native soil -- that's the point"],
  },
  {
    id: "homestead",
    name: "Homestead",
    tagline: "Grow enough to matter.",
    description:
      "Scale-up food production for real self-sufficiency. Preservation, storage crops, calorie crops, year-round planning.",
    icon: "\uD83C\uDFE1",
    gifts: [
      "Meaningful food independence",
      "Deep seasonal knowledge",
      "Real cost savings at scale",
      "Preservation skills",
    ],
    costs: [
      "Significant time commitment",
      "Larger space needed",
      "Steeper learning curve",
      "Preservation equipment costs",
    ],
    bestFor: [
      "Rural properties",
      "Serious food growers",
      "Families committed to self-sufficiency",
      "People with half-acre or more",
    ],
    soilFit: ["Benefits most from soil testing and amendment planning"],
  },
  {
    id: "communityGarden",
    name: "Community Garden",
    tagline: "Grow together.",
    description:
      "Shared space, shared work, shared harvest. Whether it's a church plot, neighborhood garden, or school project.",
    icon: "\uD83E\uDD1D",
    gifts: [
      "Social connection",
      "Shared costs and labor",
      "Learning from others",
      "Community resilience",
    ],
    costs: [
      "Coordination overhead",
      "Shared decision-making",
      "Plot size usually limited",
      "Rules and schedules",
    ],
    bestFor: [
      "Apartment dwellers",
      "New gardeners who want mentorship",
      "Community organizers",
      "Schools and churches",
    ],
    soilFit: ["Usually raised beds with imported soil"],
  },
];

export default function Philosophy() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState("backToEden");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);

  const currentPhil = philosophies.find((p) => p.id === current);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const detailLabel: React.CSSProperties = {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    color: tokens.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 14,
  };

  const detailList: React.CSSProperties = {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 13,
    color: tokens.text,
    lineHeight: 1.6,
    margin: 0,
    paddingLeft: 18,
  };

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
          {t("philosophy.title")}
        </h1>
        <p
          style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 14,
            color: tokens.muted,
            marginBottom: 28,
          }}
        >
          {t("philosophy.subtitle")}
        </p>

        {/* Current philosophy highlight */}
        {currentPhil && !changing && (
          <div
            style={{
              backgroundColor: tokens.surface,
              border: `2px solid ${tokens.primary}`,
              borderRadius: 14,
              padding: "20px 22px",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: tokens.primary,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: 8,
              }}
            >
              {t("philosophy.current")}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 36 }}>{currentPhil.icon}</span>
              <div>
                <div
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 22,
                    color: tokens.text,
                    fontWeight: 400,
                  }}
                >
                  {currentPhil.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: 14,
                    color: tokens.muted,
                  }}
                >
                  {currentPhil.tagline}
                </div>
              </div>
            </div>
            <button
              onClick={() => setChanging(true)}
              style={{
                marginTop: 14,
                background: "none",
                border: "none",
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 13,
                color: tokens.primary,
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Change philosophy
            </button>
          </div>
        )}

        {/* All philosophies */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {philosophies.map((p) => {
            const isExpanded = expanded === p.id;
            const isCurrent = current === p.id;
            return (
              <div
                key={p.id}
                style={{
                  backgroundColor: tokens.surface,
                  borderRadius: 12,
                  border: isCurrent
                    ? `2px solid ${tokens.primary}`
                    : "1px solid #e0ddd6",
                  overflow: "hidden",
                }}
              >
                {/* Card header */}
                <div
                  onClick={() => toggleExpand(p.id)}
                  style={{
                    padding: "16px 18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontSize: 18,
                        color: tokens.text,
                        fontWeight: 400,
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Work Sans', sans-serif",
                        fontSize: 13,
                        color: tokens.muted,
                      }}
                    >
                      {p.tagline}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 18,
                      color: tokens.muted,
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.2s",
                    }}
                  >
                    &#9662;
                  </span>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div
                    style={{
                      padding: "0 18px 18px",
                      borderTop: "1px solid #eae7e1",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Work Sans', sans-serif",
                        fontSize: 14,
                        color: tokens.text,
                        lineHeight: 1.6,
                        marginTop: 14,
                        marginBottom: 0,
                      }}
                    >
                      {p.description}
                    </p>

                    <div style={detailLabel}>{t("philosophy.gifts")}</div>
                    <ul style={detailList}>
                      {p.gifts.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>

                    <div style={detailLabel}>{t("philosophy.costs")}</div>
                    <ul style={detailList}>
                      {p.costs.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>

                    <div style={detailLabel}>{t("philosophy.best_for")}</div>
                    <ul style={detailList}>
                      {p.bestFor.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>

                    <div style={detailLabel}>{t("philosophy.soil_fit")}</div>
                    <ul style={detailList}>
                      {p.soilFit.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>

                    {/* Select button when changing */}
                    {changing && !isCurrent && (
                      <button
                        onClick={() => {
                          setCurrent(p.id);
                          setChanging(false);
                          setExpanded(null);
                        }}
                        style={{
                          marginTop: 16,
                          padding: "10px 20px",
                          borderRadius: 8,
                          border: "none",
                          backgroundColor: tokens.primary,
                          color: "#fff",
                          fontFamily: "'Work Sans', sans-serif",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Choose {p.name}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still exploring option */}
        <div
          onClick={() => {
            setCurrent("exploring");
            setChanging(false);
          }}
          style={{
            backgroundColor: tokens.surface,
            borderRadius: 12,
            border:
              current === "exploring"
                ? `2px solid ${tokens.primary}`
                : "1px solid #e0ddd6",
            padding: "16px 18px",
            marginTop: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span style={{ fontSize: 28, flexShrink: 0 }}>&#x1F50D;</span>
          <div>
            <div
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 18,
                color: tokens.text,
                fontWeight: 400,
              }}
            >
              {t("philosophy.explore")}
            </div>
            <div
              style={{
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 13,
                color: tokens.muted,
              }}
            >
              NRI will show advice through all lenses so you can discern what fits your ground.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
