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

export default function Signup() {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const allowed = await checkAuthRateLimit(email, "signup");
    if (!allowed) {
      setError("Too many attempts. Please wait a few minutes and try again.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
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
          Create your {t("common.app_name")} account
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

        {success ? (
          <div
            style={{
              textAlign: "center",
              fontFamily: "'Work Sans', sans-serif",
              color: tokens.accent,
              fontSize: 15,
              padding: "24px 0",
            }}
          >
            Check your email to confirm your account, then sign in.
          </div>
        ) : (
          <form onSubmit={handleSignup}>
            {/* Display name */}
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
              {t("settings.display_name")}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #d4d0c8",
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 15,
                color: tokens.text,
                backgroundColor: tokens.bg,
                marginBottom: 16,
                outline: "none",
                boxSizing: "border-box",
              }}
            />

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
                border: "1px solid #d4d0c8",
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
              minLength={8}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #d4d0c8",
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 15,
                color: tokens.text,
                backgroundColor: tokens.bg,
                marginBottom: 4,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <p
              style={{
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 12,
                color: tokens.muted,
                marginBottom: 24,
                marginTop: 4,
              }}
            >
              Minimum 8 characters
            </p>

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

            {/* Submit */}
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
              }}
            >
              {loading ? t("common.loading") : "Create account"}
            </button>
          </form>
        )}

        {/* Sign in link */}
        <p
          style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 14,
            color: tokens.muted,
            textAlign: "center",
            marginTop: 28,
          }}
        >
          Already have an account?{" "}
          <a
            href="/auth/login"
            style={{
              color: tokens.primary,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {t("common.sign_in")}
          </a>
        </p>
      </div>
    </div>
  );
}
