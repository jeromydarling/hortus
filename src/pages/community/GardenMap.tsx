import React from "react";
import { useTranslation } from "react-i18next";
import { DEMO_COMMUNITY, DEMO_FIXTURE } from "../../demo/fixture";

const tokens = {
  primary: "#0d6f74",
  accent: "#5d7d4a",
  warn: "#aa6d22",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  text: "#26231d",
  muted: "#706b63",
};

const bedColors = ["#0d6f74", "#5d7d4a", "#aa6d22", "#7b6ea6", "#c0785c", "#4a7d7d"];

const beds = [
  { id: "bed-a", name: "Bed A", stewardId: "dm-1", row: 0, col: 0 },
  { id: "bed-b", name: "Bed B", stewardId: "dm-2", row: 0, col: 1 },
  { id: "bed-c", name: "Bed C", stewardId: "dm-3", row: 0, col: 2 },
  { id: "bed-d", name: "Bed D", stewardId: "dm-4", row: 1, col: 0 },
  { id: "bed-e", name: "Bed E", stewardId: "dm-6", row: 1, col: 1 },
  { id: "bed-f", name: "Bed F", stewardId: null, row: 1, col: 2 },
];

export default function GardenMap() {
  const { t } = useTranslation();
  const members = DEMO_COMMUNITY.members;

  const stewardIndex: Record<string, number> = {};
  let colorIdx = 0;
  beds.forEach((b) => {
    if (b.stewardId && !(b.stewardId in stewardIndex)) {
      stewardIndex[b.stewardId] = colorIdx++;
    }
  });

  const getColor = (stewId: string | null) =>
    stewId && stewId in stewardIndex ? bedColors[stewardIndex[stewId] % bedColors.length] : "#ccc";

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: "100vh", padding: 24 }}>
      <h1 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 28, margin: 0 }}>
        {t("community.garden_map_title")}
      </h1>
      <p style={{ fontFamily: "Work Sans, sans-serif", color: tokens.muted, fontSize: 14, marginTop: 4 }}>
        {DEMO_FIXTURE.land.displayName}
      </p>

      {/* Placeholder grid map */}
      <div
        style={{
          marginTop: 20,
          backgroundColor: tokens.surface,
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          {beds.map((bed) => {
            const steward = bed.stewardId ? members.find((m) => m.id === bed.stewardId) : null;
            return (
              <div
                key={bed.id}
                style={{
                  backgroundColor: getColor(bed.stewardId),
                  borderRadius: 10,
                  padding: 20,
                  textAlign: "center",
                  color: "#fff",
                  fontFamily: "Work Sans, sans-serif",
                  minHeight: 80,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{bed.name}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.85 }}>
                  {steward ? steward.displayName : "Unassigned"}
                </p>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: "center", fontFamily: "Work Sans, sans-serif", fontSize: 12, color: tokens.muted, marginTop: 16 }}>
          Placeholder grid — interactive SVG map coming soon
        </p>
      </div>

      {/* Legend */}
      <h2 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 20, marginTop: 28, marginBottom: 12 }}>
        {t("community.bed_ownership")}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontFamily: "Work Sans, sans-serif" }}>
        {Object.entries(stewardIndex).map(([stewId, idx]) => {
          const m = members.find((mem) => mem.id === stewId);
          return (
            <div key={stewId} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  backgroundColor: bedColors[idx % bedColors.length],
                }}
              />
              <span style={{ fontSize: 13, color: tokens.text }}>{m?.displayName ?? stewId}</span>
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 4, backgroundColor: "#ccc" }} />
          <span style={{ fontSize: 13, color: tokens.muted }}>Unassigned</span>
        </div>
      </div>

      {/* Bed cards */}
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {beds.map((bed) => {
          const steward = bed.stewardId ? members.find((m) => m.id === bed.stewardId) : null;
          return (
            <div
              key={bed.id}
              style={{
                backgroundColor: tokens.surface,
                borderRadius: 10,
                padding: 14,
                fontFamily: "Work Sans, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: getColor(bed.stewardId),
                  flexShrink: 0,
                }}
              />
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: tokens.text }}>{bed.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: tokens.muted }}>
                  {steward ? `${t("community.role_steward")}: ${steward.displayName}` : "Unassigned"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
