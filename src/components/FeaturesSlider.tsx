import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FoodResilienceScore } from "./FoodResilienceScore";
import { YieldDashboard } from "./YieldDashboard";
import { SeedExchangeBoard } from "./SeedExchangeBoard";
import { CompostTracker } from "./CompostTracker";
import { EconomicImpact } from "./EconomicImpact";
import { GardenReadyFinder } from "./GardenReadyFinder";
import { QuickLog } from "./ScreenToSoil";

/**
 * Features Slider — Horizontal scrollable carousel with live React
 * component previews rendered at miniature scale inside cards.
 */

interface FeatureSlide {
  id: string;
  title: string;
  description: string;
  accent: string;
  preview: React.ReactNode;
}

const SLIDES: FeatureSlide[] = [
  {
    id: "resilience",
    title: "Food Resilience Score",
    description: "A 0-100 score measuring your household's food security. Tracks pounds produced, varieties grown, days of food, seeds saved, and crops shared. Inspired by Strong Towns' Strength Test.",
    accent: "#0d6f74",
    preview: <FoodResilienceScore />,
  },
  {
    id: "yield",
    title: "Yield Dashboard",
    description: "Production per square foot across all your beds. See which plots perform best, track season totals, and optimize your garden layout for maximum output.",
    accent: "#5d7d4a",
    preview: <YieldDashboard />,
  },
  {
    id: "seed-exchange",
    title: "Seed Exchange",
    description: "Share seeds with your community. Offer heirloom varieties, request what you need, or swap with neighbors. Every seed shared fights the loss of 90% of crop diversity.",
    accent: "#aa6d22",
    preview: <SeedExchangeBoard />,
  },
  {
    id: "compost",
    title: "Compost Tracker",
    description: "Manage your compost piles with green/brown ratio tracking, temperature monitoring, and turn reminders. The most impactful thing you can do for your soil.",
    accent: "#5d7d4a",
    preview: <CompostTracker />,
  },
  {
    id: "impact",
    title: "Economic Impact",
    description: "See the real value of your garden: grocery dollars saved, local multiplier effect, donated food value, and compost created. Your garden is an economic engine.",
    accent: "#0d6f74",
    preview: <EconomicImpact />,
  },
  {
    id: "garden-ready",
    title: "Garden-Ready Lot Finder",
    description: "Find vacant and underutilized land near you that could grow food. NRI scores each site for sun, soil, water, and zoning suitability.",
    accent: "#8b5e3c",
    preview: <GardenReadyFinder />,
  },
  {
    id: "quick-log",
    title: "Screen-to-Soil",
    description: "One-tap observation logging gets you back outside fast. Hortus is designed to minimize screen time and maximize time in the garden.",
    accent: "#aa6d22",
    preview: (
      <div style={{ padding: 16 }}>
        <QuickLog onLog={() => {}} />
      </div>
    ),
  },
];

export function FeaturesSlider() {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 360;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section style={container}>
      <div style={headerRow}>
        <div>
          <h2 style={heading}>
            {t("common.app_name")} Features
          </h2>
          <p style={subheading}>
            Live previews — these are real components, not mockups
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => scroll("left")} style={arrowButton} aria-label="Scroll left">
            ←
          </button>
          <button onClick={() => scroll("right")} style={arrowButton} aria-label="Scroll right">
            →
          </button>
        </div>
      </div>

      <div ref={scrollRef} style={scrollContainer}>
        {SLIDES.map((slide) => (
          <div key={slide.id} style={slideCard}>
            {/* Mini preview at scale */}
            <div style={previewContainer}>
              <div style={previewScaler}>
                {slide.preview}
              </div>
            </div>

            {/* Label */}
            <div style={labelContainer}>
              <div
                style={{
                  width: 4,
                  height: 24,
                  borderRadius: 2,
                  background: slide.accent,
                  flexShrink: 0,
                }}
              />
              <div>
                <h3 style={slideTitle}>{slide.title}</h3>
                <p style={slideDesc}>{slide.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      <div style={scrollHint}>
        <span style={{ fontSize: 12, color: "#706b63" }}>
          ← Scroll to explore all features →
        </span>
      </div>
    </section>
  );
}

// Styles
const container: React.CSSProperties = {
  padding: "48px 0",
  overflow: "hidden",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  padding: "0 24px",
  maxWidth: 960,
  margin: "0 auto 24px",
};

const heading: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: 32,
  fontWeight: 400,
  margin: 0,
  color: "#26231d",
};

const subheading: React.CSSProperties = {
  fontSize: 14,
  color: "#706b63",
  margin: "4px 0 0",
};

const arrowButton: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "1px solid #e8e5de",
  background: "white",
  fontSize: 18,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#0d6f74",
};

const scrollContainer: React.CSSProperties = {
  display: "flex",
  gap: 20,
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  paddingLeft: 24,
  paddingRight: 24,
  paddingBottom: 16,
  msOverflowStyle: "none",
  scrollbarWidth: "none",
};

const slideCard: React.CSSProperties = {
  minWidth: 340,
  maxWidth: 340,
  scrollSnapAlign: "start",
  borderRadius: 12,
  border: "1px solid #e8e5de",
  background: "white",
  overflow: "hidden",
  flexShrink: 0,
};

const previewContainer: React.CSSProperties = {
  height: 240,
  overflow: "hidden",
  background: "#f7f6f2",
  borderBottom: "1px solid #e8e5de",
  position: "relative",
};

const previewScaler: React.CSSProperties = {
  transform: "scale(0.45)",
  transformOrigin: "top left",
  width: "222%",
  height: "222%",
  pointerEvents: "none",
  overflow: "hidden",
};

const labelContainer: React.CSSProperties = {
  padding: "16px 20px",
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
};

const slideTitle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: 18,
  fontWeight: 400,
  margin: 0,
  color: "#26231d",
};

const slideDesc: React.CSSProperties = {
  fontSize: 13,
  color: "#706b63",
  margin: "4px 0 0",
  lineHeight: 1.5,
};

const scrollHint: React.CSSProperties = {
  textAlign: "center",
  marginTop: 8,
};
