import { useState } from "react";
import { useTranslation } from "react-i18next";

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

const colors = {
  stateFill: "#e8e5de",
  stateStroke: "#d4d0c8",
  hortusUser: "#0d6f74",
  farmersMarket: "#5d7d4a",
  csa: "#7a9b5a",
  seedLibrary: "#aa6d22",
  communityGarden: "#8b5e3c",
  other: "#706b63",
  bg: "#f7f6f2",
  text: "#26231d",
  muted: "#706b63",
  surface: "#fbfaf7",
  border: "#e8e5de",
};

function getPointColor(type: MapPoint["type"]): string {
  switch (type) {
    case "hortus_user":
      return colors.hortusUser;
    case "farmers_market":
      return colors.farmersMarket;
    case "csa":
      return colors.csa;
    case "seed_library":
      return colors.seedLibrary;
    case "community_garden":
      return colors.communityGarden;
    default:
      return colors.other;
  }
}

function projectAlbersUsa(lon: number, lat: number): [number, number] {
  const x = (lon + 120) * (960 / 60);
  const y = (50 - lat) * (600 / 25);
  return [x, y];
}

function polyToPath(coords: [number, number][]): string {
  if (coords.length === 0) return "";
  const projected = coords.map(([lon, lat]) => projectAlbersUsa(lon, lat));
  return (
    projected
      .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
      .join(" ") + " Z"
  );
}

