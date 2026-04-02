import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import * as topojson from "topojson-client";
import usTopology from "us-atlas/states-albers-10m.json";
import type { Topology, GeometryCollection } from "topojson-specification";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MapPoint {
  id: string;
  type:
    | "hortus_user"
    | "farmers_market"
    | "csa"
    | "seed_library"
    | "community_garden"
    | "nursery"
    | "food_co_op"
    | "urban_farm"
    | "food_forest"
    | "compost_site";
  lat: number;
  lon: number;
  name: string;
  zip?: string;
  count?: number;
  description?: string;
}

interface FoodSystemMapProps {
  points?: MapPoint[];
  title?: string;
  showLegend?: boolean;
}

// ---------------------------------------------------------------------------
// Projection — Albers USA (matches the pre-projected topology)
// The us-atlas albers file is already projected to ~960×600
// We just need lat/lon → screen coords for our marker overlays
// ---------------------------------------------------------------------------

function albersUsa(lon: number, lat: number): [number, number] {
  // Simplified Albers USA approximation for marker placement
  // Alaska and Hawaii are repositioned to match the atlas insets
  if (lat > 50 && lon < -130) {
    // Alaska — inset bottom-left
    return [
      (lon + 180) * (160 / 60) + 80,
      (72 - lat) * (120 / 22) + 450,
    ];
  }
  if (lat < 23 && lon > -162 && lon < -154) {
    // Hawaii — inset
    return [
      (lon + 160) * (40 / 5) + 240,
      (22 - lat) * (40 / 4) + 510,
    ];
  }
  // Contiguous US
  const x = (lon + 130) * (780 / 65) + 70;
  const y = (50 - lat) * (420 / 25) + 50;
  return [x, y];
}

// ---------------------------------------------------------------------------
// Color / styling config
// ---------------------------------------------------------------------------

const TYPE_COLORS: Record<string, string> = {
  hortus_user: "#0d6f74",
  farmers_market: "#5d7d4a",
  csa: "#7a9b5a",
  seed_library: "#aa6d22",
  community_garden: "#8b5e3c",
  nursery: "#706b63",
  food_co_op: "#4a7d6a",
  urban_farm: "#5d7d4a",
  food_forest: "#3d6a3e",
  compost_site: "#8b6e3c",
};

const LEGEND_ITEMS: { type: string; label: string }[] = [
  { type: "hortus_user", label: "Hortus garden" },
  { type: "farmers_market", label: "Farmers market" },
  { type: "csa", label: "CSA" },
  { type: "seed_library", label: "Seed library" },
  { type: "community_garden", label: "Community garden" },
];

// ---------------------------------------------------------------------------
// Default demo data
// ---------------------------------------------------------------------------

