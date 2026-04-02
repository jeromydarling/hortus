import { useTranslation } from "react-i18next";
import { FeaturesSlider } from "./components/FeaturesSlider";
import { DemoGate } from "./components/DemoGate";

const BASE = import.meta.env.BASE_URL;

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "Try It", href: "#try-it" },
  { label: "Prototypes", href: "#prototypes" },
  { label: "Resilience", href: "#resilience" },
  { label: "Phases", href: "#phases" },
  { label: "Routes", href: "#routes" },
  { label: "Status", href: "#status" },
];

const phases = [
  { id: "rest", name: "Rest", icon: "\ud83c\udf19", months: "Dec \u2013 Feb" },
  { id: "preparation", name: "Preparation", icon: "\ud83d\udd27", months: "Feb \u2013 Mar" },
  { id: "firstSigns", name: "First Signs", icon: "\ud83c\udf31", months: "Mar \u2013 Apr" },
  { id: "planting", name: "Planting", icon: "\u2600\ufe0f", months: "May" },
  { id: "establishment", name: "Establishment", icon: "\u26a1", months: "May \u2013 Jun" },
  { id: "abundance", name: "Abundance", icon: "\ud83c\udf1e", months: "Jul \u2013 Aug" },
  { id: "preservation", name: "Preservation", icon: "\ud83c\udf42", months: "Aug \u2013 Oct" },
  { id: "return", name: "Return", icon: "\ud83c\udf19", months: "Oct \u2013 Nov" },
];

const routeSections = [
  { title: "Public", items: [
    { route: "/", desc: "Marketing home" }, { route: "/pricing", desc: "Pricing page" },
    { route: "/demo", desc: "Public demo \u2014 no account" }, { route: "/auth/login", desc: "Email + magic link" },
  ]},
  { title: "Onboarding", items: [
    { route: "/onboarding", desc: "7-step: address \u2192 type \u2192 goal \u2192 parcel \u2192 budget \u2192 philosophy \u2192 crops" },
  ]},
  { title: "Place", items: [
    { route: "/app/home", desc: "Home \u2014 phase, weather, rule of life" },
    { route: "/app/land", desc: "Loam Map \u2014 trilingual soil" },
    { route: "/app/weather", desc: "Weather + hazard state" },
  ]},
  { title: "Growing", items: [
    { route: "/app/planner", desc: "Garden Planner" }, { route: "/app/succession", desc: "Succession timeline" },
    { route: "/app/harvest", desc: "Harvest log" }, { route: "/app/source", desc: "Source Materials + Seeds Now" },
  ]},
  { title: "Resilience", items: [
    { route: "/app/food-map", desc: "Local Food System Map" }, { route: "/app/resilience", desc: "Food Resilience Score" },
    { route: "/app/yield", desc: "Yield Dashboard" }, { route: "/app/seed-exchange", desc: "Seed Exchange" },
    { route: "/app/impact", desc: "Economic Impact" }, { route: "/app/compost", desc: "Compost Tracker" },
    { route: "/app/garden-ready", desc: "Garden-Ready Lot Finder" },
  ]},
  { title: "Community", items: [
    { route: "/app/community/people", desc: "People + NRI signals" },
    { route: "/app/community/workdays", desc: "Workdays" },
    { route: "/app/community/sharing", desc: "Sharing Board" },
    { route: "/app/community/messages", desc: "Messages" },
    { route: "/app/community/hours", desc: "Volunteer Hours" },
  ]},
  { title: "Rhythm", items: [
    { route: "/app/commonyear", desc: "Common Year \u2014 8 phases" }, { route: "/app/logs", desc: "Memory log" },
    { route: "/app/nri", desc: "NRI chat" }, { route: "/app/philosophy", desc: "Philosophy" },
    { route: "/app/settings", desc: "Settings" },
  ]},
];

