import { useTranslation } from "react-i18next";

const BASE = import.meta.env.BASE_URL;

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
    { route: "/demo", desc: "Public demo" }, { route: "/auth/login", desc: "Email + magic link" },
  ]},
  { title: "Onboarding", items: [
    { route: "/onboarding", desc: "7-step: address \u2192 type \u2192 goal \u2192 parcel \u2192 budget \u2192 philosophy \u2192 crops" },
  ]},
  { title: "Place", items: [
    { route: "/app/home", desc: "Home" }, { route: "/app/land", desc: "Loam Map" }, { route: "/app/weather", desc: "Weather" },
  ]},
  { title: "Growing", items: [
    { route: "/app/planner", desc: "Garden Planner" }, { route: "/app/succession", desc: "Succession" },
    { route: "/app/harvest", desc: "Harvest log" }, { route: "/app/source", desc: "Source Materials" },
  ]},
  { title: "Resilience", items: [
    { route: "/app/food-map", desc: "Local Food System Map" }, { route: "/app/resilience", desc: "Food Resilience Score" },
    { route: "/app/yield", desc: "Yield Dashboard" }, { route: "/app/seed-exchange", desc: "Seed Exchange" },
    { route: "/app/impact", desc: "Economic Impact" }, { route: "/app/compost", desc: "Compost Tracker" },
    { route: "/app/garden-ready", desc: "Garden-Ready Finder" },
  ]},
  { title: "Community", items: [
    { route: "/app/community/people", desc: "People + NRI" }, { route: "/app/community/workdays", desc: "Workdays" },
    { route: "/app/community/sharing", desc: "Sharing Board" }, { route: "/app/community/messages", desc: "Messages" },
    { route: "/app/community/hours", desc: "Volunteer Hours" },
  ]},
  { title: "Rhythm", items: [
    { route: "/app/commonyear", desc: "Common Year" }, { route: "/app/logs", desc: "Memory log" },
    { route: "/app/nri", desc: "NRI chat" }, { route: "/app/philosophy", desc: "Philosophy" },
    { route: "/app/settings", desc: "Settings" },
  ]},
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
            Open these to see every screen. The marketing site includes the features slider, demo gate, and resilience section.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <a href={`${BASE}prototype.html`} style={cardLink}>
              <div style={card}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{"\ud83d\udcf1"}</div>
                <strong>App Prototype</strong>
                <p style={cardDesc}>All screens: app shell, onboarding, admin. Use the dev bar to switch views.</p>
              </div>
            </a>
            <a href={`${BASE}marketing.html`} style={cardLink}>
              <div style={{ ...card, borderLeft: "3px solid #5d7d4a" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{"\ud83c\udf10"}</div>
                <strong>Marketing Site</strong>
                <p style={cardDesc}>Landing page with features slider, demo gate form, resilience section, and pricing.</p>
              </div>
            </a>
          </div>
        </section>

        {/* Common Year */}
        <section style={{ marginBottom: 40 }}>
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
        <section style={{ marginBottom: 40 }}>
          <h2 style={sectionHeading}>Route Map — 40+ Screens</h2>
          {routeSections.map((s) => (
            <div key={s.title} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "#0d6f74", textTransform: "uppercase" as const, letterSpacing: "0.5px", margin: "0 0 6px" }}>{s.title}</h3>
              <div style={{ background: "white", borderRadius: 8, border: "1px solid #e8e5de", overflow: "hidden" }}>
                {s.items.map((item, i) => (
                  <div key={item.route} style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "8px 16px", borderTop: i > 0 ? "1px solid #f0ede6" : "none" }}>
                    <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#0d6f74", minWidth: 200, flexShrink: 0 }}>{item.route}</code>
                    <span style={{ fontSize: 12, color: "#706b63" }}>{item.desc}</span>
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
              { label: "Supabase Migration", done: true, detail: "27 tables, 90+ RLS policies" },
              { label: "i18n (en + es)", done: true, detail: "24 namespaces, parity passing" },
              { label: "Service Layer", done: true, detail: "14 typed service modules" },
              { label: "Demo Data", done: true, detail: "DEMO_FIXTURE + /data/ JSON" },
              { label: "Resilience Components", done: true, detail: "8 new React components" },
              { label: "Marketing Site", done: true, detail: "Slider + demo gate + resilience" },
              { label: "Auth Screens", done: false, detail: "Step 3 — Lovable" },
              { label: "Stripe", done: false, detail: "Step 4 — Lovable" },
              { label: "Onboarding", done: false, detail: "Step 5 — Lovable" },
              { label: "Core Screens", done: false, detail: "Steps 6-11 — Lovable" },
              { label: "NRI Edge Functions", done: false, detail: "Step 7 — Lovable" },
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
      </main>

      <footer style={{ borderTop: "1px solid #e8e5de", padding: "16px 24px", textAlign: "center" as const, color: "#706b63", fontSize: 12 }}>
        Hortus Scaffold {"\u00b7"} See <code>LOVABLE_HANDOFF.md</code> for implementation details
      </footer>
    </div>
  );
}

const sectionHeading: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, margin: "0 0 12px", color: "#26231d",
};
const card: React.CSSProperties = {
  background: "white", borderRadius: 8, border: "1px solid #e8e5de", padding: "16px 20px",
};
const cardLink: React.CSSProperties = { textDecoration: "none", color: "inherit" };
const cardDesc: React.CSSProperties = { fontSize: 13, color: "#706b63", margin: "6px 0 0", lineHeight: 1.4 };
