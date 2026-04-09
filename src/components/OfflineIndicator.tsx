/**
 * OfflineIndicator — Small banner showing offline / syncing status.
 *
 * States:
 * - Offline: amber bar  "Offline — N actions queued, will sync when connected"
 * - Syncing: green pulse "Syncing N actions..."
 * - Synced:  brief green flash "All synced" then auto-hides
 */

import { useState, useEffect, useRef } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingCount, syncNow } = useOfflineSync();
  const [showSynced, setShowSynced] = useState(false);
  const prevPendingRef = useRef(pendingCount);

  // Detect transition from pending > 0 to 0 while online => flash "All synced"
  useEffect(() => {
    if (prevPendingRef.current > 0 && pendingCount === 0 && isOnline) {
      setShowSynced(true);
      const timer = setTimeout(() => setShowSynced(false), 2500);
      return () => clearTimeout(timer);
    }
    prevPendingRef.current = pendingCount;
    return undefined;
  }, [pendingCount, isOnline]);

  // --- All synced flash ---
  if (showSynced) {
    return (
      <div style={syncedBanner} role="status" aria-live="polite">
        <span style={syncedDot} />
        <span style={bannerText}>All synced</span>
      </div>
    );
  }

  // --- Syncing ---
  if (isSyncing) {
    return (
      <div style={syncingBanner} role="status" aria-live="polite">
        <span style={pulsingDot} />
        <span style={bannerText}>
          Syncing {pendingCount} action{pendingCount === 1 ? "" : "s"}...
        </span>
      </div>
    );
  }

  // --- Offline with pending actions ---
  if (!isOnline) {
    return (
      <div style={offlineBanner} role="status" aria-live="polite">
        <span style={amberDot} />
        <span style={{ ...bannerText, flex: 1 }}>
          Offline
          {pendingCount > 0
            ? ` \u2014 ${pendingCount} action${pendingCount === 1 ? "" : "s"} queued, will sync when connected`
            : ""}
        </span>
        {pendingCount > 0 && isOnline && (
          <button onClick={() => void syncNow()} style={syncButton}>
            Sync now
          </button>
        )}
      </div>
    );
  }

  // --- Online with pending actions (hasn't synced yet) ---
  if (pendingCount > 0) {
    return (
      <div style={pendingBanner} role="status" aria-live="polite">
        <span style={blueDot} />
        <span style={{ ...bannerText, flex: 1 }}>
          {pendingCount} action{pendingCount === 1 ? "" : "s"} pending
        </span>
        <button onClick={() => void syncNow()} style={syncButton}>
          Sync now
        </button>
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const baseBanner: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 14px",
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "'Inter', system-ui, sans-serif",
  margin: "8px 12px",
};

const offlineBanner: React.CSSProperties = {
  ...baseBanner,
  background: "linear-gradient(135deg, #fef3cd 0%, #fde8a0 100%)",
  border: "1px solid #e8c547",
};

const syncingBanner: React.CSSProperties = {
  ...baseBanner,
  background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
  border: "1px solid #8bc49a",
};

const syncedBanner: React.CSSProperties = {
  ...baseBanner,
  background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
  border: "1px solid #8bc49a",
  animation: "hortus-synced-fade 2.5s ease-out forwards",
};

const pendingBanner: React.CSSProperties = {
  ...baseBanner,
  background: "linear-gradient(135deg, #e2ecf7 0%, #d0dff0 100%)",
  border: "1px solid #8aaed0",
};

const bannerText: React.CSSProperties = {
  color: "#3d3a36",
  lineHeight: 1.3,
};

const dotBase: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  flexShrink: 0,
};

const amberDot: React.CSSProperties = {
  ...dotBase,
  background: "#d4a017",
};

const pulsingDot: React.CSSProperties = {
  ...dotBase,
  background: "#28a745",
  animation: "hortus-pulse 1.2s ease-in-out infinite",
};

const syncedDot: React.CSSProperties = {
  ...dotBase,
  background: "#28a745",
};

const blueDot: React.CSSProperties = {
  ...dotBase,
  background: "#4a8ec2",
};

const syncButton: React.CSSProperties = {
  background: "#5d7d4a",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "4px 10px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  flexShrink: 0,
};

// Inject keyframes once
if (typeof document !== "undefined") {
  const styleId = "hortus-offline-indicator-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes hortus-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.3); }
      }
      @keyframes hortus-synced-fade {
        0% { opacity: 1; }
        70% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
