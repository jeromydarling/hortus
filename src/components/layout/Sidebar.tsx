/**
 * Sidebar — Desktop navigation (>=768px).
 *
 * Sections: Place, Growing, Rhythm, Community (if community mode).
 * Hides on mobile — BottomNav + hamburger drawer used instead.
 */

import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGardenMode } from "@/hooks/useGardenMode";

interface NavItem {
  label: string;
  route: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const { t } = useTranslation();
  const { isCommunity } = useGardenMode();
  const location = useLocation();
  const navigate = useNavigate();

  const sections: NavSection[] = [
    {
      title: t("nav.place"),
      items: [
        { label: t("nav.home"), route: "/app/home" },
        { label: t("nav.land"), route: "/app/land" },
        { label: t("nav.weather"), route: "/app/weather" },
      ],
    },
    {
      title: t("nav.growing"),
      items: [
        { label: t("nav.planner"), route: "/app/planner" },
        { label: t("nav.succession"), route: "/app/succession" },
        { label: t("nav.harvest"), route: "/app/harvest" },
        { label: t("nav.source"), route: "/app/source" },
        { label: t("nav.phenology"), route: "/app/phenology" },
      ],
    },
    {
      title: t("nav.rhythm"),
      items: [
        { label: t("nav.common_year"), route: "/app/commonyear" },
        { label: t("nav.memory"), route: "/app/logs" },
        { label: t("nav.nri"), route: "/app/nri" },
        { label: t("nav.philosophy"), route: "/app/philosophy" },
      ],
    },
  ];

  if (isCommunity) {
    sections.push({
      title: t("nav.community"),
      items: [
        { label: t("nav.people"), route: "/app/community/people" },
        { label: t("nav.workdays"), route: "/app/community/workdays" },
        { label: t("nav.garden_map"), route: "/app/community/map" },
        { label: t("nav.sharing"), route: "/app/community/sharing" },
        { label: t("nav.messages"), route: "/app/community/messages" },
        { label: t("nav.hours"), route: "/app/community/hours" },
      ],
    });
  }

  // Stewardship section (new resilience features)
  sections.push({
    title: "Stewardship",
    items: [
      { label: "Food Map", route: "/app/food-map" },
      { label: "Resilience", route: "/app/resilience" },
      { label: "Yield", route: "/app/yield" },
      { label: "Seed Exchange", route: "/app/seed-exchange" },
      { label: "Impact", route: "/app/impact" },
      { label: "Compost", route: "/app/compost" },
      { label: "Garden-Ready", route: "/app/garden-ready" },
    ],
  });

  return (
    <aside style={sidebar}>
      {/* Logo */}
      <div style={logo}>
        <span style={logoText}>Hortus</span>
        <span style={logoSub}>Land {"\u00b7"} Season {"\u00b7"} Memory</span>
      </div>

      {/* Nav sections */}
      <nav style={navContainer}>
        {sections.map((section) => (
          <div key={section.title} style={sectionBlock}>
            <div style={sectionTitle}>{section.title}</div>
            {section.items.map((item) => {
              const isActive = location.pathname === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  style={{
                    ...navButton,
                    color: isActive ? "#0d6f74" : "#706b63",
                    background: isActive ? "rgba(13,111,116,0.08)" : "transparent",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Settings link at bottom */}
      <button
        onClick={() => navigate("/app/settings")}
        style={{
          ...navButton,
          marginTop: "auto",
          color: location.pathname === "/app/settings" ? "#0d6f74" : "#706b63",
        }}
      >
        {t("nav.settings")}
      </button>
    </aside>
  );
}

const sidebar: React.CSSProperties = {
  width: 220,
  height: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  background: "#fbfaf7",
  borderRight: "1px solid #e8e5de",
  display: "flex",
  flexDirection: "column",
  padding: "20px 12px",
  overflowY: "auto",
  zIndex: 40,
};

const logo: React.CSSProperties = {
  padding: "0 8px 16px",
  borderBottom: "1px solid #e8e5de",
  marginBottom: 12,
};

const logoText: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: 22,
  color: "#0d6f74",
  display: "block",
};

const logoSub: React.CSSProperties = {
  fontSize: 9,
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  color: "#706b63",
  fontWeight: 500,
};

const navContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  flex: 1,
};

const sectionBlock: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "#a9a39b",
  padding: "4px 8px",
};

const navButton: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "7px 8px",
  border: "none",
  borderRadius: 6,
  fontSize: 13,
  cursor: "pointer",
  fontFamily: "'Work Sans', sans-serif",
  transition: "all 150ms ease",
};
