import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Demo Gate — Contact form that collects name, email, CLT name, and role
 * before routing to the full working demo. No backend needed —
 * Lovable wires the form submission later.
 */

interface DemoGateProps {
  onSubmit?: (data: DemoFormData) => void;
}

interface DemoFormData {
  name: string;
  email: string;
  cltName: string;
  role: string;
}

const ROLES = [
  { value: "gardener", label: "Home Gardener" },
  { value: "coordinator", label: "Garden Coordinator" },
  { value: "clt_staff", label: "CLT / Land Trust Staff" },
  { value: "extension", label: "Extension Agent" },
  { value: "nonprofit", label: "Nonprofit / Community Org" },
  { value: "government", label: "Local Government" },
  { value: "educator", label: "Educator" },
  { value: "other", label: "Other" },
];

export function DemoGate({ onSubmit }: DemoGateProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<DemoFormData>({
    name: "",
    email: "",
    cltName: "",
    role: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const isValid = form.name.trim() && form.email.trim() && form.role;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    // Store in sessionStorage for demo context
    sessionStorage.setItem("hortus-demo-contact", JSON.stringify(form));
    setSubmitted(true);

    if (onSubmit) {
      onSubmit(form);
    } else {
      // Default: route to demo after brief pause
      setTimeout(() => {
        window.location.hash = "#/app";
      }, 1500);
    }
  };

  const updateField = (field: keyof DemoFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div style={successContainer}>
        <div style={successIcon}>
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C8.5 2 5.5 5 5.5 9C5.5 13.5 9 17 12 22C15 17 18.5 13.5 18.5 9C18.5 5 15.5 2 12 2Z"
              fill="#5d7d4a"
              opacity={0.85}
            />
            <path
              d="M12 5C12 5 10 8 10 11C10 13 11 15 12 17"
              stroke="white"
              strokeWidth={1.2}
              strokeLinecap="round"
              opacity={0.6}
            />
          </svg>
        </div>
        <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, margin: "16px 0 8px", color: "#26231d" }}>
          {t("demo.welcome", "Welcome to Hortus, {{name}}").replace("{{name}}", form.name.split(" ")[0] ?? form.name)}
        </h3>
        <p style={{ fontSize: 14, color: "#706b63", margin: 0 }}>
          {t("demo.loading", "Loading your demo garden...")}
        </p>
      </div>
    );
  }

  return (
    <section style={container} id="try-it">
      <div style={inner}>
        <div style={textSide}>
          <h2 style={heading}>
            {t("demo.gate_title", "Try Hortus")}
          </h2>
          <p style={description}>
            {t("demo.gate_description", "Explore the full app with a pre-loaded demo garden — Sundown Edge, Zone 4b, in First Signs phase. Real NRI responses, real data, nothing saved.")}
          </p>
          <div style={featureList}>
            {[
              "Full app experience — every screen works",
              "Live NRI responses (5 messages in demo)",
              "Pre-loaded garden: 2 beds, 3 observations, active plan",
              "Community view with 6 members and NRI signals",
              "Seeds Now links work with real affiliate tracking",
            ].map((feature) => (
              <div key={feature} style={featureItem}>
                <span style={{ color: "#5d7d4a", fontSize: 14, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: "#706b63" }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={formSide}>
          <div style={formGroup}>
            <label style={label} htmlFor="demo-name">
              {t("demo.name_label", "Your name")}
            </label>
            <input
              id="demo-name"
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Jeromy Darling"
              style={input}
              required
            />
          </div>

          <div style={formGroup}>
            <label style={label} htmlFor="demo-email">
              {t("demo.email_label", "Email")}
            </label>
            <input
              id="demo-email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
              style={input}
              required
            />
          </div>

          <div style={formGroup}>
            <label style={label} htmlFor="demo-clt">
              {t("demo.clt_label", "Organization / CLT name")}
              <span style={{ color: "#706b63", fontWeight: 400 }}> (optional)</span>
            </label>
            <input
              id="demo-clt"
              type="text"
              value={form.cltName}
              onChange={(e) => updateField("cltName", e.target.value)}
              placeholder="e.g. Rondo CLT, Champlain Housing Trust"
              style={input}
            />
          </div>

          <div style={formGroup}>
            <label style={label} htmlFor="demo-role">
              {t("demo.role_label", "Your role")}
            </label>
            <select
              id="demo-role"
              value={form.role}
              onChange={(e) => updateField("role", e.target.value)}
              style={{ ...input, cursor: "pointer" }}
              required
            >
              <option value="">Select your role...</option>
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            style={{
              ...submitButton,
              opacity: isValid ? 1 : 0.5,
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            {t("demo.submit", "Open Demo Garden →")}
          </button>

          <p style={disclaimer}>
            {t("demo.disclaimer", "No account created. Nothing is saved. Your info helps us understand who's interested in Hortus.")}
          </p>
        </form>
      </div>
    </section>
  );
}

// Styles
const container: React.CSSProperties = {
  background: "linear-gradient(180deg, #f7f6f2 0%, #eae7df 100%)",
  padding: "64px 24px",
  borderTop: "1px solid #e8e5de",
};

const inner: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
  display: "flex",
  gap: 48,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const textSide: React.CSSProperties = {
  flex: 1,
  minWidth: 280,
};

const heading: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: 36,
  fontWeight: 400,
  margin: 0,
  color: "#26231d",
};

const description: React.CSSProperties = {
  fontSize: 15,
  color: "#706b63",
  margin: "12px 0 24px",
  lineHeight: 1.6,
};

const featureList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const featureItem: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
};

const formSide: React.CSSProperties = {
  flex: 1,
  minWidth: 300,
  maxWidth: 400,
  background: "white",
  borderRadius: 12,
  border: "1px solid #e8e5de",
  padding: "28px 24px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
};

const formGroup: React.CSSProperties = {
  marginBottom: 18,
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#26231d",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.3px",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #e8e5de",
  borderRadius: 8,
  fontSize: 14,
  color: "#26231d",
  background: "#fbfaf7",
  outline: "none",
  boxSizing: "border-box",
};

const submitButton: React.CSSProperties = {
  width: "100%",
  padding: "14px 20px",
  background: "#0d6f74",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontSize: 16,
  fontWeight: 600,
  marginTop: 4,
};

const disclaimer: React.CSSProperties = {
  fontSize: 11,
  color: "#706b63",
  margin: "12px 0 0",
  textAlign: "center",
  lineHeight: 1.4,
};

const successContainer: React.CSSProperties = {
  textAlign: "center",
  padding: "64px 24px",
};

const successIcon: React.CSSProperties = {
  display: "inline-block",
};
