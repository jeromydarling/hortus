import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DEMO_FIXTURE } from "../../demo/fixture";

const tokens = {
  primary: "#0d6f74",
  accent: "#5d7d4a",
  warn: "#aa6d22",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  text: "#26231d",
  muted: "#706b63",
};

const statusColors: Record<string, { bg: string; text: string }> = {
  planned: { bg: "#e0eee0", text: tokens.accent },
  planted: { bg: "#d4eeef", text: tokens.primary },
  growing: { bg: "#d4eeef", text: tokens.primary },
  harvesting: { bg: "#fdf5e6", text: tokens.warn },
  done: { bg: "#e8e6e1", text: tokens.muted },
};

const tabs = ["layout", "crops", "materials"] as const;
type Tab = (typeof tabs)[number];

export default function Planner() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("layout");
  const { plots, activePlan } = DEMO_FIXTURE;

  const bedTypeLabel = (type: string) => {
    const key = `planner.bed_type_${type}` as const;
    return t(key as string) || type;
  };

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: "100vh", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 28, margin: 0 }}>
            {t("planner.title")}
          </h1>
          <p style={{ fontFamily: "Work Sans, sans-serif", color: tokens.muted, fontSize: 14, marginTop: 4 }}>
            {t("planner.active_plan")}: {activePlan.name}
          </p>
        </div>
        <button
          style={{
            fontFamily: "Work Sans, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            padding: "8px 18px",
            borderRadius: 8,
            border: "none",
            backgroundColor: tokens.primary,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {t("planner.add_bed")}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginTop: 18 }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: "Work Sans, sans-serif",
              fontSize: 13,
              fontWeight: activeTab === tab ? 700 : 500,
              padding: "7px 16px",
              borderRadius: 20,
              border: "none",
              backgroundColor: activeTab === tab ? tokens.primary : "#e8e6e1",
              color: activeTab === tab ? "#fff" : tokens.text,
              cursor: "pointer",
            }}
          >
            {t(`planner.tab_${tab}`)}
          </button>
        ))}
      </div>

      {/* Layout tab */}
      {activeTab === "layout" && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {plots.map((plot) => (
            <div
              key={plot.id}
              style={{
                backgroundColor: tokens.surface,
                borderRadius: 10,
                padding: 16,
                fontFamily: "Work Sans, sans-serif",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: tokens.text }}>{plot.name}</p>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 12,
                    backgroundColor: "#e0eee0",
                    color: tokens.accent,
                    textTransform: "capitalize",
                  }}
                >
                  {bedTypeLabel(plot.type)}
                </span>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 13, color: tokens.muted }}>
                <span>
                  {t("planner.dimensions")}: {plot.dimensions.length}' x {plot.dimensions.width}'
                </span>
                <span>
                  {t("planner.sun_hours")}: {plot.sunHours}h
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crops tab */}
      {activeTab === "crops" && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {plots.map((plot) => (
            <div
              key={plot.id}
              style={{
                backgroundColor: tokens.surface,
                borderRadius: 10,
                padding: 16,
                fontFamily: "Work Sans, sans-serif",
              }}
            >
              <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 600, color: tokens.text }}>{plot.name}</p>
              {plot.crops.map((crop, i) => {
                const sc = statusColors[crop.status] ?? statusColors.planned;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderTop: i > 0 ? "1px solid #eee" : "none",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 14, color: tokens.text }}>{crop.cropName}</span>
                      {crop.notes && (
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: tokens.muted }}>{crop.notes}</p>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 12,
                        backgroundColor: sc.bg,
                        color: sc.text,
                        textTransform: "capitalize",
                      }}
                    >
                      {t(`planner.status_${crop.status}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Materials tab */}
      {activeTab === "materials" && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activePlan.seedList.map((seed, i) => (
              <div
                key={i}
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
                    {seed.cropName} — {seed.variety}
                  </p>
                  <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 12, color: tokens.muted }}>
                    <span>{seed.quantity}</span>
                    <span>${seed.estimatedCost.toFixed(2)}</span>
                    <span>
                      {t("planner.plant_by")}: {seed.plantBy}
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 10px",
                    borderRadius: 12,
                    backgroundColor: seed.ordered ? "#d4eeef" : "#fdf5e6",
                    color: seed.ordered ? tokens.primary : tokens.warn,
                  }}
                >
                  {seed.ordered ? t("planner.ordered") : t("planner.not_ordered")}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: "Work Sans, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: tokens.text,
              textAlign: "right",
            }}
          >
            {t("planner.total_cost")}: ${activePlan.seedList.reduce((s, seed) => s + seed.estimatedCost, 0).toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