// Simplified state polygons: [longitude, latitude] pairs
// These are approximate boundary coordinates for recognizable shapes
const STATE_POLYGONS: Record<string, [number, number][][]> = {
  WA: [[[-124.7,48.4],[-124.7,46],[-122.8,45.6],[-117,45.6],[-117,49],[-123,49],[-124.7,48.4]]],
  OR: [[[-124.6,46],[-124.6,42],[-117,42],[-116.5,43.8],[-117,44.3],[-117,45.6],[-122.8,45.6],[-124.6,46]]],
  CA: [[[-124.4,42],[-122.4,37.8],[-120.5,34.5],[-117.2,32.5],[-114.6,32.7],[-114.6,34.9],[-120,39],[-120,42],[-124.4,42]]],
  NV: [[[-120,42],[-120,39],[-114.6,35],[-114.6,42],[-120,42]]],
  ID: [[[-117,49],[-117,45.6],[-117,44.3],[-116.5,43.8],[-114.4,42],[-111.1,42],[-111.1,44.5],[-113,44.8],[-114,46],[-117,49]]],
  UT: [[[-114.1,42],[-114.1,37],[-109.1,37],[-109.1,41],[-111.1,41],[-111.1,42],[-114.1,42]]],
  AZ: [[[-114.8,37],[-114.6,34.9],[-114.6,32.7],[-111.1,31.3],[-109.1,31.3],[-109.1,37],[-114.8,37]]],
  MT: [[[-116,49],[-116,45],[-111.1,44.5],[-104.1,45],[-104.1,49],[-116,49]]],
  WY: [[[-111.1,45],[-111.1,41],[-104.1,41],[-104.1,45],[-111.1,45]]],
  CO: [[[-109.1,41],[-109.1,37],[-102.1,37],[-102.1,41],[-109.1,41]]],
  NM: [[[-109.1,37],[-109.1,31.3],[-108,31.8],[-106.6,31.8],[-103.1,32],[-103.1,37],[-109.1,37]]],
  ND: [[[-104.1,49],[-104.1,45.9],[-96.6,45.9],[-96.8,49],[-104.1,49]]],
  SD: [[[-104.1,45.9],[-104.1,42.5],[-96.4,42.5],[-96.5,43.5],[-96.6,45.9],[-104.1,45.9]]],
  NE: [[[-104.1,43],[-104.1,40],[-102.1,40],[-95.3,40],[-95.8,42.5],[-104.1,43]]],
  KS: [[[-102.1,40],[-102.1,37],[-94.6,37],[-94.6,40],[-102.1,40]]],
  OK: [[[-103,37],[-103,36.5],[-100,36.5],[-100,34.6],[-94.4,33.6],[-94.4,37],[-103,37]]],
  TX: [[[-106.6,32],[-103.1,32],[-103.1,36.5],[-100,36.5],[-100,34.6],[-94.4,33.6],[-94,30],[-97,26],[-99.8,26.4],[-103,29],[-106.5,31.8],[-106.6,32]]],
  MN: [[[-97.2,49],[-97.2,43.5],[-91.2,43.5],[-91.7,44.6],[-92.1,46.7],[-89.5,48],[-95,49],[-97.2,49]]],
  IA: [[[-96.5,43.5],[-96.4,42.5],[-95.8,42.5],[-90.1,41.5],[-90.1,42.5],[-91.1,43.5],[-96.5,43.5]]],
  MO: [[[-95.7,40.6],[-95.2,39.1],[-94.6,39.1],[-94.6,37],[-89.1,36.5],[-89.1,37.7],[-90.3,38.5],[-91.4,40],[-91.4,40.6],[-95.7,40.6]]],
  AR: [[[-94.5,36.5],[-94.5,33],[-91,33],[-91.1,36.5],[-94.5,36.5]]],
  LA: [[[-94.1,33],[-94.1,30.5],[-93,29.7],[-91,29.2],[-89.6,29.5],[-89,29],[-89,30.1],[-89,31],[-91,31],[-91,33],[-94.1,33]]],
  WI: [[[-92.9,46.8],[-92.1,46.7],[-87.8,45],[-87,44.7],[-87.5,42.5],[-90.6,42.5],[-92.9,44.8],[-92.9,46.8]]],
  IL: [[[-91.5,42.5],[-87.5,42.5],[-87.5,39.5],[-87.9,38],[-89.1,37.7],[-89.1,36.5],[-89.5,37],[-90.6,38.6],[-91.5,40.5],[-91.5,42.5]]],
  MI_L: [[[-87.5,45.8],[-84.8,45.8],[-82.4,43],[-82.5,41.7],[-84.8,41.7],[-86.8,41.8],[-87.5,42.5],[-87,44.7],[-87.5,45.8]]],
  MI_U: [[[-90.4,46.6],[-90.4,45.5],[-87,45],[-84.8,45.8],[-84.8,46.5],[-88,47],[-90.4,46.6]]],
  IN: [[[-88,41.8],[-84.8,41.8],[-84.8,39.1],[-87.5,37.8],[-87.9,38],[-87.5,39.5],[-88,41.8]]],
  OH: [[[-84.8,41.8],[-80.5,41.8],[-80.5,38.4],[-82.6,38.4],[-84.8,39.1],[-84.8,41.8]]],
  KY: [[[-89.5,36.5],[-84,36.5],[-82.6,37.7],[-82.6,38.4],[-84.8,39.1],[-87.5,37.8],[-87.9,38],[-89.1,37.7],[-89.5,36.5]]],
  TN: [[[-90.3,35],[-81.6,35],[-81.6,36.6],[-89.5,36.6],[-90.3,35]]],
  MS: [[[-91.6,35],[-88.1,35],[-88.3,30.2],[-89.4,30.2],[-89.7,30.8],[-91,31],[-91.6,33],[-91.6,35]]],
  AL: [[[-88.5,35],[-85,35],[-85,31],[-87.5,30.3],[-88.3,30.2],[-88.5,35]]],
  GA: [[[-85.6,35],[-81,35],[-80.8,32],[-81,31.2],[-82,30.6],[-84.9,30.6],[-85.6,31],[-85.6,35]]],
  FL: [[[-87.6,31],[-85,30.9],[-85,29.8],[-82,25.1],[-80.1,25.2],[-80.1,27],[-81.1,30.7],[-82,30.7],[-87.6,31]]],
  SC: [[[-83.4,35],[-79,33.2],[-78.6,33.9],[-81,35],[-83.4,35]]],
  NC: [[[-84.3,35.2],[-75.5,35.2],[-75.5,36.6],[-84.3,36.6],[-84.3,35.2]]],
  VA: [[[-83.7,36.6],[-75.4,36.9],[-75.6,37.2],[-76.3,37.1],[-76.1,38.2],[-77.2,38.4],[-79.5,39.3],[-80.5,39.7],[-80.5,38.4],[-82.6,37.7],[-83.7,36.6]]],
  WV: [[[-82.6,38.4],[-80.5,38.4],[-80.5,39.7],[-79.5,39.3],[-77.7,39.3],[-77.7,38.3],[-79.5,37.4],[-82.6,37.7],[-82.6,38.4]]],
  PA: [[[-80.5,42],[-75,42],[-74.7,40],[-75.6,39.7],[-80.5,39.7],[-80.5,42]]],
  NY: [[[-79.8,42.5],[-73.7,42.5],[-73.7,41],[-74.3,40.5],[-72,40.6],[-71.9,41.3],[-73.7,41],[-75,42],[-79.8,42.5]]],
  NJ: [[[-75.6,41.4],[-73.9,40.5],[-74,39],[-75.6,39.4],[-75.6,41.4]]],
  CT: [[[-73.7,42.1],[-72,42.1],[-72,41],[-73.7,41],[-73.7,42.1]]],
  RI: [[[-72,42],[-71.1,42],[-71.1,41.1],[-72,41.1],[-72,42]]],
  MA: [[[-73.5,42.8],[-69.9,42.8],[-69.9,41.5],[-70.5,41.5],[-71.8,41.3],[-73.5,42.1],[-73.5,42.8]]],
  VT: [[[-73.4,45],[-73.4,42.7],[-72.5,42.7],[-72.5,45],[-73.4,45]]],
  NH: [[[-72.5,45],[-72.5,42.7],[-71,42.7],[-71,44],[-71.5,45.3],[-72.5,45]]],
  ME: [[[-71.1,45.3],[-71.1,43],[-67,43.5],[-67,44.8],[-69,47.4],[-71.1,45.3]]],
  MD: [[[-79.5,39.7],[-75.1,39.7],[-75.1,38],[-76.1,38.2],[-77.2,38.4],[-79.5,39.3],[-79.5,39.7]]],
  DE: [[[-75.8,39.8],[-75.1,39.8],[-75.1,38.4],[-75.8,38.4],[-75.8,39.8]]],
};

