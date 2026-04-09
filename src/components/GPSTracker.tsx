/**
 * GPSTracker — GPS visit verification component.
 *
 * Tracks the user's position during a garden visit and saves a
 * visit record with start/end coordinates and duration.  Works
 * offline via the queue.
 *
 * UI states:
 * - Idle:     "Start Tracking" button
 * - Tracking: live lat/lon, accuracy, duration timer, small map placeholder
 * - Saved:    brief confirmation
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useOfflineSync } from "@/hooks/useOfflineSync";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Coordinates {
  lat: number;
  lon: number;
  accuracy: number;
}

interface VisitRecord {
  startCoords: Coordinates;
  endCoords: Coordinates;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  path: Coordinates[];
}

type TrackerState = "idle" | "tracking" | "saved";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GPSTracker() {
  const { t } = useTranslation();
  const { queueVisit, isOnline } = useOfflineSync();

  const [state, setState] = useState<TrackerState>("idle");
  const [current, setCurrent] = useState<Coordinates | null>(null);
  const [startCoords, setStartCoords] = useState<Coordinates | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const pathRef = useRef<Coordinates[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -----------------------------------------------------------------------
  // Format elapsed time
  // -----------------------------------------------------------------------
  const formatDuration = useCallback((seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }, []);

  // -----------------------------------------------------------------------
  // Start tracking
  // -----------------------------------------------------------------------
  const startTracking = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGpsError("Geolocation not available on this device");
      return;
    }

    setGpsError(null);
    pathRef.current = [];
    const now = Date.now();
    setStartTime(now);
    setElapsed(0);

    // Duration timer
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - now) / 1000));
    }, 1000);

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setCurrent(coords);
        pathRef.current.push(coords);

        // Capture start coords from first fix
        setStartCoords((prev) => prev ?? coords);
      },
      (err) => {
        setGpsError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      },
    );

    setState("tracking");
  }, []);

  // -----------------------------------------------------------------------
  // Stop tracking & save
  // -----------------------------------------------------------------------
  const stopAndSave = useCallback(async () => {
    setSaving(true);

    // Stop watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Stop timer
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const endCoords = current ?? startCoords;
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

    const record: VisitRecord = {
      startCoords: startCoords ?? { lat: 0, lon: 0, accuracy: 0 },
      endCoords: endCoords ?? { lat: 0, lon: 0, accuracy: 0 },
      startedAt: new Date(startTime).toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds,
      path: pathRef.current,
    };

    await queueVisit({
      start_lat: record.startCoords.lat,
      start_lon: record.startCoords.lon,
      end_lat: record.endCoords.lat,
      end_lon: record.endCoords.lon,
      start_accuracy: record.startCoords.accuracy,
      end_accuracy: record.endCoords.accuracy,
      started_at: record.startedAt,
      ended_at: record.endedAt,
      duration_seconds: record.durationSeconds,
      path_json: JSON.stringify(record.path),
      created_at: new Date().toISOString(),
    });

    setSaving(false);
    setState("saved");

    // Reset after showing confirmation
    setTimeout(() => {
      setState("idle");
      setCurrent(null);
      setStartCoords(null);
      setElapsed(0);
      pathRef.current = [];
    }, 3000);
  }, [current, startCoords, startTime, queueVisit]);

  // -----------------------------------------------------------------------
  // Cleanup on unmount
  // -----------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // -----------------------------------------------------------------------
  // Render: Saved state
  // -----------------------------------------------------------------------
  if (state === "saved") {
    return (
      <div style={savedBanner}>
        <span style={{ fontSize: 18 }}>{"\u2713"}</span>
        <span style={savedText}>
          {isOnline
            ? t("gpsTracker.saved", "Visit recorded")
            : t("gpsTracker.queued", "Visit queued \u2014 will sync when connected")}
        </span>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: Idle state
  // -----------------------------------------------------------------------
  if (state === "idle") {
    return (
      <div style={container}>
        <h3 style={title}>{t("gpsTracker.title", "GPS Visit Tracker")}</h3>
        <p style={description}>
          {t(
            "gpsTracker.description",
            "Track your position during a garden visit. Records start and end coordinates with duration.",
          )}
        </p>
        {gpsError && <p style={errorText}>{gpsError}</p>}
        <button type="button" onClick={startTracking} style={startButton}>
          {t("gpsTracker.start", "Start Tracking")}
        </button>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: Tracking state
  // -----------------------------------------------------------------------
  return (
    <div style={container}>
      <h3 style={title}>{t("gpsTracker.tracking", "Tracking Visit")}</h3>

      {/* Duration */}
      <div style={durationDisplay}>
        <span style={durationLabel}>Duration</span>
        <span style={durationValue}>{formatDuration(elapsed)}</span>
      </div>

      {/* Coordinates */}
      {current ? (
        <div style={coordsGrid}>
          <div style={coordBox}>
            <span style={coordLabel}>Latitude</span>
            <span style={coordValue}>{current.lat.toFixed(6)}</span>
          </div>
          <div style={coordBox}>
            <span style={coordLabel}>Longitude</span>
            <span style={coordValue}>{current.lon.toFixed(6)}</span>
          </div>
          <div style={coordBox}>
            <span style={coordLabel}>Accuracy</span>
            <span style={coordValue}>{"\u00B1"}{current.accuracy.toFixed(0)}m</span>
          </div>
          <div style={coordBox}>
            <span style={coordLabel}>Points</span>
            <span style={coordValue}>{pathRef.current.length}</span>
          </div>
        </div>
      ) : (
        <p style={acquiringText}>Acquiring GPS signal...</p>
      )}

      {gpsError && <p style={errorText}>{gpsError}</p>}

      {/* Map placeholder */}
      <div style={mapPlaceholder}>
        <div style={mapPin} />
        <span style={mapText}>
          {current
            ? `${current.lat.toFixed(4)}, ${current.lon.toFixed(4)}`
            : "Waiting for position..."}
        </span>
        {current && (
          <div style={mapAccuracyCircle}>
            <span style={mapAccuracyLabel}>
              {"\u00B1"}{current.accuracy.toFixed(0)}m
            </span>
          </div>
        )}
      </div>

      {/* Stop & Save */}
      <button
        type="button"
        onClick={() => void stopAndSave()}
        disabled={saving}
        style={{
          ...stopButton,
          ...(saving ? { opacity: 0.6 } : {}),
        }}
      >
        {saving
          ? t("gpsTracker.saving", "Saving...")
          : t("gpsTracker.stop", "Stop & Save")}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const container: React.CSSProperties = {
  background: "#fbfaf7",
  border: "1px solid #e8e5de",
  borderRadius: 12,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 14,
  maxWidth: 420,
};