const DEFAULT_POINTS: MapPoint[] = [
  // Hortus user clusters
  { id: "h1", type: "hortus_user", lat: 44.73, lon: -93.33, name: "Savage, MN", count: 3 },
  { id: "h2", type: "hortus_user", lat: 44.98, lon: -93.27, name: "Minneapolis, MN", count: 8 },
  { id: "h3", type: "hortus_user", lat: 44.94, lon: -93.09, name: "St. Paul, MN", count: 5 },
  { id: "h4", type: "hortus_user", lat: 44.83, lon: -93.30, name: "Bloomington, MN", count: 2 },
  { id: "h5", type: "hortus_user", lat: 41.88, lon: -87.63, name: "Chicago, IL", count: 4 },
  { id: "h6", type: "hortus_user", lat: 43.07, lon: -89.40, name: "Madison, WI", count: 3 },
  { id: "h7", type: "hortus_user", lat: 39.74, lon: -104.99, name: "Denver, CO", count: 2 },
  { id: "h8", type: "hortus_user", lat: 45.52, lon: -122.68, name: "Portland, OR", count: 6 },
  { id: "h9", type: "hortus_user", lat: 37.77, lon: -122.42, name: "San Francisco, CA", count: 3 },
  { id: "h10", type: "hortus_user", lat: 35.23, lon: -80.84, name: "Charlotte, NC", count: 2 },
  { id: "h11", type: "hortus_user", lat: 42.36, lon: -71.06, name: "Boston, MA", count: 4 },
  { id: "h12", type: "hortus_user", lat: 47.61, lon: -122.33, name: "Seattle, WA", count: 5 },
  // Food system points
  { id: "f1", type: "farmers_market", lat: 44.73, lon: -93.31, name: "Savage Farmers Market", description: "Saturdays 8am-1pm, May-Oct" },
  { id: "f2", type: "farmers_market", lat: 44.95, lon: -93.27, name: "Mill City Farmers Market", description: "Saturdays year-round" },
  { id: "f3", type: "farmers_market", lat: 41.90, lon: -87.62, name: "Green City Market", description: "Lincoln Park, Wed & Sat" },
  { id: "f4", type: "farmers_market", lat: 38.91, lon: -77.04, name: "FRESHFARM Dupont", description: "Sundays year-round" },
  { id: "f5", type: "farmers_market", lat: 45.52, lon: -122.68, name: "Portland Saturday Market" },
  { id: "f6", type: "community_garden", lat: 44.78, lon: -93.28, name: "Burnsville Community Garden", description: "40 plots" },
  { id: "f7", type: "community_garden", lat: 40.72, lon: -73.99, name: "LaGuardia Corner Gardens", description: "NYC community garden" },
  { id: "f8", type: "community_garden", lat: 33.75, lon: -84.39, name: "Truly Living Well", description: "Atlanta urban farm" },
  { id: "f9", type: "seed_library", lat: 44.85, lon: -93.35, name: "Scott County Seed Library", description: "Free seeds at the library" },
  { id: "f10", type: "seed_library", lat: 37.87, lon: -122.27, name: "Berkeley Seed Library" },
  { id: "f11", type: "seed_library", lat: 43.04, lon: -87.91, name: "Milwaukee Seed Library" },
  { id: "f12", type: "csa", lat: 44.69, lon: -93.40, name: "Open Hands Farm CSA", description: "20-week share" },
  { id: "f13", type: "csa", lat: 42.45, lon: -76.48, name: "Full Plate Farm CSA", description: "Finger Lakes, NY" },
  { id: "f14", type: "csa", lat: 38.54, lon: -121.74, name: "Full Belly Farm", description: "Capay Valley, CA" },
  { id: "f15", type: "urban_farm", lat: 42.33, lon: -83.05, name: "Michigan Urban Farming", description: "Detroit" },
  { id: "f16", type: "nursery", lat: 44.76, lon: -93.25, name: "Gertens Garden Center" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FoodSystemMap({
  points = DEFAULT_POINTS,
  title,
  showLegend = true,
}: FoodSystemMapProps) {
  const { t } = useTranslation();
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    point: MapPoint;
  } | null>(null);

  // Generate state path strings from topology
  const statePaths = useMemo(() => {
    const topo = usTopology as unknown as Topology<{
      states: GeometryCollection;
      nation: GeometryCollection;
    }>;
    const states = topojson.feature(topo, topo.objects.states);
    return states.features.map((feature) => ({
      id: String(feature.id),
      d: pathFromFeature(feature),
    }));
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    let gardens = 0;
    let markets = 0;
    let seedLibraries = 0;
    let csas = 0;

    for (const p of points) {
      if (p.type === "hortus_user") gardens += p.count ?? 1;
      else if (p.type === "farmers_market") markets++;
      else if (p.type === "seed_library") seedLibraries++;
      else if (p.type === "csa") csas++;
    }
    return { gardens, markets, seedLibraries, csas, total: points.length };
  }, [points]);

  return (
    <div style={container}>
      {/* Title */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          {title ?? t("map.title", "Local Food System Map")}
        </h2>
        <p style={subtitleStyle}>
          {t("map.subtitle", "Hortus gardens and local food resources across America")}
        </p>
      </div>

      {/* Map */}
      <div style={mapContainer}>
        <svg
          viewBox="0 0 975 610"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* State outlines */}
          <g>
            {statePaths.map((state) => (
              <path
                key={state.id}
                d={state.d}
                fill="#e8e5de"
                stroke="#d4d0c8"
                strokeWidth={0.8}
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* Markers — food system points first, then Hortus users on top */}
          <g>
            {points
              .filter((p) => p.type !== "hortus_user")
              .map((p) => {
                const [x, y] = albersUsa(p.lon, p.lat);
                const color = TYPE_COLORS[p.type] ?? "#706b63";
                return (
                  <circle
                    key={p.id}
                    cx={x}
                    cy={y}
                    r={4}
                    fill={color}
                    stroke="white"
                    strokeWidth={1}
                    opacity={0.85}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) =>
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        point: p,
                      })
                    }
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
          </g>
          <g>
            {points
              .filter((p) => p.type === "hortus_user")
              .map((p) => {
                const [x, y] = albersUsa(p.lon, p.lat);
                const size = Math.min(3 + (p.count ?? 1) * 1.5, 12);
                return (
                  <g
                    key={p.id}
                    transform={`translate(${x},${y})`}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) =>
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        point: p,
                      })
                    }
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {/* Seed / sprout marker */}
                    <path
                      d={`M0,${-size} C${-size * 0.6},${-size * 0.3} ${-size * 0.5},${size * 0.5} 0,${size} C${size * 0.5},${size * 0.5} ${size * 0.6},${-size * 0.3} 0,${-size}Z`}
                      fill="#0d6f74"
                      stroke="white"
                      strokeWidth={1}
                      opacity={0.9}
                    />
                    {/* Inner vein */}
                    <line
                      x1={0}
                      y1={-size * 0.5}
                      x2={0}
                      y2={size * 0.6}
                      stroke="white"
                      strokeWidth={0.6}
                      opacity={0.5}
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}
          </g>
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            style={{
              position: "fixed",
              left: tooltip.x + 12,
              top: tooltip.y - 8,
              background: "white",
              border: "1px solid #e8e5de",
              borderRadius: 8,
              padding: "8px 12px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              zIndex: 200,
              pointerEvents: "none",
              maxWidth: 220,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "#26231d" }}>
              {tooltip.point.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: TYPE_COLORS[tooltip.point.type] ?? "#706b63",
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              {tooltip.point.type === "hortus_user"
                ? `${tooltip.point.count ?? 1} Hortus garden${(tooltip.point.count ?? 1) > 1 ? "s" : ""}`
                : t(`map.${tooltip.point.type}`, tooltip.point.type.replace(/_/g, " "))}
            </div>
            {tooltip.point.description && (
              <div style={{ fontSize: 11, color: "#706b63", marginTop: 3 }}>
                {tooltip.point.description}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        {showLegend && (
          <div style={legendStyle}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#706b63", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 6 }}>
              {t("map.legend", "Legend")}
            </div>
            {LEGEND_ITEMS.map((item) => (
              <div key={item.type} style={legendItem}>
                {item.type === "hortus_user" ? (
                  <svg width={10} height={14} viewBox="-5 -7 10 14">
                    <path d="M0,-5 C-3,-1.5 -2.5,2.5 0,5 C2.5,2.5 3,-1.5 0,-5Z" fill={TYPE_COLORS[item.type]} />
                  </svg>
                ) : (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: TYPE_COLORS[item.type],
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                )}
                <span style={{ fontSize: 11, color: "#706b63" }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div style={statsBar}>
        <span>{stats.gardens} {t("map.hortus_users", "Hortus gardens")}</span>
        <span style={dot}>{"\u00b7"}</span>
        <span>{stats.markets} {t("map.farmers_market", "farmers markets")}</span>
        <span style={dot}>{"\u00b7"}</span>
        <span>{stats.seedLibraries} {t("map.seed_library", "seed libraries")}</span>
        <span style={dot}>{"\u00b7"}</span>
        <span>{stats.csas} CSAs</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GeoJSON feature → SVG path string (for pre-projected coordinates)
// ---------------------------------------------------------------------------

function pathFromFeature(feature: GeoJSON.Feature): string {
  const geom = feature.geometry;
  if (geom.type === "Polygon") {
    return polygonToPath(geom.coordinates);
  }
  if (geom.type === "MultiPolygon") {
    return geom.coordinates.map(polygonToPath).join(" ");
  }
  return "";
}

function polygonToPath(rings: GeoJSON.Position[][]): string {
  return rings
    .map((ring) => {
      const first = ring[0];
      if (!first) return "";
      const parts = [`M${first[0]},${first[1]}`];
      for (let i = 1; i < ring.length; i++) {
        const pt = ring[i];
        if (pt) parts.push(`L${pt[0]},${pt[1]}`);
      }
      parts.push("Z");
      return parts.join("");
    })
    .join(" ");
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const container: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: 20,
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: 28,
  fontWeight: 400,
  margin: 0,
  color: "#26231d",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#706b63",
  margin: "4px 0 0",
};

const mapContainer: React.CSSProperties = {
  position: "relative",
  background: "#f7f6f2",
  borderRadius: 12,
  border: "1px solid #e8e5de",
  overflow: "hidden",
};

const legendStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 16,
  right: 16,
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(4px)",
  border: "1px solid #e8e5de",
  borderRadius: 8,
  padding: "10px 14px",
};

const legendItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 3,
};

const statsBar: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 8,
  padding: "12px 0",
  fontSize: 13,
  color: "#706b63",
  flexWrap: "wrap",
};

const dot: React.CSSProperties = { opacity: 0.4 };
