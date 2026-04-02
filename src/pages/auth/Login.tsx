import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { checkAuthRateLimit } from "@/lib/authRateLimit";

const tokens = {
  primary: "#0d6f74",
  accent: "#5d7d4a",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  text: "#26231d",
  muted: "#706b63",
};

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const allowed = await checkAuthRateLimit(email, "login");
    if (!allowed) {
      setError("Too many attempts. Please wait a minute and try again.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } else {
      window.location.href = "/app/home";
    }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    setError(null);
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);

    const allowed = await checkAuthRateLimit(email, "login");
    if (!allowed) {
      setError("Too many attempts. Please wait a minute and try again.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: tokens.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          backgroundColor: tokens.surface,
          borderRadius: 16,
          padding: 40,
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: tokens.primary,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            <span role="img" aria-label="seedling">
              &#x1F331;
            </span>
          </div>
        </div>

        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 28,
            color: tokens.text,
            textAlign: "center",
            marginBottom: 4,
            fontWeight: 400,
          }}
        >
          {t("common.sign_in")} to {t("common.app_name")}
        </h1>
        <p
          style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 14,
            color: tokens.muted,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          {t("common.tagline")}
        </p>

        {magicLinkSent ? (
          <div
            style={{
              textAlign: "center",
              fontFamily: "'Work Sans', sans-serif",
              color: tokens.accent,
              fontSize: 15,
              padding: "24px 0",
            }}
          >
            Check your email for a sign-in link.
          </div>
        ) : (
          <form onSubmit={handleSignIn}>
            {/* Email */}
            <label
              style={{
                display: "block",
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: tokens.text,
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid #d4d0c8`,
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 15,
                color: tokens.text,
                backgroundColor: tokens.bg,
                marginBottom: 16,
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {/* Password */}
            <label
              style={{
                display: "block",
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: tokens.text,
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid #d4d0c8`,
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 15,
                color: tokens.text,
                backgroundColor: tokens.bg,
                marginBottom: 8,
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {/* Forgot password */}
            <div style={{ textAlign: "right", marginBottom: 24 }}>
              <a
                href="/auth/reset"
                style={{
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: 13,
                  color: tokens.primary,
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: 13,
                  color: "#c0392b",
                  backgroundColor: "#fdf0ef",
                  padding: "10px 14px",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 10,
                border: "none",
                backgroundColor: tokens.primary,
                color: "#fff",
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginBottom: 12,
              }}
            >
              {loading ? t("common.loading") : t("common.sign_in")}
            </button>

            {/* Magic link button */}
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 10,
                border: `1px solid ${tokens.primary}`,
                backgroundColor: "transparent",
                color: tokens.primary,
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 15,
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              Send magic link
            </button>
          </form>
        )}

        {/* Sign up link */}
        <p
          style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 14,
            color: tokens.muted,
            textAlign: "center",
            marginTop: 28,
          }}
        >
          Don't have an account?{" "}
          <a
            href="/auth/signup"
            style={{
              color: tokens.primary,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {t("common.sign_up")}
          </a>
        </p>
      </div>
    </div>
  );
}
