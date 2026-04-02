/**
 * ErrorBoundary — Catches React render errors and reports them.
 *
 * Ported from thecros OperatorErrorBoundary pattern.
 *
 * WHAT: Wraps the app in an error boundary that catches render crashes,
 *       logs them to Supabase (system_error_events), and shows a calm
 *       recovery UI instead of a blank screen.
 * WHY: Production resilience. NRI can reference recent errors in its
 *       nudges: "Something didn't go as expected. Your gardener is aware."
 */

import { Component, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Log to Supabase — fire and forget
    void supabase
      .from("system_error_events")
      .insert({
        error_type: "render_crash",
        message: error.message,
        stack: error.stack?.slice(0, 2000),
        component: info.componentStack?.slice(0, 500),
        route: window.location.pathname,
        created_at: new Date().toISOString(),
      })
      .then(() => {});

    console.error("[Hortus ErrorBoundary]", error, info);
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/app/home";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={container}>
          <div style={card}>
            <div style={seedIcon}>
              <svg
                width={48}
                height={48}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2C8.5 2 5.5 5 5.5 9C5.5 13.5 9 17 12 22C15 17 18.5 13.5 18.5 9C18.5 5 15.5 2 12 2Z"
                  fill="#0d6f74"
                  opacity={0.3}
                />
              </svg>
            </div>
            <h2 style={heading}>Something needs tending</h2>
            <p style={message}>
              The app encountered an unexpected issue. Your garden data is safe
              — nothing was lost. This has been reported automatically.
            </p>
            {this.state.error && (
              <details style={details}>
                <summary style={detailsSummary}>Technical details</summary>
                <pre style={errorPre}>{this.state.error.message}</pre>
              </details>
            )}
            <div style={buttons}>
              <button onClick={this.handleReload} style={primaryBtn}>
                Reload page
              </button>
              <button onClick={this.handleGoHome} style={secondaryBtn}>
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Styles
const container: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f7f6f2",
  padding: 24,
  fontFamily: "'Work Sans', system-ui, sans-serif",
};

const card: React.CSSProperties = {
  maxWidth: 440,
  textAlign: "center",
  background: "white",
  borderRadius: 16,
  border: "1px solid #e8e5de",
  padding: "48px 32px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
};

const seedIcon: React.CSSProperties = {
  marginBottom: 16,
};

const heading: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: 24,
  fontWeight: 400,
  color: "#26231d",
  margin: "0 0 12px",
};

const message: React.CSSProperties = {
  fontSize: 14,
  color: "#706b63",
  lineHeight: 1.6,
  margin: "0 0 24px",
};

const details: React.CSSProperties = {
  textAlign: "left",
  marginBottom: 24,
};

const detailsSummary: React.CSSProperties = {
  fontSize: 12,
  color: "#706b63",
  cursor: "pointer",
  marginBottom: 8,
};

const errorPre: React.CSSProperties = {
  fontSize: 11,
  color: "#aa6d22",
  background: "#faf5eb",
  padding: 12,
  borderRadius: 8,
  overflow: "auto",
  maxHeight: 120,
  fontFamily: "monospace",
};

const buttons: React.CSSProperties = {
  display: "flex",
  gap: 12,
  justifyContent: "center",
};

const primaryBtn: React.CSSProperties = {
  padding: "10px 24px",
  background: "#0d6f74",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  padding: "10px 24px",
  background: "transparent",
  color: "#706b63",
  border: "1px solid #e8e5de",
  borderRadius: 8,
  fontSize: 14,
  cursor: "pointer",
};
