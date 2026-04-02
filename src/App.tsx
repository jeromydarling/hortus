import { useTranslation } from "react-i18next";

const BASE = import.meta.env.BASE_URL;

interface NavSection {
  title: string;
  items: { label: string; route: string; description: string }[];
}

const sections: NavSection[] = [
  {
    title: "Prototypes",
    items: [
      { label: "App Prototype", route: `${BASE}prototype.html`, description: "Complete app — all screens, onboarding, admin" },
      { label: "Marketing Site", route: `${BASE}marketing.html`, description: "Landing page at /" },
    ],
  },
  {
    title: "Public Routes",
    items: [
      { label: "/", route: "/", description: "Marketing home" },
      { label: "/pricing", route: "/pricing", description: "Pricing page" },
      { label: "/demo", route: "/demo", description: "Public demo — no account required" },
      { label: "/auth/login", route: "/auth/login", description: "Email + password + magic link" },
      { label: "/auth/signup", route: "/auth/signup", description: "Signup + tier selection" },
    ],
  },
  {
    title: "Onboarding",
    items: [
      { label: "/onboarding", route: "/onboarding", description: "7-step flow: address → garden type → goal → parcel → budget → philosophy → crops" },
    ],
  },
  {
    title: "App — Place",
    items: [
      { label: "/app/home", route: "/app/home", description: "Home screen — phase, weather, rule of life" },
      { label: "/app/land", route: "/app/land", description: "Loam Map — trilingual soil profile" },
      { label: "/app/weather", route: "/app/weather", description: "Weather + hazard state" },
    ],
  },
  {
    title: "App — Growing",
    items: [
      { label: "/app/planner", route: "/app/planner", description: "Garden Planner — Layout / Crops / Materials" },
      { label: "/app/planner/aerial", route: "/app/planner/aerial", description: "Aerial view + bed placement" },
      { label: "/app/planner/photos", route: "/app/planner/photos", description: "Yard photo upload + NRI interpretation" },
      { label: "/app/planner/ar", route: "/app/planner/ar", description: "AR bed placement" },
      { label: "/app/succession", route: "/app/succession", description: "Crop succession timeline" },
      { label: "/app/harvest", route: "/app/harvest", description: "Harvest log + seed saving" },
      { label: "/app/phenology", route: "/app/phenology", description: "Observation streak + phenology log" },
      { label: "/app/source", route: "/app/source", description: "Source Materials + Seeds Now" },
    ],
  },
  {
    title: "App — Rhythm",
    items: [
      { label: "/app/commonyear", route: "/app/commonyear", description: "Common Year — 8 phases" },
      { label: "/app/logs", route: "/app/logs", description: "Memory / observation log" },
      { label: "/app/offline", route: "/app/offline", description: "Field Mode — offline-capable" },
      { label: "/app/philosophy", route: "/app/philosophy", description: "Philosophy lenses" },
      { label: "/app/nri", route: "/app/nri", description: "NRI chat — compass button" },
    ],
  },
  {
    title: "App — Community",
    items: [
      { label: "/app/community/people", route: "/app/community/people", description: "People + NRI signals" },
      { label: "/app/community/workdays", route: "/app/community/workdays", description: "Workday scheduler" },
      { label: "/app/community/map", route: "/app/community/map", description: "Garden map + bed ownership" },
      { label: "/app/community/sharing", route: "/app/community/sharing", description: "Sharing board" },
      { label: "/app/community/messages", route: "/app/community/messages", description: "Internal messaging" },
      { label: "/app/community/hours", route: "/app/community/hours", description: "Volunteer hour tracking" },
    ],
  },
  {
    title: "App — Settings & Admin",
    items: [
      { label: "/app/settings", route: "/app/settings", description: "Settings" },
      { label: "/app/notifications", route: "/app/notifications", description: "Notification preferences" },
      { label: "/app/admin/growth", route: "/app/admin/growth", description: "Master Gardener — admin console" },
    ],
  },
];

const phases = [
  { id: "rest", name: "Rest", icon: "🌙", months: "Dec – Feb" },
  { id: "preparation", name: "Preparation", icon: "🔧", months: "Feb – Mar" },
  { id: "firstSigns", name: "First Signs", icon: "🌱", months: "Mar – Apr" },
  { id: "planting", name: "Planting", icon: "☀️", months: "May" },
  { id: "establishment", name: "Establishment", icon: "⚡", months: "May – Jun" },
  { id: "abundance", name: "Abundance", icon: "🌞", months: "Jul – Aug" },
  { id: "preservation", name: "Preservation", icon: "🍂", months: "Aug – Oct" },
  { id: "return", name: "Return", icon: "🌙", months: "Oct – Nov" },
];

