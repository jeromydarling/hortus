import { useState } from "react";
import { useTranslation } from "react-i18next";

interface SeedExchangeProps {
  exchanges: Array<{
    id: string;
    type: "offer" | "request" | "swap";
    cropName: string;
    variety: string;
    seedType: "heirloom" | "open_pollinated" | "hybrid" | "unknown";
    yearHarvested?: number;
    quantity: string;
    description: string;
    userName: string;
    zip: string;
    status: "available" | "claimed" | "fulfilled";
    willingToShip: boolean;
  }>;
  onPost?: () => void;
}

const defaultExchanges: SeedExchangeProps["exchanges"] = [
  {
    id: "1",
    type: "offer",
    cropName: "Tomato",
    variety: "Brandywine",
    seedType: "heirloom",
    yearHarvested: 2025,
    quantity: "~50 seeds",
    description: "Saved from my best-producing plant. Pink, large beefsteak type. Great flavor.",
    userName: "Maria G.",
    zip: "43215",
    status: "available",
    willingToShip: true,
  },
  {
    id: "2",
    type: "request",
    cropName: "Pepper",
    variety: "Fish Pepper",
    seedType: "heirloom",
    yearHarvested: undefined,
    quantity: "Any amount",
    description: "Looking for this historic variety. Variegated leaves, great for hot sauce.",
    userName: "James T.",
    zip: "43210",
    status: "available",
    willingToShip: false,
  },
  {
    id: "3",
    type: "swap",
    cropName: "Bean",
    variety: "Cherokee Trail of Tears",
    seedType: "heirloom",
    yearHarvested: 2025,
    quantity: "30 seeds",
    description: "Will trade for any heirloom pole bean or winter squash seeds.",
    userName: "Chen W.",
    zip: "43201",
    status: "available",
    willingToShip: true,
  },
  {
    id: "4",
    type: "offer",
    cropName: "Squash",
    variety: "Waltham Butternut",
    seedType: "open_pollinated",
    yearHarvested: 2024,
    quantity: "~25 seeds",
    description: "Good keeper, stored well through March. Isolated to maintain variety.",
    userName: "Pat L.",
    zip: "43220",
    status: "claimed",
    willingToShip: false,
  },
  {
    id: "5",
    type: "offer",
    cropName: "Lettuce",
    variety: "Parris Island Cos",
    seedType: "open_pollinated",
    yearHarvested: 2025,
    quantity: "200+ seeds",
    description: "Heat-tolerant romaine, bolted last of all my lettuces. Easy to save.",
    userName: "Maria G.",
    zip: "43215",
    status: "available",
    willingToShip: true,
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

type FilterTab = "all" | "offer" | "request" | "swap";

const seedTypeBadgeColors: Record<string, { bg: string; color: string }> = {
  heirloom: { bg: "#e8f0e0", color: "#3d5a2e" },
  open_pollinated: { bg: "#e0eef0", color: "#0d6f74" },
  hybrid: { bg: "#f5f0e8", color: "#aa6d22" },
  unknown: { bg: "#f0ede6", color: "#706b63" },
};

const typeBadgeColors: Record<string, { bg: string; color: string }> = {
  offer: { bg: "#e8f0e0", color: "#3d5a2e" },
  request: { bg: "#f5f0e8", color: "#aa6d22" },
  swap: { bg: "#e0eef0", color: "#0d6f74" },
};

const statusBadgeColors: Record<string, { bg: string; color: string }> = {
  available: { bg: "#e8f0e0", color: "#3d5a2e" },
  claimed: { bg: "#f5f0e8", color: "#aa6d22" },
  fulfilled: { bg: "#f0ede6", color: "#706b63" },
};

export function SeedExchangeBoard(props: Partial<SeedExchangeProps> = {}) {
  const exchanges = props.exchanges ?? defaultExchanges;
  const onPost = props.onPost;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered =
    activeTab === "all" ? exchanges : exchanges.filter((e) => e.type === activeTab);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: t("seedExchange.tab_all", "All") },
    { key: "offer", label: t("seedExchange.tab_offers", "Offers") },
    { key: "request", label: t("seedExchange.tab_requests", "Requests") },
    { key: "swap", label: t("seedExchange.tab_swaps", "Swaps") },
  ];

  return (
    <div style={{ fontFamily: "'Work Sans', system-ui, sans-serif", background: colors.bg, color: colors.text }}>
      {/* Header */}
      <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={headingStyle}>{t("seedExchange.title", "Seed Exchange Board")}</h2>
          <p style={{ fontSize: 13, color: colors.muted, margin: "4px 0 0" }}>
            {t("seedExchange.subtitle", "Share, swap, and request seeds in your community")}
          </p>
        </div>
        {onPost && (
          <button onClick={onPost} style={buttonStyle}>
            {t("seedExchange.post_seeds", "Post Seeds")}
          </button>
        )}
        {!onPost && (
          <button style={buttonStyle} onClick={() => {}}>
            {t("seedExchange.post_seeds", "Post Seeds")}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 12 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: `1px solid ${activeTab === tab.key ? colors.primary : colors.border}`,
              background: activeTab === tab.key ? colors.primary : "white",
              color: activeTab === tab.key ? "white" : colors.text,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Exchange cards */}
      {filtered.length === 0 && (
        <div style={{ ...cardStyle, textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{"\ud83c\udf31"}</div>
          <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px" }}>
            {t("seedExchange.empty_title", "No seeds here yet")}
          </p>
          <p style={{ fontSize: 13, color: colors.muted, margin: 0, maxWidth: 400, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
            {t(
              "seedExchange.empty_message",
              "Seed sovereignty starts with sharing. When gardeners save and exchange seeds, varieties adapt to local conditions and communities become more resilient. Be the first to post."
            )}
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((exchange) => {
          const seedBadge = (seedTypeBadgeColors[exchange.seedType as keyof typeof seedTypeBadgeColors] ?? seedTypeBadgeColors.unknown) as { bg: string; color: string };
          const typeBadge = typeBadgeColors[exchange.type as keyof typeof typeBadgeColors] as { bg: string; color: string };
          const statusBadge = statusBadgeColors[exchange.status as keyof typeof statusBadgeColors] as { bg: string; color: string };

          return (
            <div key={exchange.id} style={{ ...cardStyle, opacity: exchange.status === "fulfilled" ? 0.6 : 1 }}>
              {/* Top row: crop + badges */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>
                      {exchange.cropName}
                    </span>
                    <span style={{ fontSize: 13, color: colors.muted }}>
                      &lsquo;{exchange.variety}&rsquo;
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    <Badge bg={typeBadge.bg} color={typeBadge.color}>
                      {t(`seedExchange.type_${exchange.type}`, exchange.type)}
                    </Badge>
                    <Badge bg={seedBadge.bg} color={seedBadge.color}>
                      {t(`seedExchange.seed_type_${exchange.seedType}`, exchange.seedType.replace("_", " "))}
                    </Badge>
                    {exchange.yearHarvested && (
                      <Badge bg="#f0ede6" color={colors.muted}>
                        {exchange.yearHarvested}
                      </Badge>
                    )}
                    <Badge bg={statusBadge.bg} color={statusBadge.color}>
                      {t(`seedExchange.status_${exchange.status}`, exchange.status)}
                    </Badge>
                  </div>
                </div>
                {exchange.willingToShip && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "#e0eef0",
                      color: colors.primary,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("seedExchange.will_ship", "Will Ship")}
                  </span>
                )}
              </div>

              {/* Description */}
              <p style={{ fontSize: 13, color: colors.muted, margin: "10px 0 0", lineHeight: 1.5 }}>
                {exchange.description}
              </p>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: `1px solid ${colors.border}`,
                  fontSize: 12,
                  color: colors.muted,
                }}
              >
                <span>
                  {exchange.userName} &middot; {exchange.zip}
                </span>
                <span>
                  {t("seedExchange.qty", "Qty")}: {exchange.quantity}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        padding: "2px 7px",
        borderRadius: 4,
        background: bg,
        color,
      }}
    >
      {children}
    </span>
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

export default SeedExchangeBoard;