function buildStatePaths(): { id: string; d: string }[] {
  const result: { id: string; d: string }[] = [];
  for (const [id, polygons] of Object.entries(STATE_POLYGONS)) {
    for (const poly of polygons) {
      result.push({ id, d: polyToPath(poly) });
    }
  }
  // Alaska inset (bottom-left)
  result.push({
    id: "AK",
    d: "M30,510 L30,555 L150,555 L150,530 L120,510 Z",
  });
  // Hawaii inset (bottom-left, right of Alaska)
  result.push({
    id: "HI",
    d: "M180,540 L190,535 L200,540 L195,548 L185,548 Z M205,532 L215,528 L220,535 L210,538 Z",
  });
  return result;
}

const DEFAULT_POINTS: MapPoint[] = [
  // Hortus user clusters
  { id: "h1", type: "hortus_user", lat: 40.7, lon: -74, name: "NYC Growers", count: 48, description: "Active urban garden network" },
  { id: "h2", type: "hortus_user", lat: 34.1, lon: -118.2, name: "LA Garden Collective", count: 35, description: "Southern California growers" },
  { id: "h3", type: "hortus_user", lat: 41.9, lon: -87.6, name: "Chicago Roots", count: 22, description: "Midwest garden community" },
  { id: "h4", type: "hortus_user", lat: 47.6, lon: -122.3, name: "Seattle Sprouts", count: 31, description: "Pacific NW permaculture" },
  { id: "h5", type: "hortus_user", lat: 29.8, lon: -95.4, name: "Houston Homesteads", count: 18, description: "Texas urban farming" },
  { id: "h6", type: "hortus_user", lat: 39.7, lon: -105, name: "Denver Gardeners", count: 14, description: "Front Range growers" },
  { id: "h7", type: "hortus_user", lat: 45.5, lon: -122.7, name: "Portland Plots", count: 27, description: "Rose City gardens" },
  { id: "h8", type: "hortus_user", lat: 33.4, lon: -84.4, name: "Atlanta Growers", count: 12, description: "Southeast garden hub" },
  // Farmers markets
  { id: "f1", type: "farmers_market", lat: 38.9, lon: -77, name: "Dupont Circle Market", zip: "20036", description: "Year-round farmers market" },
  { id: "f2", type: "farmers_market", lat: 37.8, lon: -122.4, name: "Ferry Building Market", zip: "94111", description: "Iconic SF marketplace" },
  { id: "f3", type: "farmers_market", lat: 42.4, lon: -71.1, name: "Boston Public Market", zip: "02109", description: "Indoor year-round market" },
  { id: "f4", type: "farmers_market", lat: 36.2, lon: -86.8, name: "Nashville Market", zip: "37201", description: "Tennessee fresh produce" },
  { id: "f5", type: "farmers_market", lat: 44.9, lon: -93.3, name: "Minneapolis Market", zip: "55401", description: "Mill City market" },
  // CSAs
  { id: "c1", type: "csa", lat: 42.3, lon: -72.6, name: "Pioneer Valley CSA", description: "Western MA farm shares" },
  { id: "c2", type: "csa", lat: 40.1, lon: -75.3, name: "Chester County CSA", description: "PA organic farm shares" },
  { id: "c3", type: "csa", lat: 43.1, lon: -89.3, name: "Madison Area CSA", description: "Wisconsin farm shares" },
  // Seed libraries
  { id: "s1", type: "seed_library", lat: 37.4, lon: -122.2, name: "Bay Area Seed Library", description: "Heirloom seed exchange" },
  { id: "s2", type: "seed_library", lat: 35.8, lon: -78.6, name: "Raleigh Seed Swap", description: "Triangle seed sharing" },
  { id: "s3", type: "seed_library", lat: 39.1, lon: -84.5, name: "Cincinnati Seeds", description: "Ohio Valley seed library" },
  { id: "s4", type: "seed_library", lat: 32.7, lon: -117.2, name: "San Diego Seed Bank", description: "SoCal native seeds" },
  // Community gardens
  { id: "g1", type: "community_garden", lat: 41.8, lon: -71.4, name: "Providence Garden", description: "Rhode Island community plots" },
  { id: "g2", type: "community_garden", lat: 39.3, lon: -76.6, name: "Baltimore Gardens", description: "Charm City growing spaces" },
  { id: "g3", type: "community_garden", lat: 30.3, lon: -97.7, name: "Austin Community Garden", description: "Central Texas plots" },
  // Other types
  { id: "o1", type: "food_co_op", lat: 44.5, lon: -73.2, name: "Burlington Co-op", description: "Vermont food cooperative" },
  { id: "o2", type: "urban_farm", lat: 42.3, lon: -83.1, name: "Detroit Urban Farm", description: "Motor City agriculture" },
  { id: "o3", type: "food_forest", lat: 47.5, lon: -122.3, name: "Beacon Food Forest", description: "Public food forest" },
  { id: "o4", type: "compost_site", lat: 40.8, lon: -73.9, name: "NYC Compost Project", description: "Community composting" },
];

