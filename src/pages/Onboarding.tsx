import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const tokens = {
  primary: "#0d6f74",
  accent: "#5d7d4a",
  bg: "#f7f6f2",
  surface: "#fbfaf7",
  text: "#26231d",
  muted: "#706b63",
};

const TOTAL_STEPS = 7;

const goals = [
  "Feed my family",
  "Learn to garden",
  "Save money",
  "Build community",
  "Teach others",
  "Food independence",
  "Beauty",
  "Wildlife habitat",
];

const budgetOptions = [
  { id: "free", label: "Free", description: "Forage, salvage, community sources" },
  { id: "thrifty", label: "Thrifty", description: "Mostly free, some purchases" },
  { id: "modest", label: "Modest", description: "Willing to spend on quality basics" },
  { id: "comfortable", label: "Comfortable", description: "Invest in the right tools and materials" },
];

const philosophies = [
  { id: "backToEden", name: "Back to Eden", tagline: "Cover the ground and let it do the work.", icon: "\uD83C\uDF32" },
  { id: "noDig", name: "No-Dig", tagline: "Build up. Never break the soil.", icon: "\uD83E\uDEA8" },
  { id: "kitchenGarden", name: "Kitchen Garden", tagline: "Grow what you eat. Eat what you grow.", icon: "\uD83C\uDF75" },
  { id: "habitatFirst", name: "Habitat First", tagline: "Grow for the birds, the bees, and the soil.", icon: "\uD83D\uDC1D" },
  { id: "homestead", name: "Homestead", tagline: "Grow enough to matter.", icon: "\uD83C\uDFE1" },
  { id: "communityGarden", name: "Community Garden", tagline: "Grow together.", icon: "\uD83E\uDD1D" },
];

const cropPatterns = [
  { id: "firstGarden", name: "Your First Garden", tagline: "Five easy wins to build your confidence.", cropCount: 5 },
  { id: "saladEveryDay", name: "Salad Every Day", tagline: "Cut-and-come-again greens all season.", cropCount: 5 },
  { id: "salsaGarden", name: "Salsa Garden", tagline: "Grow your own chips-and-dip night.", cropCount: 5 },
  { id: "herbWindowsill", name: "Windowsill Herbs", tagline: "No yard? No problem.", cropCount: 5 },
  { id: "feedTheFamily", name: "Feed the Family", tagline: "Real food from real ground.", cropCount: 8 },
  { id: "pollinatorPatch", name: "Pollinator Patch", tagline: "Feed the bees. They'll feed you back.", cropCount: 5 },
];

