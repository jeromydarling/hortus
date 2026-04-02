import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

const tokens = {
  primary: "#0d6f74",
  bg: "#f7f6f2",
  text: "#26231d",
  muted: "#706b63",
};

export default function Callback() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;

        // Small delay so the user sees the verification screen
        setTimeout(() => {
          window.location.href = "/app/home";
        }, 1200);
      } catch {
        setStatus("error");
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2500);
      }
    };

    handleCallback();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: tokens.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Seed icon */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          backgroundColor: tokens.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          marginBottom: 24,
          animation: status === "loading" ? "pulse 1.5s infinite" : "none",
        }}
      >
        <span role="img" aria-label="seed">
          &#x1F331;
        </span>
      </div>

      <h1
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 24,
          color: tokens.text,
          fontWeight: 400,
          marginBottom: 8,
        }}
      >
        {status === "loading"
          ? "Verifying your sign-in..."
          : t("common.error_generic")}
      </h1>

      {status === "error" && (
        <p
          style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 14,
            color: tokens.muted,
          }}
        >
          Redirecting to sign in...
        </p>
      )}

      {/* Inline keyframe for pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