export function App() {
  const { t } = useTranslation();

  return (
    <div style={{ fontFamily: "'Work Sans', system-ui, sans-serif", background: "#f7f6f2", minHeight: "100vh", color: "#26231d" }}>

      {/* Sticky Nav */}
      <nav style={stickyNav}>
        <div style={navInner}>
          <a href="#top" style={navBrand}>Hortus</a>
          <div style={navLinks}>
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} style={navLink}>{item.label}</a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header id="top" style={hero}>
        <div style={heroInner}>
          <h1 style={heroTitle}>Hortus</h1>
          <p style={heroSubtitle}>{t("common.tagline")}</p>
          <p style={heroDesc}>
            A lifelong gardening companion that reads your actual land — soil, terrain, hardiness zone, weather — and guides you through seasonal planting with NRI, a place-aware intelligence layer.
          </p>
          <div style={heroCtas}>
            <a href="#try-it" style={ctaPrimary}>Try the Demo</a>
            <a href="#features" style={ctaSecondary}>See Features</a>
            <a href={`${BASE}prototype.html`} style={ctaSecondary}>Open Prototype</a>
          </div>
          <div style={heroStats}>
            <span>27 tables with RLS</span>
            <span style={statDot}>{"\u00b7"}</span>
            <span>14 services</span>
            <span style={statDot}>{"\u00b7"}</span>
            <span>8 new resilience components</span>
            <span style={statDot}>{"\u00b7"}</span>
            <span>16 i18n namespaces</span>
          </div>
        </div>
      </header>

      {/* Features Slider */}
      <div id="features">
        <FeaturesSlider />
      </div>

      {/* Try It — Demo Gate */}
      <DemoGate />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px" }}>

        {/* Prototypes */}
        <section id="prototypes" style={section}>
          <h2 style={sectionHeading}>Interactive Prototypes</h2>
          <p style={sectionDesc}>Open these to see every screen. This is the visual source of truth.</p>
          <div style={gridTwo}>
            <a href={`${BASE}prototype.html`} style={cardLink}>
              <div style={card}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{"\ud83d\udcf1"}</div>
                <strong>App Prototype</strong>
                <p style={cardDesc}>All screens: app shell, onboarding, admin. Use the dev bar to switch views.</p>
              </div>
            </a>
            <a href={`${BASE}marketing.html`} style={cardLink}>
              <div style={card}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{"\ud83c\udf10"}</div>
                <strong>Marketing Site</strong>
                <p style={cardDesc}>The landing page at /. Complete design with pricing.</p>
              </div>
            </a>
          </div>
        </section>

        {/* New Features */}
        <section id="resilience" style={section}>
          <h2 style={sectionHeading}>Community Resilience Layer</h2>
          <p style={sectionDesc}>
            Inspired by Strong Towns and Local Futures. Food resilience, local economy, seed sovereignty, land stewardship.
          </p>
          <div style={gridTwo}>
            {[
              { icon: "\ud83d\uddfa\ufe0f", name: "Local Food System Map", desc: "US map with Hortus garden markers + farmers markets, CSAs, seed libraries. Auto-updates with every member." },
              { icon: "\ud83c\udf31", name: "Food Resilience Score", desc: "0-100 score: pounds produced, varieties grown, days of food, seeds saved. Strong Towns Strength Test #8." },
              { icon: "\ud83d\udcca", name: "Yield Dashboard", desc: "Production per square foot. Most/least productive beds. Value-per-acre for gardens." },
              { icon: "\ud83c\udf3e", name: "Seed Exchange", desc: "Offers, requests, swaps. Heirloom tracking. 90% of crop diversity is gone; every seed shared fights that." },
              { icon: "\ud83d\udcb0", name: "Economic Impact", desc: "Grocery value saved, local multiplier, donated food value, compost value." },
              { icon: "\u267b\ufe0f", name: "Compost Tracker", desc: "Green/brown ratio, temperature, moisture. Closes the nutrient loop." },
              { icon: "\ud83c\udfde\ufe0f", name: "Garden-Ready Finder", desc: "Vacant lots scored for sun, soil, water, zoning. NRI assessment." },
              { icon: "\u23f1\ufe0f", name: "Screen-to-Soil", desc: "Nudges after 10min. Quick-log one-tap. Tech as bridge to soil, not replacement." },
            ].map((f) => (
              <div key={f.name} style={{ ...card, borderLeft: "3px solid #5d7d4a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <strong style={{ fontSize: 14 }}>{f.name}</strong>
                </div>
                <p style={{ ...cardDesc, marginTop: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Common Year */}
        <section id="phases" style={section}>
          <h2 style={sectionHeading}>The Common Year — 8 Phases</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {phases.map((p) => (
              <div key={p.id} style={{ ...card, padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <strong style={{ fontSize: 14 }}>{p.name}</strong>
                </div>
                <p style={{ ...cardDesc, marginTop: 4 }}>{p.months}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Route Map */}
        <section id="routes" style={section}>
          <h2 style={sectionHeading}>Route Map — 40+ Screens</h2>
          {routeSections.map((s) => (
            <div key={s.title} style={{ marginBottom: 20 }}>
              <h3 style={routeGroupTitle}>{s.title}</h3>
              <div style={routeTable}>
                {s.items.map((item, i) => (
                  <div key={item.route} style={{ ...routeRow, borderTop: i > 0 ? "1px solid #f0ede6" : "none" }}>
                    <code style={routeCode}>{item.route}</code>
                    <span style={routeDesc}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Scaffold Status */}
        <section id="status" style={section}>
          <h2 style={sectionHeading}>Scaffold Status</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { label: "Supabase Migration", done: true, detail: "27 tables, 90+ RLS policies" },
              { label: "i18n (en + es)", done: true, detail: "24 namespaces, parity passing" },
              { label: "Demo Fixture + Data", done: true, detail: "DEMO_FIXTURE + /data/ JSON" },
              { label: "Service Layer", done: true, detail: "14 typed service modules" },
              { label: "Hooks", done: true, detail: "useAuth, useGardenMode, useEntitlement" },
              { label: "Features Slider", done: true, detail: "7 live mini-previews" },
              { label: "Demo Gate", done: true, detail: "Contact form \u2192 demo routing" },
              { label: "Food System Map", done: true, detail: "US SVG + seed markers" },
              { label: "Resilience Score", done: true, detail: "0-100, 9 weighted dimensions" },
              { label: "Yield Dashboard", done: true, detail: "lbs/sqft per bed" },
              { label: "Seed Exchange", done: true, detail: "Offers, requests, swaps" },
              { label: "Economic Impact", done: true, detail: "Grocery value, multiplier" },
              { label: "Compost Tracker", done: true, detail: "Piles, temp, ratio" },
              { label: "Garden-Ready Finder", done: true, detail: "Vacant lot scoring" },
              { label: "Screen-to-Soil", done: true, detail: "Nudges, quick-log" },
              { label: "Auth Screens", done: false, detail: "Step 3 \u2014 Lovable" },
              { label: "Stripe", done: false, detail: "Step 4 \u2014 Lovable" },
              { label: "Onboarding", done: false, detail: "Step 5 \u2014 Lovable" },
              { label: "Core Screens", done: false, detail: "Steps 6-11 \u2014 Lovable" },
              { label: "NRI Edge Functions", done: false, detail: "Step 7 \u2014 Lovable" },
            ].map((item) => (
              <div key={item.label} style={{ ...card, padding: "12px 16px", borderLeft: `3px solid ${item.done ? "#5d7d4a" : "#e8e5de"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.5px", padding: "2px 6px", borderRadius: 4, background: item.done ? "#e8f0e0" : "#f5f0e8", color: item.done ? "#3d5a2e" : "#aa6d22" }}>
                    {item.done ? "Done" : "Lovable"}
                  </span>
                </div>
                <p style={{ ...cardDesc, marginTop: 4 }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Build Order */}
        <section style={section}>
          <h2 style={sectionHeading}>14-Step Build Order</h2>
          <div style={routeTable}>
            {[
              { step: 1, label: "Project scaffold", done: true },
              { step: 2, label: "Supabase schema", done: true },
              { step: 3, label: "Auth \u2014 login, signup, magic link" },
              { step: 4, label: "Stripe \u2014 Edge Functions, pricing" },
              { step: 5, label: "Onboarding \u2014 7 steps" },
              { step: 6, label: "Core screens \u2014 Home, Loam, Plots, Common Year" },
              { step: 7, label: "NRI \u2014 5 Edge Functions, chat" },
              { step: 8, label: "API connectors \u2014 NWS, SSURGO, AirNow" },
              { step: 9, label: "Push notifications" },
              { step: 10, label: "Community screens" },
              { step: 11, label: "Harvest, Succession, Phenology, Field Mode" },
              { step: 12, label: "PWA \u2014 offline, installable" },
              { step: 13, label: "Admin \u2014 Master Gardener" },
              { step: 14, label: "Tests \u2014 service, page, integration" },
            ].map((item, i) => (
              <div key={item.step} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderTop: i > 0 ? "1px solid #f0ede6" : "none", opacity: item.done ? 0.6 : 1 }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, background: item.done ? "#5d7d4a" : "#e8e5de", color: item.done ? "white" : "#706b63" }}>
                  {item.done ? "\u2713" : item.step}
                </span>
                <span style={{ fontSize: 14, textDecoration: item.done ? "line-through" : "none" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid #e8e5de", padding: "24px", textAlign: "center" as const, color: "#706b63", fontSize: 12 }}>
        Hortus Scaffold \u00b7 See <code>LOVABLE_HANDOFF.md</code> for implementation details
      </footer>
    </div>
  );
}

// ---- Styles ----

const stickyNav: React.CSSProperties = {
  position: "sticky", top: 0, zIndex: 100,
  background: "rgba(247, 246, 242, 0.95)", backdropFilter: "blur(8px)",
  borderBottom: "1px solid #e8e5de", padding: "0 24px",
};
const navInner: React.CSSProperties = {
  maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 48,
};
const navBrand: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: "#0d6f74", textDecoration: "none",
};
const navLinks: React.CSSProperties = {
  display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none" as const,
};
const navLink: React.CSSProperties = {
  padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#706b63", textDecoration: "none", borderRadius: 6, whiteSpace: "nowrap" as const,
};

const hero: React.CSSProperties = {
  background: "linear-gradient(135deg, #0d6f74 0%, #0a5558 100%)", color: "white", padding: "64px 24px 56px", textAlign: "center" as const,
};
const heroInner: React.CSSProperties = { maxWidth: 700, margin: "0 auto" };
const heroTitle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 56, margin: 0, fontWeight: 400,
};
const heroSubtitle: React.CSSProperties = { fontSize: 18, opacity: 0.9, margin: "8px 0 0" };
const heroDesc: React.CSSProperties = { fontSize: 15, opacity: 0.8, margin: "16px 0 28px", lineHeight: 1.6 };
const heroCtas: React.CSSProperties = { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const };
const ctaPrimary: React.CSSProperties = {
  background: "white", color: "#0d6f74", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: "none",
};
const ctaSecondary: React.CSSProperties = {
  background: "rgba(255,255,255,0.15)", color: "white", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.3)",
};
const heroStats: React.CSSProperties = {
  marginTop: 28, fontSize: 12, opacity: 0.65, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" as const,
};
const statDot: React.CSSProperties = { opacity: 0.4 };

const section: React.CSSProperties = { marginBottom: 48, scrollMarginTop: 60 };
const sectionHeading: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, margin: "0 0 12px", color: "#26231d",
};
const sectionDesc: React.CSSProperties = { color: "#706b63", fontSize: 14, margin: "0 0 16px" };

const gridTwo: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16,
};
const card: React.CSSProperties = {
  background: "white", borderRadius: 8, border: "1px solid #e8e5de", padding: "16px 20px",
};
const cardLink: React.CSSProperties = { textDecoration: "none", color: "inherit" };
const cardDesc: React.CSSProperties = { fontSize: 13, color: "#706b63", margin: "6px 0 0", lineHeight: 1.4 };

const routeGroupTitle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: "#0d6f74", textTransform: "uppercase" as const, letterSpacing: "0.5px", margin: "0 0 6px",
};
const routeTable: React.CSSProperties = {
  background: "white", borderRadius: 8, border: "1px solid #e8e5de", overflow: "hidden",
};
const routeRow: React.CSSProperties = {
  display: "flex", alignItems: "baseline", gap: 16, padding: "8px 16px",
};
const routeCode: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#0d6f74", minWidth: 200, flexShrink: 0,
};
const routeDesc: React.CSSProperties = { fontSize: 12, color: "#706b63" };
