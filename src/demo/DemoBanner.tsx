import { useState } from "react";
import { useTranslation } from "react-i18next";

export function DemoBanner() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("demo-banner-dismissed") === "true",
  );

  if (dismissed) return null;

  return (
    <div
      data-demo-banner
      role="banner"
      style={{
        background:
          "color-mix(in srgb, var(--color-accent-soft, #e8f0e0) 80%, transparent)",
        borderBottom: "1px solid var(--color-accent, #5d7d4a)",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "12px",
        color: "var(--color-accent, #5d7d4a)",
        fontWeight: 600,
        flexShrink: 0,
        zIndex: 200,
      }}
    >
      <span>{t("common.demo_banner_text")}</span>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <a
          href="/auth/signup"
          style={{
            color: "var(--color-primary, #0d6f74)",
            textDecoration: "underline",
          }}
        >
          {t("common.demo_start_real")}
        </a>
        <button
          onClick={() => {
            sessionStorage.setItem("demo-banner-dismissed", "true");
            setDismissed(true);
          }}
          aria-label={t("common.dismiss")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted, #706b63)",
            fontSize: "16px",
            lineHeight: 1,
          }}
        >
          {"\u00D7"}
        </button>
      </div>
    </div>
  );
}