export default function Onboarding() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);

  // Step 1
  const [address, setAddress] = useState("");
  // Step 2
  const [gardenType, setGardenType] = useState<"solo" | "community" | null>(null);
  // Step 3
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  // Step 5
  const [budget, setBudget] = useState<string | null>(null);
  // Step 6
  const [philosophy, setPhilosophy] = useState<string | null>(null);
  // Step 7
  const [cropPattern, setCropPattern] = useState<string | null>(null);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return address.trim().length > 0;
      case 2: return gardenType !== null;
      case 3: return selectedGoals.length > 0;
      case 4: return true; // placeholder step, always passable
      case 5: return budget !== null;
      case 6: return philosophy !== null;
      case 7: return true; // can skip
      default: return true;
    }
  };

  const handleFinish = () => {
    // In production this would persist onboarding data and navigate
    window.location.href = "/app/home";
  };

  const heading: React.CSSProperties = {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 26,
    color: tokens.text,
    fontWeight: 400,
    marginBottom: 4,
  };

  const subtitle: React.CSSProperties = {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 14,
    color: tokens.muted,
    marginBottom: 28,
  };

  const cardBase: React.CSSProperties = {
    borderRadius: 12,
    border: "2px solid #e0ddd6",
    padding: "16px 18px",
    cursor: "pointer",
    fontFamily: "'Work Sans', sans-serif",
    transition: "border-color 0.15s",
    backgroundColor: tokens.surface,
  };

  const selectedBorder = `2px solid ${tokens.primary}`;

  // ---- Step renderers ----

  const renderStep1 = () => (
    <>
      <h2 style={heading}>{t("onboarding.step1_title")}</h2>
      <p style={subtitle}>{t("onboarding.step1_subtitle")}</p>
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
        {t("onboarding.step1_address_label")}
      </label>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={t("onboarding.step1_address_placeholder")}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #d4d0c8",
          fontFamily: "'Work Sans', sans-serif",
          fontSize: 15,
          color: tokens.text,
          backgroundColor: tokens.bg,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <h2 style={heading}>{t("onboarding.step2_title")}</h2>
      <p style={subtitle}>{t("onboarding.step2_subtitle")}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Solo */}
        <div
          onClick={() => setGardenType("solo")}
          style={{
            ...cardBase,
            border: gardenType === "solo" ? selectedBorder : cardBase.border,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: tokens.text, marginBottom: 4 }}>
            {t("onboarding.step2_solo_title")}
          </div>
          <div style={{ fontSize: 13, color: tokens.muted }}>
            {t("onboarding.step2_solo_description")}
          </div>
        </div>
        {/* Community */}
        <div
          onClick={() => setGardenType("community")}
          style={{
            ...cardBase,
            border: gardenType === "community" ? selectedBorder : cardBase.border,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: tokens.text, marginBottom: 4 }}>
            {t("onboarding.step2_community_title")}
          </div>
          <div style={{ fontSize: 13, color: tokens.muted }}>
            {t("onboarding.step2_community_description")}
          </div>
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <h2 style={heading}>{t("onboarding.step3_title")}</h2>
      <p style={subtitle}>{t("onboarding.step3_subtitle")}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        {goals.map((goal) => {
          const active = selectedGoals.includes(goal);
          return (
            <div
              key={goal}
              onClick={() => toggleGoal(goal)}
              style={{
                ...cardBase,
                border: active ? selectedBorder : cardBase.border,
                padding: "12px 14px",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? tokens.primary : tokens.text,
                textAlign: "center",
              }}
            >
              {goal}
            </div>
          );
        })}
      </div>
    </>
  );

  const renderStep4 = () => (
    <>
      <h2 style={heading}>{t("onboarding.step4_title")}</h2>
      <p style={subtitle}>{t("onboarding.step4_subtitle")}</p>
      <div
        style={{
          width: "100%",
          height: 240,
          borderRadius: 12,
          backgroundColor: "#e8e5de",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Work Sans', sans-serif",
          color: tokens.muted,
          fontSize: 14,
          border: "1px dashed #c8c4bc",
        }}
      >
        Map / aerial view placeholder
      </div>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button
          onClick={() => setStep(step + 1)}
          style={{
            background: "none",
            border: "none",
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 14,
            color: tokens.muted,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {t("onboarding.step4_skip")}
        </button>
      </div>
    </>
  );

  const renderStep5 = () => (
    <>
      <h2 style={heading}>{t("onboarding.step5_title")}</h2>
      <p style={subtitle}>{t("onboarding.step5_subtitle")}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {budgetOptions.map((opt) => (
          <div
            key={opt.id}
            onClick={() => setBudget(opt.id)}
            style={{
              ...cardBase,
              border: budget === opt.id ? selectedBorder : cardBase.border,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: budget === opt.id
                  ? `6px solid ${tokens.primary}`
                  : "2px solid #c8c4bc",
                flexShrink: 0,
                boxSizing: "border-box",
              }}
            />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: tokens.text }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 13, color: tokens.muted }}>{opt.description}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderStep6 = () => (
    <>
      <h2 style={heading}>{t("onboarding.step6_title")}</h2>
      <p style={subtitle}>{t("onboarding.step6_subtitle")}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        {philosophies.map((p) => (
          <div
            key={p.id}
            onClick={() => setPhilosophy(p.id)}
            style={{
              ...cardBase,
              border: philosophy === p.id ? selectedBorder : cardBase.border,
              textAlign: "center",
              padding: "16px 12px",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{p.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: tokens.text, marginBottom: 2 }}>
              {p.name}
            </div>
            <div style={{ fontSize: 12, color: tokens.muted, lineHeight: 1.35 }}>
              {p.tagline}
            </div>
          </div>
        ))}
      </div>
      {/* Still exploring */}
      <div
        onClick={() => setPhilosophy("exploring")}
        style={{
          ...cardBase,
          border: philosophy === "exploring" ? selectedBorder : cardBase.border,
          textAlign: "center",
          marginTop: 10,
          padding: "12px 14px",
          fontSize: 14,
          color: philosophy === "exploring" ? tokens.primary : tokens.muted,
          fontWeight: philosophy === "exploring" ? 600 : 400,
        }}
      >
        {t("onboarding.step6_exploring")}
      </div>
    </>
  );

  const renderStep7 = () => (
    <>
      <h2 style={heading}>{t("onboarding.step7_title")}</h2>
      <p style={subtitle}>{t("onboarding.step7_subtitle")}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {cropPatterns.map((cp) => (
          <div
            key={cp.id}
            onClick={() => setCropPattern(cp.id)}
            style={{
              ...cardBase,
              border: cropPattern === cp.id ? selectedBorder : cardBase.border,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: tokens.text, marginBottom: 2 }}>
                {cp.name}
              </div>
              <div style={{ fontSize: 13, color: tokens.muted }}>{cp.tagline}</div>
            </div>
            <div
              style={{
                fontFamily: "'Work Sans', sans-serif",
                fontSize: 12,
                color: tokens.primary,
                fontWeight: 600,
                whiteSpace: "nowrap",
                marginLeft: 12,
              }}
            >
              {cp.cropCount} crops
            </div>
          </div>
        ))}
      </div>
      {/* Skip */}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button
          onClick={handleFinish}
          style={{
            background: "none",
            border: "none",
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 14,
            color: tokens.muted,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Skip — I'll decide later
        </button>
      </div>
    </>
  );

  const stepRenderers: Record<number, () => React.ReactNode> = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
    5: renderStep5,
    6: renderStep6,
    7: renderStep7,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: tokens.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
      }}
    >
      {/* Step indicator */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 13,
            color: tokens.muted,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {t("onboarding.step_of", { current: step, total: TOTAL_STEPS })}
        </div>
        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: 4,
            borderRadius: 2,
            backgroundColor: "#e0ddd6",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(step / TOTAL_STEPS) * 100}%`,
              height: "100%",
              backgroundColor: tokens.primary,
              borderRadius: 2,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          backgroundColor: tokens.surface,
          borderRadius: 16,
          padding: "32px 28px",
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          marginTop: 16,
        }}
      >
        {stepRenderers[step]?.()}
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 24,
          maxWidth: 480,
          width: "100%",
        }}
      >
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 10,
              border: `1px solid #d4d0c8`,
              backgroundColor: "transparent",
              color: tokens.text,
              fontFamily: "'Work Sans', sans-serif",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {t("common.back")}
          </button>
        )}
        <button
          onClick={() => {
            if (step === TOTAL_STEPS) {
              handleFinish();
            } else {
              setStep(step + 1);
            }
          }}
          disabled={!canProceed()}
          style={{
            flex: step > 1 ? 1 : undefined,
            width: step === 1 ? "100%" : undefined,
            padding: "12px 0",
            borderRadius: 10,
            border: "none",
            backgroundColor: canProceed() ? tokens.primary : "#c8c4bc",
            color: "#fff",
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            cursor: canProceed() ? "pointer" : "not-allowed",
          }}
        >
          {step === TOTAL_STEPS ? t("common.done") : t("common.next")}
        </button>
      </div>
    </div>
  );
}
