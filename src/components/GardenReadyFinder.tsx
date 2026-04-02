import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SeedIcon } from "./ScreenToSoil";

/**
 * Garden-Ready Vacant Lot Finder
 *
 * Helps communities identify vacant or underutilized land
 * that could become food gardens. Uses parcel/GIS data and
 * NRI to assess soil, sun, and access for potential sites.
 *
 * Inspired by:
 * - Strong Towns' "reclaiming vacant land" advocacy
 * - Local Futures' "reclaiming vacant spaces" Action Guide
 * - Urban Acres Peoria model (farming vacant lots after grocery store closed)
 */

interface VacantLot {
  id: string;
  address: string;
  lat: number;
  lon: number;
  areaAcres: number;
  landUseCode: string;
  landUseLabel: string;
  ownerType: "public" | "private" | "unknown";
  zoningSuitable: boolean;
  estimatedSunHours: number;
  soilAssessment: string | null;
  waterAccess: "hydrant_nearby" | "well_possible" | "unknown" | "none";
  gardenScore: number; // 0-100 suitability score
  distanceMiles: number;
  notes: string;
}

interface GardenReadyFinderProps {
  lots?: VacantLot[];
  userZip?: string;
  onSelectLot?: (lot: VacantLot) => void;
  onRequestAssessment?: (lot: VacantLot) => void;
}

// Demo data for the scaffold
const DEMO_LOTS: VacantLot[] = [
  {
    id: "lot-1",
    address: "412 River St (vacant lot)",
    lat: 44.73,
    lon: -93.33,
    areaAcres: 0.18,
    landUseCode: "100",
    landUseLabel: "Vacant residential",
    ownerType: "public",
    zoningSuitable: true,
    estimatedSunHours: 7.5,
    soilAssessment: "Sandy loam, well-drained. Good for raised beds.",
    waterAccess: "hydrant_nearby",
    gardenScore: 88,
    distanceMiles: 0.3,
    notes: "City-owned. South-facing. Previously cleared 2024.",
  },
  {
    id: "lot-2",
    address: "1801 Cedar Ave (unused church lot)",
    lat: 44.74,
    lon: -93.34,
    areaAcres: 0.42,
    landUseCode: "170",
    landUseLabel: "Institutional - unused portion",
    ownerType: "private",
    zoningSuitable: true,
    estimatedSunHours: 6.0,
    soilAssessment: "Clay loam. Would benefit from raised beds or No-Dig approach.",
    waterAccess: "hydrant_nearby",
    gardenScore: 74,
    distanceMiles: 0.8,
    notes: "Church may be open to community garden lease. Partial shade from building.",
  },
  {
    id: "lot-3",
    address: "2205 Industrial Blvd (brownfield edge)",
    lat: 44.72,
    lon: -93.31,
    areaAcres: 0.65,
    landUseCode: "200",
    landUseLabel: "Vacant commercial",
    ownerType: "unknown",
    zoningSuitable: false,
    estimatedSunHours: 8.0,
    soilAssessment: null,
    waterAccess: "unknown",
    gardenScore: 35,
    distanceMiles: 1.4,
    notes: "Potential contamination — soil testing required before food production. Good sun.",
  },
];

