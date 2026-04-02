/**
 * AppShell — Main app layout wrapper.
 *
 * Mobile: content + bottom nav.
 * Desktop (>=768px): sidebar + content area.
 */

import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  return (
    <div style={shell}>
      {/* Desktop sidebar */}
      <div style={sidebarWrap}>
        <Sidebar />
      </div>

      {/* Main content */}
      <main style={content}>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <div style={bottomNavWrap}>
        <BottomNav />
      </div>
    </div>
  );
}

const shell: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f7f6f2",
  fontFamily: "'Work Sans', system-ui, sans-serif",
  color: "#26231d",
};

const sidebarWrap: React.CSSProperties = {
  display: "none", // Show via CSS media query in production
};

const content: React.CSSProperties = {
  padding: "16px 16px 80px", // 80px bottom padding for bottom nav
  maxWidth: 960,
  margin: "0 auto",
};

const bottomNavWrap: React.CSSProperties = {
  // Hide on desktop via CSS media query in production
};
