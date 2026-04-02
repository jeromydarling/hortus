// @ts-nocheck — Scaffold page. Lovable rewrites from prototype HTML.
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const tokens = {
  primary: "#0d6f74",
  accent: "#5d7d4a",
  warn: "#aa6d22",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  text: "#26231d",
  muted: "#706b63",
};

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface Thread {
  id: string;
  tag: string;
  title: string;
  isDM: boolean;
  messages: Message[];
}

const demoThreads: Thread[] = [
  {
    id: "t-1",
    tag: "workday",
    title: "Spring bed prep coordination",
    isDM: false,
    messages: [
      { id: "m1", sender: "Maya R.", text: "I can bring the wheelbarrow on Saturday. Who has the rakes?", timestamp: "10:34 AM" },
      { id: "m2", sender: "Li W.", text: "I have two rakes and a hoe. I'll load them up Friday night.", timestamp: "11:02 AM" },
      { id: "m3", sender: "Priya S.", text: "I'll bring coffee and muffins for the crew.", timestamp: "12:15 PM" },
    ],
  },
  {
    id: "t-2",
    tag: "sharing",
    title: "Kale starts available",
    isDM: false,
    messages: [
      { id: "m4", sender: "Maya R.", text: "I have 6 kale starts that need homes. First come, first served at the shed.", timestamp: "Yesterday" },
      { id: "m5", sender: "Marcus T.", text: "I'll take two! Can I pick up Thursday?", timestamp: "Yesterday" },
    ],
  },
  {
    id: "t-3",
    tag: "DM",
    title: "Li W.",
    isDM: true,
    messages: [
      { id: "m6", sender: "Li W.", text: "Hey, have you thought about trying garlic this fall? I have some seed stock.", timestamp: "2 days ago" },
      { id: "m7", sender: "You", text: "That sounds great! I've never grown garlic before.", timestamp: "2 days ago" },
      { id: "m8", sender: "Li W.", text: "It's one of the easiest things. Plant in October, harvest in July. I'll set some aside.", timestamp: "Yesterday" },
    ],
  },
];

export default function Messages() {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState(demoThreads[0].id);
  const [input, setInput] = useState("");
  const selected = demoThreads.find((th) => th.id === selectedId) ?? demoThreads[0];

  const tagColor = (tag: string) => {
    if (tag === "DM") return tokens.primary;
    if (tag === "workday") return tokens.accent;
    return tokens.warn;
  };

  return (
    <div style={{ backgroundColor: tokens.bg, minHeight: "100vh", padding: 24 }}>
      <h1 style={{ fontFamily: "Instrument Serif, serif", color: tokens.text, fontSize: 28, margin: 0 }}>
        {t("community.messages_title")}
      </h1>

      <div style={{ display: "flex", gap: 16, marginTop: 20, minHeight: 480 }}>
        {/* Thread list */}
        <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {demoThreads.map((th) => {
            const last = th.messages[th.messages.length - 1];
            const isActive = th.id === selectedId;
            return (
              <button
                key={th.id}
                onClick={() => setSelectedId(th.id)}
                style={{
                  textAlign: "left",
                  border: "none",
                  borderRadius: 10,
                  padding: 14,
                  backgroundColor: isActive ? tokens.primary : tokens.surface,
                  color: isActive ? "#fff" : tokens.text,
                  cursor: "pointer",
                  fontFamily: "Work Sans, sans-serif",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 8,
                      backgroundColor: isActive ? "rgba(255,255,255,0.25)" : tagColor(th.tag),
                      color: "#fff",
                      textTransform: "uppercase",
                    }}
                  >
                    {th.tag}
                  </span>
                  {th.isDM && (
                    <span style={{ fontSize: 10, color: isActive ? "rgba(255,255,255,0.7)" : tokens.muted }}>
                      {t("community.direct_message")}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{th.title}</p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 12,
                    color: isActive ? "rgba(255,255,255,0.7)" : tokens.muted,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {last.sender}: {last.text}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: isActive ? "rgba(255,255,255,0.5)" : tokens.muted }}>
                  {last.timestamp}
                </p>
              </button>
            );
          })}
        </div>

        {/* Message area */}
        <div
          style={{
            flex: 1,
            backgroundColor: tokens.surface,
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #e8e6e1" }}>
            <p style={{ margin: 0, fontFamily: "Work Sans, sans-serif", fontWeight: 600, fontSize: 16, color: tokens.text }}>
              {selected.title}
            </p>
          </div>
          <div style={{ flex: 1, padding: 18, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {selected.messages.map((msg) => {
              const isMe = msg.sender === "You";
              return (
                <div key={msg.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: tokens.muted, fontFamily: "Work Sans, sans-serif" }}>
                    {msg.sender}
                  </p>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      backgroundColor: isMe ? tokens.primary : "#eae8e3",
                      color: isMe ? "#fff" : tokens.text,
                      fontFamily: "Work Sans, sans-serif",
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.text}
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: tokens.muted, fontFamily: "Work Sans, sans-serif" }}>
                    {msg.timestamp}
                  </p>
                </div>
              );
            })}
          </div>
          <div style={{ padding: 14, borderTop: "1px solid #e8e6e1", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("community.new_message")}
              style={{
                flex: 1,
                fontFamily: "Work Sans, sans-serif",
                fontSize: 14,
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #ddd",
                outline: "none",
                backgroundColor: "#fff",
              }}
            />
            <button
              style={{
                fontFamily: "Work Sans, sans-serif",
                fontSize: 14,
                fontWeight: 600,
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                backgroundColor: tokens.primary,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {t("nri.send")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
