// @ts-nocheck — Scaffold page. Lovable rewrites from prototype HTML.
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DEMO_COMMUNITY } from "../../demo/fixture";

const tokens = {
  primary: "#0d6f74",
  accent: "#5d7d4a",
  warn: "#aa6d22",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  text: "#26231d",
  muted: "#706b63",
};

const demoPosts = [
  ...DEMO_COMMUNITY.sharingPosts,
  {
    id: "sp-3",
    authorId: "dm-4",
    type: "request" as const,
    item: "Looking for extra tomato cages — need 4",
    status: "available" as const,
  },
  {
    id: "sp-4",
    authorId: "dm-2",
    type: "surplus" as const,
    item: "Bag of composted woodchips — free to a good bed",
    status: "claimed" as const,
  },
];

const typeBadge: Record<string, { bg: string; label: string }> = {
  surplus: { bg: tokens.accent, label: "community.post_surplus" },
  request: { bg: tokens.warn, label: "community.post_request" },
  announcement: { bg: tokens.primary, label: "community.post_announcement" },
};

const tabs = ["all", "surplus", "request", "announcement"] as const;

export default function Sharing() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("all");
  const members = DEMO_COMMUNITY.members;

  const filtered = activeTab === "all" ? demoPosts : demoPosts.filter((p) => p.type === activeTab);

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: "100vh", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 28, margin: 0 }}>
          {t("community.sharing_title")}
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{
              fontFamily: "Work Sans, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              padding: "7px 14px",
              borderRadius: 8,
              border: "none",
              backgroundColor: tokens.accent,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {t("community.post_surplus")}
          </button>
          <button
            style={{
              fontFamily: "Work Sans, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              padding: "7px 14px",
              borderRadius: 8,
              border: "none",
              backgroundColor: tokens.warn,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {t("community.post_request")}
          </button>
        </div>
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
              padding: "6px 14px",
              borderRadius: 20,
              border: "none",
              backgroundColor: activeTab === tab ? tokens.primary : "#e8e6e1",
              color: activeTab === tab ? "#fff" : tokens.text,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {tab === "all" ? t("logs.filter_all") : tab === "request" ? "Requests" : tab === "announcement" ? "Announcements" : "Surplus"}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((post) => {
          const author = members.find((m) => m.id === post.authorId);
          const badge = typeBadge[post.type] ?? typeBadge.announcement;
          const isClaimed = post.status === "claimed";
          return (
            <div
              key={post.id}
              style={{
                backgroundColor: tokens.surface,
                borderRadius: 10,
                padding: 16,
                fontFamily: "Work Sans, sans-serif",
                opacity: isClaimed ? 0.65 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: tokens.text }}>{author?.displayName ?? "Unknown"}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 12,
                    backgroundColor: badge.bg,
                    color: "#fff",
                  }}
                >
                  {t(badge.label)}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 12,
                    backgroundColor: isClaimed ? "#e8e6e1" : "#d9f0d1",
                    color: isClaimed ? tokens.muted : tokens.accent,
                  }}
                >
                  {isClaimed ? t("community.status_claimed") : t("community.status_available")}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 15, color: tokens.text }}>{post.item}</p>
              {!isClaimed && post.type !== "announcement" && (
                <button
                  style={{
                    marginTop: 10,
                    fontFamily: "Work Sans, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "6px 16px",
                    borderRadius: 8,
                    border: `1.5px solid ${tokens.primary}`,
                    backgroundColor: "transparent",
                    color: tokens.primary,
                    cursor: "pointer",
                  }}
                >
                  {t("seedExchange.claim")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
