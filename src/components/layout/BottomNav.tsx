/**
 * BottomNav — Mobile bottom navigation bar.
 *
 * 5 items: Home, Plots, NRI (compass), Seasons, Memory
 * The compass button is 52px, raised 10px, teal background, double-ring halo.
 */

import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNRIGlow } from "@/hooks/useNRIGlow";
import type { NRINudge } from "@/hooks/useNRINudgeEngine";

interface BottomNavProps {
  nudges?: NRINudge[];
  nriDrawerOpen?: boolean;
  onNRIPress?: () => void;
}

export function BottomNav({
  nudges = [],
  nriDrawerOpen = false,
  onNRIPress,
}: BottomNavProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const glowing = useNRIGlow(nudges, nriDrawerOpen);

  const items = [
    { key: "home", label: t("nav.home"), route: "/app/home", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
    { key: "plots", label: t("nav.plots"), route: "/app/planner", icon: "M4 4h16v16H4zM4 10h16M10 4v16" },
    { key: "nri", label: t("nav.nri"), route: "/app/nri", icon: "compass" },
    { key: "seasons", label: t("nav.seasons"), route: "/app/commonyear", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" },
    { key: "memory", label: t("nav.memory"), route: "/app/logs", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  ];

  return (
    <nav style={navBar}>
      {items.map((item) => {
        const isActive = location.pathname.startsWith(item.route);

        if (item.key === "nri") {
          return (
            <button
              key="nri"
              onClick={onNRIPress ?? (() => navigate("/app/nri"))}
              style={compassButton}
              aria-label={t("nav.nri")}
              data-screen="nri"
            >
              <div
                style={{
                  ...compassInner,
                  boxShadow: glowing
                    ? "0 0 16px rgba(13,111,116,0.6), 0 0 0 2px #fbfaf7, 0 0 0 3px #e8e5de"
                    : "0 2px 10px rgba(13,111,116,0.3), 0 0 0 2px #fbfaf7, 0 0 0 3px #e8e5de",
                }}
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx={12} cy={12} r={10} />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="white" opacity={0.3} />
                </svg>
              </div>
              <span style={{ fontSize: 9, color: "#0d6f74", fontWeight: 600, marginTop: 2 }}>
                {t("nav.nri")}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.key}
            onClick={() => navigate(item.route)}
            style={{ ...navItem, color: isActive ? "#0d6f74" : "#a9a39b" }}
            aria-label={item.label}
            data-screen={item.key}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const navBar: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-around",
  background: "#fbfaf7",
  borderTop: "1px solid #e8e5de",
  padding: "6px 4px 8px",
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 50,
};

const navItem: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  background: "none",
  border: "none",
  cursor: "pointer",
  flex: 1,
  padding: 0,
  fontFamily: "'Work Sans', sans-serif",
};

const compassButton: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  flex: 1,
  padding: 0,
  fontFamily: "'Work Sans', sans-serif",
  position: "relative",
  bottom: 10,
};

const compassInner: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: "50%",
  background: "#0d6f74",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "box-shadow 300ms ease",
};