export function GardenReadyFinder({
  lots = DEMO_LOTS,
  userZip = "55378",
  onSelectLot,
  onRequestAssessment,
}: GardenReadyFinderProps) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterPublic, setFilterPublic] = useState(false);
  const [sortBy, setSortBy] = useState<"score" | "distance">("score");

  const filtered = lots
    .filter((lot) => !filterPublic || lot.ownerType === "public")
    .sort((a, b) =>
      sortBy === "score"
        ? b.gardenScore - a.gardenScore
        : a.distanceMiles - b.distanceMiles,
    );

  const _selected = lots.find((l) => l.id === selectedId);
  void _selected; // Reserved for detail panel expansion

  return (
    <div style={container}>
      {/* Header */}
      <div style={header}>
        <div>
          <h2 style={title}>
            {t("gardenReady.title", "Garden-Ready Sites")}
          </h2>
          <p style={subtitle}>
            {t(
              "gardenReady.subtitle",
              "Vacant and underutilized land near {{zip}} that could grow food",
            ).replace("{{zip}}", userZip)}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          <button
            onClick={() => setFilterPublic(!filterPublic)}
            style={{
              ...filterButton,
              background: filterPublic ? "#0d6f74" : "white",
              color: filterPublic ? "white" : "#706b63",
            }}
          >
            {t("gardenReady.public_only", "Public land only")}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "score" | "distance")}
            style={selectStyle}
          >
            <option value="score">
              {t("gardenReady.sort_score", "Best suited")}
            </option>
            <option value="distance">
              {t("gardenReady.sort_distance", "Nearest")}
            </option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div style={resultsGrid}>
        {filtered.map((lot) => (
          <div
            key={lot.id}
            style={{
              ...lotCard,
              borderLeft: `4px solid ${getScoreColor(lot.gardenScore)}`,
              background: selectedId === lot.id ? "#f0f8f8" : "white",
            }}
            onClick={() => {
              setSelectedId(lot.id);
              onSelectLot?.(lot);
            }}
            role="button"
            tabIndex={0}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <SeedIcon size={16} color={getScoreColor(lot.gardenScore)} />
                  <strong style={{ fontSize: 14 }}>{lot.address}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 6,
                    flexWrap: "wrap" as const,
                  }}
                >
                  <span style={badge}>{lot.landUseLabel}</span>
                  <span
                    style={{
                      ...badge,
                      background:
                        lot.ownerType === "public" ? "#e0f0e8" : "#f5f0e8",
                      color:
                        lot.ownerType === "public" ? "#2d6a3e" : "#8a6d2b",
                    }}
                  >
                    {lot.ownerType === "public"
                      ? t("gardenReady.public", "Public")
                      : lot.ownerType === "private"
                        ? t("gardenReady.private", "Private")
                        : t("gardenReady.unknown_owner", "Unknown owner")}
                  </span>
                  {!lot.zoningSuitable && (
                    <span
                      style={{
                        ...badge,
                        background: "#fce8e8",
                        color: "#a03030",
                      }}
                    >
                      {t("gardenReady.zoning_issue", "Zoning issue")}
                    </span>
                  )}
                </div>
              </div>
              <div style={scoreCircle(lot.gardenScore)}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>
                  {lot.gardenScore}
                </span>
              </div>
            </div>

            {/* Details */}
            <div style={detailsRow}>
              <span style={detailItem}>
                {lot.areaAcres.toFixed(2)} {t("gardenReady.acres", "acres")}
              </span>
              <span style={detailItem}>
                {lot.estimatedSunHours}h {t("gardenReady.sun", "sun")}
              </span>
              <span style={detailItem}>
                {lot.distanceMiles.toFixed(1)} {t("gardenReady.miles", "mi")}
              </span>
              <span style={detailItem}>
                {lot.waterAccess === "hydrant_nearby"
                  ? t("gardenReady.water_nearby", "Water nearby")
                  : lot.waterAccess === "none"
                    ? t("gardenReady.no_water", "No water")
                    : t("gardenReady.water_unknown", "Water TBD")}
              </span>
            </div>

            {lot.soilAssessment && (
              <p style={soilNote}>{lot.soilAssessment}</p>
            )}

            {lot.notes && (
              <p
                style={{
                  fontSize: 12,
                  color: "#706b63",
                  margin: "6px 0 0",
                  fontStyle: "italic",
                }}
              >
                {lot.notes}
              </p>
            )}

            {!lot.soilAssessment && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestAssessment?.(lot);
                }}
                style={assessButton}
              >
                {t(
                  "gardenReady.request_assessment",
                  "Request NRI soil assessment",
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* NRI callout */}
      <div style={nriCallout}>
        <div
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 15,
            color: "#0d6f74",
            marginBottom: 6,
          }}
        >
          {t("gardenReady.nri_title", "What NRI looks for in a garden site")}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#706b63",
            lineHeight: 1.6,
          }}
        >
          {t(
            "gardenReady.nri_criteria",
            "Sun exposure (6+ hours), soil drainage, water access, slope (<5%), flood risk, contamination history, lot size (0.1+ acres for community use), and zoning compatibility. Public land and institutional lots score higher for community garden potential.",
          )}
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 70) return "#5d7d4a";
  if (score >= 40) return "#aa6d22";
  return "#c44";
}

// Styles
const container: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  flexWrap: "wrap",
  gap: 16,
  marginBottom: 20,
};

const title: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: 24,
  fontWeight: 400,
  margin: 0,
  color: "#26231d",
};

const subtitle: React.CSSProperties = {
  fontSize: 14,
  color: "#706b63",
  margin: "4px 0 0",
};

const filterButton: React.CSSProperties = {
  border: "1px solid #e8e5de",
  borderRadius: 6,
  padding: "6px 14px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const selectStyle: React.CSSProperties = {
  border: "1px solid #e8e5de",
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 12,
  background: "white",
  color: "#706b63",
};

const resultsGrid: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const lotCard: React.CSSProperties = {
  background: "white",
  borderRadius: 8,
  border: "1px solid #e8e5de",
  padding: "16px 20px",
  cursor: "pointer",
  transition: "background 180ms ease",
};

const badge: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  padding: "2px 8px",
  borderRadius: 4,
  background: "#f0ede6",
  color: "#706b63",
  textTransform: "uppercase" as const,
  letterSpacing: "0.3px",
};

function scoreCircle(score: number): React.CSSProperties {
  return {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: `${getScoreColor(score)}15`,
    border: `2px solid ${getScoreColor(score)}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: getScoreColor(score),
  };
}

const detailsRow: React.CSSProperties = {
  display: "flex",
  gap: 16,
  marginTop: 10,
  flexWrap: "wrap",
};

const detailItem: React.CSSProperties = {
  fontSize: 12,
  color: "#706b63",
};

const soilNote: React.CSSProperties = {
  fontSize: 13,
  color: "#26231d",
  margin: "8px 0 0",
  padding: "8px 12px",
  background: "#faf8f4",
  borderRadius: 6,
  borderLeft: "3px solid #5d7d4a",
};

const assessButton: React.CSSProperties = {
  background: "none",
  border: "1px dashed #0d6f74",
  borderRadius: 6,
  padding: "6px 14px",
  fontSize: 12,
  color: "#0d6f74",
  cursor: "pointer",
  marginTop: 8,
};

const nriCallout: React.CSSProperties = {
  background: "#f0f8f8",
  border: "1px solid #d0e8e8",
  borderRadius: 10,
  padding: 20,
  marginTop: 24,
};