const title: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: 20,
  color: "#3d3a36",
  margin: 0,
};

const description: React.CSSProperties = {
  fontSize: 13,
  color: "#706b63",
  lineHeight: 1.4,
  margin: 0,
};

const durationDisplay: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "16px 0",
};

const durationLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#706b63",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const durationValue: React.CSSProperties = {
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  fontSize: 32,
  fontWeight: 600,
  color: "#3d3a36",
  letterSpacing: "1px",
};

const coordsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const coordBox: React.CSSProperties = {
  background: "#f5f4f0",
  borderRadius: 8,
  padding: "8px 12px",
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const coordLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: "#706b63",
  textTransform: "uppercase",
  letterSpacing: "0.3px",
};

const coordValue: React.CSSProperties = {
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  fontSize: 13,
  color: "#3d3a36",
};

const acquiringText: React.CSSProperties = {
  fontSize: 13,
  color: "#706b63",
  fontStyle: "italic",
  textAlign: "center",
  margin: 0,
};

const mapPlaceholder: React.CSSProperties = {
  background: "linear-gradient(135deg, #e8efe3 0%, #dce5d4 100%)",
  border: "1px solid #c8d4be",
  borderRadius: 10,
  height: 120,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  position: "relative",
  overflow: "hidden",
};

const mapPin: React.CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: "50%",
  background: "#c0392b",
  border: "2px solid white",
  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
};

const mapText: React.CSSProperties = {
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  fontSize: 11,
  color: "#5a6e4e",
};

const mapAccuracyCircle: React.CSSProperties = {
  position: "absolute",
  width: 60,
  height: 60,
  borderRadius: "50%",
  border: "2px dashed rgba(93, 125, 74, 0.3)",
  background: "rgba(93, 125, 74, 0.05)",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  paddingBottom: 2,
};

const mapAccuracyLabel: React.CSSProperties = {
  fontSize: 9,
  color: "#5d7d4a",
  fontWeight: 600,
};

const startButton: React.CSSProperties = {
  background: "#5d7d4a",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "12px 20px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "center",
};

const stopButton: React.CSSProperties = {
  background: "#c0392b",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "12px 20px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "center",
};

const errorText: React.CSSProperties = {
  fontSize: 12,
  color: "#c0392b",
  margin: 0,
};

const savedBanner: React.CSSProperties = {
  background: "linear-gradient(135deg, #e8f0e0 0%, #d8e8cc 100%)",
  border: "1px solid #b8d4a0",
  borderRadius: 12,
  padding: "20px 24px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  maxWidth: 420,
};

const savedText: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: 16,
  color: "#3d3a36",
};
