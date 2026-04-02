import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import YieldDashboard from "../../components/YieldDashboard";

const tokens = {
  primary: "#0d6f74",
  accent: "#5d7d4a",
  warn: "#aa6d22",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  text: "#26231d",
  muted: "#706b63",
};

interface HarvestEntry {
  id: string;
  crop: string;
  variety: string;
  weight: number;
  destination: string;
  quality: string;
  date: string;
}

const destinations = ["destination_household", "destination_donated", "destination_shared", "destination_composted", "destination_sold"] as const;
const qualities = ["Excellent", "Good", "Fair", "Poor"];

const demoHarvests: HarvestEntry[] = [
  { id: "hv1", crop: "Lettuce", variety: "Mesclun", weight: 1.2, destination: "destination_household", quality: "Excellent", date: "2026-03-30" },
  { id: "hv2", crop: "Radish", variety: "Cherry Belle", weight: 0.8, destination: "destination_shared", quality: "Good", date: "2026-03-28" },
  { id: "hv3", crop: "Kale", variety: "Lacinato", weight: 2.1, destination: "destination_donated", quality: "Excellent", date: "2026-03-25" },
  { id: "hv4", crop: "Spinach", variety: "Bloomsdale", weight: 1.5, destination: "destination_household", quality: "Good", date: "2026-03-22" },
];

const destColors: Record<string, string> = {
  destination_household: tokens.primary,
  destination_donated: tokens.accent,
  destination_shared: tokens.warn,
  destination_composted: tokens.muted,
  destination_sold: "#7b6ea6",
};

export default function Harvest() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<HarvestEntry[]>(demoHarvests);
  const [crop, setCrop] = useState("");
  const [variety, setVariety] = useState("");
  const [weight, setWeight] = useState("");
  const [destination, setDestination] = useState(destinations[0] as string);
  const [quality, setQuality] = useState(qualities[0]);

  const totalLbs = entries.reduce((s, e) => s + e.weight, 0);

  const handleAdd = () => {
    if (!crop || !weight) return;
    const entry: HarvestEntry = {
      id: `hv-${Date.now()}`,
      crop,
      variety,
      weight: parseFloat(weight),
      destination,
      quality,
      date: new Date().toISOString().split("T")[0],
    };
    setEntries([entry, ...entries]);
    setCrop("");
    setVariety("");
    setWeight("");
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "Work Sans, sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: tokens.muted,
    marginBottom: 4,
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "Work Sans, sans-serif",
    fontSize: 14,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: "100vh", padding: 24 }}>
      <h1 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 28, margin: 0 }}>
        {t("harvest.title")}
      </h1>
      <p style={{ fontFamily: "Work Sans, sans-serif", color: tokens.muted, fontSize: 14, marginTop: 4 }}>
        {t("harvest.subtitle")}
      </p>

      {/* Season summary */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 16,
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: tokens.primary,
            color: "#fff",
            borderRadius: 12,
            padding: 18,
            textAlign: "center",
            fontFamily: "Work Sans, sans-serif",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>{t("harvest.total_harvested")}</p>
          <p style={{ margin: "4px 0 0", fontSize: 30, fontWeight: 700, fontFamily: "Instrument Serif, serif" }}>
            {totalLbs.toFixed(1)} lbs
          </p>
        </div>
        <div
          style={{
            flex: 1,
            backgroundColor: tokens.accent,
            color: "#fff",
            borderRadius: 12,
            padding: 18,
            textAlign: "center",
            fontFamily: "Work Sans, sans-serif",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>{t("harvest.this_season")}</p>
          <p style={{ margin: "4px 0 0", fontSize: 30, fontWeight: 700, fontFamily: "Instrument Serif, serif" }}>
            {entries.length} items
          </p>
        </div>
      </div>

      {/* Add harvest form */}
      <div style={{ marginTop: 24, backgroundColor: tokens.surface, borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 20, margin: "0 0 14px" }}>
          {t("harvest.add_entry")}
        </h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 140px" }}>
            <label style={labelStyle}>{t("harvest.crop")}</label>
            <input value={crop} onChange={(e) => setCrop(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <label style={labelStyle}>{t("harvest.variety")}</label>
            <input value={variety} onChange={(e) => setVariety(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: "0 0 100px" }}>
            <label style={labelStyle}>{t("harvest.weight")}</label>
            <input type="number" step="0.1" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <label style={labelStyle}>{t("harvest.destination")}</label>
            <select value={destination} onChange={(e) => setDestination(e.target.value)} style={inputStyle}>
              {destinations.map((d) => (
                <option key={d} value={d}>{t(`harvest.${d}`)}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: "0 0 120px" }}>
            <label style={labelStyle}>{t("harvest.quality")}</label>
            <select value={quality} onChange={(e) => setQuality(e.target.value)} style={inputStyle}>
              {qualities.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleAdd}
          style={{
            marginTop: 14,
            fontFamily: "Work Sans, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            padding: "9px 22px",
            borderRadius: 8,
            border: "none",
            backgroundColor: tokens.primary,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {t("harvest.add_entry")}
        </button>
      </div>

      {/* Recent entries */}
      <h2 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 20, marginTop: 28, marginBottom: 12 }}>
        Recent Harvests
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map((e) => (
          <div
            key={e.id}
            style={{
              backgroundColor: tokens.surface,
              borderRadius: 10,
              padding: 14,
              fontFamily: "Work Sans, sans-serif",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: tokens.text }}>
                {e.crop} — {e.variety}
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 10,
                    backgroundColor: destColors[e.destination] ?? tokens.muted,
                    color: "#fff",
                  }}
                >
                  {t(`harvest.${e.destination}`)}
                </span>
                <span style={{ fontSize: 12, color: tokens.muted }}>{e.quality}</span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: tokens.primary }}>{e.weight} lbs</p>
              <p style={{ margin: 0, fontSize: 12, color: tokens.muted }}>{e.date}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Yield Dashboard */}
      <div style={{ marginTop: 32 }}>
        <YieldDashboard />
      </div>
    </div>
  );
}