function SproutIcon({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  const s = size;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={2 * s} rx={1.5 * s} ry={s} fill={color} opacity={0.25} />
      <line x1={0} y1={0} x2={0} y2={2 * s} stroke={color} strokeWidth={s * 0.5} strokeLinecap="round" />
      <ellipse cx={-s * 0.7} cy={-s * 0.2} rx={s * 0.8} ry={s * 0.5} fill={color} transform="rotate(-30)" />
      <ellipse cx={s * 0.7} cy={-s * 0.2} rx={s * 0.8} ry={s * 0.5} fill={color} transform="rotate(30)" />
    </g>
  );
}

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

  const statePaths = buildStatePaths();

  const gardenCount = points.filter(
    (p) => p.type === "community_garden" || p.type === "hortus_user"
  ).length;
  const marketCount = points.filter((p) => p.type === "farmers_market").length;
  const seedLibCount = points.filter((p) => p.type === "seed_library").length;

  const legendItems: { color: string; label: string }[] = [
    { color: colors.hortusUser, label: t("map.hortusUsers", "Hortus Users") },
    { color: colors.farmersMarket, label: t("map.farmersMarkets", "Farmers Markets") },
    { color: colors.csa, label: t("map.csas", "CSAs") },
    { color: colors.seedLibrary, label: t("map.seedLibraries", "Seed Libraries") },
    { color: colors.communityGarden, label: t("map.communityGardens", "Community Gardens") },
    { color: colors.other, label: t("map.other", "Other") },
  ];

  return (
    <div
      style={{
        background: colors.bg,
        borderRadius: 12,
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: colors.text,
        position: "relative",
      }}
    >
      {/* Title */}
      <h2
        style={{
          margin: "0 0 16px 0",
          fontSize: 20,
          fontWeight: 600,
          color: colors.text,
        }}
      >
        {title || t("map.title", "Food System Map")}
      </h2>

      {/* Map container */}
      <div style={{ position: "relative", background: colors.surface, borderRadius: 8, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
        <svg
          viewBox="0 0 960 600"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* State outlines */}
          <g>
            {statePaths.map((s, i) => (
              <path
                key={`${s.id}-${i}`}
                d={s.d}
                fill={colors.stateFill}
                stroke={colors.stateStroke}
                strokeWidth={1}
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* Alaska / Hawaii labels */}
          <text x={90} y={508} fontSize={8} fill={colors.muted} textAnchor="middle">
            AK
          </text>
          <text x={200} y={527} fontSize={8} fill={colors.muted} textAnchor="middle">
            HI
          </text>

          {/* Data points */}
          <g>
            {points.map((point) => {
              const [px, py] = projectAlbersUsa(point.lon, point.lat);
              const isUser = point.type === "hortus_user";
              const baseSize = isUser
                ? 3 + Math.min((point.count || 1) / 8, 5)
                : 4;

              return (
                <g
                  key={point.id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    const svg = (e.target as SVGElement).closest("svg");
                    if (!svg) return;
                    const rect = svg.getBoundingClientRect();
                    const scaleX = rect.width / 960;
                    const scaleY = rect.height / 600;
                    setTooltip({
                      x: px * scaleX + rect.left - (svg.closest("div")?.getBoundingClientRect().left || 0),
                      y: py * scaleY,
                      point,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {isUser ? (
                    <SproutIcon
                      x={px}
                      y={py}
                      size={baseSize}
                      color={colors.hortusUser}
                    />
                  ) : (
                    <>
                      <circle
                        cx={px}
                        cy={py}
                        r={baseSize}
                        fill={getPointColor(point.type)}
                        opacity={0.85}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                      <circle
                        cx={px}
                        cy={py}
                        r={baseSize + 3}
                        fill={getPointColor(point.type)}
                        opacity={0.15}
                      />
                    </>
                  )}
                </g>
              );
            })}
          </g>

          {/* Legend inside SVG */}
          {showLegend && (
            <g transform="translate(780, 440)">
              <rect
                x={-10}
                y={-16}
                width={170}
                height={legendItems.length * 22 + 24}
                rx={6}
                fill={colors.surface}
                stroke={colors.border}
                strokeWidth={1}
                opacity={0.95}
              />
              <text
                x={0}
                y={0}
                fontSize={11}
                fontWeight={600}
                fill={colors.text}
              >
                {t("map.legend", "Legend")}
              </text>
              {legendItems.map((item, i) => (
                <g key={item.label} transform={`translate(0, ${18 + i * 22})`}>
                  {item.color === colors.hortusUser ? (
                    <SproutIcon x={6} y={-2} size={3} color={item.color} />
                  ) : (
                    <circle cx={6} cy={0} r={5} fill={item.color} opacity={0.85} />
                  )}
                  <text x={20} y={4} fontSize={10} fill={colors.text}>
                    {item.label}
                  </text>
                </g>
              ))}
            </g>
          )}
        </svg>

        {/* Tooltip overlay */}
        {tooltip && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x,
              top: tooltip.y - 10,
              transform: "translate(-50%, -100%)",
              background: "#fff",
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              padding: "8px 12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              pointerEvents: "none",
              zIndex: 10,
              minWidth: 140,
              maxWidth: 220,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: getPointColor(tooltip.point.type),
                marginBottom: 2,
              }}
            >
              {tooltip.point.name}
            </div>
            <div style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>
              {t(`map.type.${tooltip.point.type}`, tooltip.point.type.replace(/_/g, " "))}
              {tooltip.point.count && ` \u00b7 ${tooltip.point.count} ${t("map.members", "members")}`}
            </div>
            {tooltip.point.description && (
              <div style={{ fontSize: 11, color: colors.text }}>
                {tooltip.point.description}
              </div>
            )}
            {tooltip.point.zip && (
              <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                ZIP: {tooltip.point.zip}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 12,
          fontSize: 13,
          color: colors.muted,
          justifyContent: "center",
        }}
      >
        <span>
          <strong style={{ color: colors.hortusUser }}>{gardenCount}</strong>{" "}
          {t("map.stats.gardens", "gardens")}
        </span>
        <span style={{ color: colors.border }}>{"\u00b7"}</span>
        <span>
          <strong style={{ color: colors.farmersMarket }}>{marketCount}</strong>{" "}
          {t("map.stats.markets", "markets")}
        </span>
        <span style={{ color: colors.border }}>{"\u00b7"}</span>
        <span>
          <strong style={{ color: colors.seedLibrary }}>{seedLibCount}</strong>{" "}
          {t("map.stats.seedLibraries", "seed libraries")}
        </span>
      </div>
    </div>
  );
}
