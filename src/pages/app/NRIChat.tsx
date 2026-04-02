import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNRIPosture } from "@/hooks/useNRIPosture";

/* ── Design tokens ── */
const T = {
  primary: "#0d6f74",
  primarySoft: "#d7e7e6",
  accent: "#5d7d4a",
  accentSoft: "#dee7d8",
  warn: "#aa6d22",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  surface2: "#f5f1ea",
  border: "#d7d2c8",
  divider: "#e5e0d8",
  text: "#26231d",
  muted: "#706b63",
  faint: "#a9a39b",
  radiusSm: "0.375rem",
  radiusLg: "1rem",
  radiusXl: "1.35rem",
  radiusFull: "9999px",
  serif: "'Instrument Serif', serif",
  sans: "'Work Sans', sans-serif",
};

interface Message {
  id: string;
  role: "nri" | "user";
  text: string;
}

export default function NRIChat() {
  const { t } = useTranslation();
  const { label: postureLabel } = useNRIPosture("/app/home");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "nri-opening",
      role: "nri",
      text: t("nri.demo_opening"),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    const nriReply: Message = {
      id: `nri-${Date.now()}`,
      role: "nri",
      text: "I hear you. Let me think about that in the context of your ground and what this season asks of you. Could you tell me a bit more about what you're seeing out there today?",
    };

    setMessages((prev) => [...prev, userMsg, nriReply]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        fontFamily: T.sans,
        color: T.text,
        background: T.bg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem",
          borderBottom: `1px solid ${T.divider}`,
          flexShrink: 0,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: T.serif,
              fontStyle: "italic",
              fontSize: "1.4rem",
              color: T.primary,
              marginBottom: 2,
            }}
          >
            {t("nri.chat_title")} &middot; {t("nri.chat_subtitle")}
          </h1>
          {/* Posture indicator */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: T.faint,
              letterSpacing: "0.05em",
            }}
          >
            {postureLabel}
          </span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "1.25rem",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              maxWidth: "85%",
              alignSelf: msg.role === "nri" ? "flex-start" : "flex-end",
            }}
          >
            {msg.role === "nri" && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.faint,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase" as const,
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                NRI
              </span>
            )}
            <div
              style={{
                padding: "1rem 1.25rem",
                borderRadius: T.radiusXl,
                fontSize: "0.875rem",
                lineHeight: 1.65,
                ...(msg.role === "nri"
                  ? {
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      borderBottomLeftRadius: T.radiusSm,
                      color: T.text,
                    }
                  : {
                      background: T.primary,
                      color: "#fff",
                      borderBottomRightRadius: T.radiusSm,
                    }),
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ── */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderTop: `1px solid ${T.divider}`,
          flexShrink: 0,
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-end",
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("nri.placeholder")}
          rows={1}
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            border: `1.5px solid ${T.border}`,
            borderRadius: T.radiusXl,
            background: T.surface,
            color: T.text,
            fontFamily: T.sans,
            fontSize: "0.875rem",
            outline: "none",
            resize: "none",
            maxHeight: 100,
          }}
        />
        <button
          onClick={handleSend}
          style={{
            width: 42,
            height: 42,
            borderRadius: T.radiusFull,
            background: T.primary,
            border: "none",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "1.1rem",
          }}
          aria-label={t("nri.send")}
        >
          {"\u2191"}
        </button>
      </div>
    </div>
  );
}