const specs = [
  { file: "hortus-lovable-prompt.md", title: "Master Build Prompt" },
  { file: "hortus-garden-mode-addendum.md", title: "Garden Mode Addendum" },
  { file: "hortus-demo-mode-addendum.md", title: "Demo Mode Addendum" },
  { file: "hortus-seed-pack-v2.json", title: "Seed Pack v2 (data backbone)" },
  { file: "nri-system-prompt.md", title: "NRI System Prompt" },
  { file: "hortus-api-connector-map.md", title: "API Connector Map (11 connectors)" },
  { file: "hortus-push-notifications.md", title: "Push Notifications (26 events)" },
];

export function App() {
  const { t } = useTranslation();

  return (
    <div style={{ fontFamily: "'Work Sans', system-ui, sans-serif", background: "#f7f6f2", minHeight: "100vh", color: "#26231d" }}>
      {/* Header */}
      <header style={{ background: "#0d6f74", color: "white", padding: "32px 24px", borderBottom: "4px solid #5d7d4a" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 42, margin: 0, fontWeight: 400 }}>
            Hortus
          </h1>
          <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: 15 }}>
            {t("common.tagline")} — Lovable Scaffold Navigator
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px" }}>
        {/* Prototype Links */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionHeading}>Interactive Prototypes</h2>
          <p style={{ color: "#706b63", fontSize: 14, margin: "0 0 16px" }}>
            Open these to see every screen, layout, and interaction. This is the visual source of truth.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <a href={`${BASE}prototype.html`} style={cardLink}>
              <div style={card}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📱</div>
                <strong>App Prototype</strong>
                <p style={cardDesc}>All screens: app shell, onboarding, admin. Use the dev bar to switch views.</p>
              </div>
            </a>
            <a href={`${BASE}marketing.html`} style={cardLink}>
              <div style={card}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🌐</div>
                <strong>Marketing Site</strong>
                <p style={cardDesc}>The landing page rendered at /. Complete design with pricing.</p>
              </div>
            </a>
          </div>
        </section>

        {/* Common Year Phases */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionHeading}>The Common Year — 8 Phases</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {phases.map((phase) => (
              <div key={phase.id} style={{ ...card, padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{phase.icon}</span>
                  <strong style={{ fontSize: 14 }}>{phase.name}</strong>
                </div>
                <p style={{ ...cardDesc, marginTop: 4 }}>{phase.months}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Route Map */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionHeading}>Route Map</h2>
          <p style={{ color: "#706b63", fontSize: 14, margin: "0 0 16px" }}>
            Every route Lovable needs to implement. Routes are not live yet — see the prototype for the screen designs.
          </p>
          {sections.filter(s => s.title !== "Prototypes").map((section) => (
            <div key={section.title} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0d6f74", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>
                {section.title}
              </h3>
              <div style={{ background: "white", borderRadius: 8, border: "1px solid #e8e5de", overflow: "hidden" }}>
                {section.items.map((item, i) => (
                  <div key={item.route} style={{
                    display: "flex", alignItems: "baseline", gap: 16, padding: "10px 16px",
                    borderTop: i > 0 ? "1px solid #f0ede6" : "none",
                  }}>
                    <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#0d6f74", minWidth: 220, flexShrink: 0 }}>
                      {item.route}
                    </code>
                    <span style={{ fontSize: 13, color: "#706b63" }}>{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Scaffold Status */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionHeading}>Scaffold Status</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { label: "Supabase Migration", status: "done", detail: "21 tables, 78 RLS policies" },
              { label: "i18n (en + es)", status: "done", detail: "16 namespaces, parity test passing" },
              { label: "Demo Fixture", status: "done", detail: "DEMO_FIXTURE + DEMO_COMMUNITY" },
              { label: "Service Layer", status: "done", detail: "10 typed service modules" },
              { label: "Auth Hook", status: "done", detail: "useAuth, useGardenMode, useEntitlement" },
              { label: "Test Setup", status: "done", detail: "Vitest + jsdom + browser mocks" },
              { label: "Seeds Now Utility", status: "done", detail: "seedsNowUrl() with affiliate tag" },
              { label: "Auth Screens", status: "lovable", detail: "Step 3 of build order" },
              { label: "Stripe Integration", status: "lovable", detail: "Step 4 of build order" },
              { label: "Onboarding Flow", status: "lovable", detail: "Step 5 of build order" },
              { label: "Core Screens", status: "lovable", detail: "Steps 6-11 of build order" },
              { label: "NRI Edge Functions", status: "lovable", detail: "Step 7 of build order" },
            ].map((item) => (
              <div key={item.label} style={{ ...card, padding: "12px 16px", borderLeft: `3px solid ${item.status === "done" ? "#5d7d4a" : "#e8e5de"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                    padding: "2px 6px", borderRadius: 4,
                    background: item.status === "done" ? "#e8f0e0" : "#f5f0e8",
                    color: item.status === "done" ? "#3d5a2e" : "#aa6d22",
                  }}>
                    {item.status === "done" ? "Done" : "Lovable"}
                  </span>
                </div>
                <p style={{ ...cardDesc, marginTop: 4 }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Spec Files */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionHeading}>Specification Files</h2>
          <div style={{ background: "white", borderRadius: 8, border: "1px solid #e8e5de", overflow: "hidden" }}>
            {specs.map((spec, i) => (
              <div key={spec.file} style={{
                display: "flex", alignItems: "baseline", gap: 16, padding: "10px 16px",
                borderTop: i > 0 ? "1px solid #f0ede6" : "none",
              }}>
                <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#5d7d4a", minWidth: 300, flexShrink: 0 }}>
                  specs/{spec.file}
                </code>
                <span style={{ fontSize: 13, color: "#706b63" }}>{spec.title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Build Order */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionHeading}>14-Step Build Order</h2>
          <div style={{ background: "white", borderRadius: 8, border: "1px solid #e8e5de", overflow: "hidden" }}>
            {[
              { step: 1, label: "Project scaffold", done: true },
              { step: 2, label: "Supabase schema — migrations, RLS, functions", done: true },
              { step: 3, label: "Auth — login, signup, magic link, useAuth" },
              { step: 4, label: "Stripe — Edge Functions, useEntitlement, pricing" },
              { step: 5, label: "Onboarding — 7 steps, address → NRI welcome" },
              { step: 6, label: "Core solo screens — Home, Loam Map, Plots, Common Year, Source, Memory" },
              { step: 7, label: "NRI — 5 Edge Functions, chat screen, context builder" },
              { step: 8, label: "External API connectors — NWS, SSURGO, AirNow, USA-NPN" },
              { step: 9, label: "Push notifications — Edge Function cron jobs" },
              { step: 10, label: "Community screens — People, Workdays, Map, Sharing, Messages, Hours" },
              { step: 11, label: "New solo screens — Harvest, Succession, Phenology, Field Mode" },
              { step: 12, label: "PWA — service worker, offline, installability" },
              { step: 13, label: "Admin — Master Gardener view (is_admin gating)" },
              { step: 14, label: "Tests — service layer, page render, integration" },
            ].map((item, i) => (
              <div key={item.step} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
                borderTop: i > 0 ? "1px solid #f0ede6" : "none",
                opacity: item.done ? 0.6 : 1,
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  background: item.done ? "#5d7d4a" : "#e8e5de",
                  color: item.done ? "white" : "#706b63",
                }}>
                  {item.done ? "✓" : item.step}
                </span>
                <span style={{ fontSize: 14, textDecoration: item.done ? "line-through" : "none" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e8e5de", padding: "16px 24px", textAlign: "center", color: "#706b63", fontSize: 12 }}>
        Hortus Scaffold · See <code>LOVABLE_HANDOFF.md</code> for implementation details
      </footer>
    </div>
  );
}

// Shared styles
const sectionHeading: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: 24,
  fontWeight: 400,
  margin: "0 0 12px",
  color: "#26231d",
};

const card: React.CSSProperties = {
  background: "white",
  borderRadius: 8,
  border: "1px solid #e8e5de",
  padding: "16px 20px",
};

const cardLink: React.CSSProperties = {
  textDecoration: "none",
  color: "inherit",
};

const cardDesc: React.CSSProperties = {
  fontSize: 13,
  color: "#706b63",
  margin: "6px 0 0",
  lineHeight: 1.4,
};
