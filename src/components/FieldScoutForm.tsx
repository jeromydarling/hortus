/**
 * FieldScoutForm — Structured scouting report for field visits.
 *
 * Captures observations with photos, voice notes, GPS coordinates,
 * and auto-extracted tags. Works offline via the queue.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { landService } from "@/services/land";
import { plotService } from "@/services/plot";
import { extractObservationData } from "@/lib/conversationalExtractor";
import type { ExtractedObservation } from "@/lib/conversationalExtractor";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ObservationType = "general" | "pest" | "disease" | "growth" | "harvest" | "weather";
type Severity = "none" | "low" | "medium" | "high";

interface ScoutReport {
  landId: string;
  plotId: string;
  observationType: ObservationType;
  severity: Severity;
  notes: string;
  photoUri: string | null;
  voiceNoteUri: string | null;
  gpsCoords: { lat: number; lon: number; accuracy: number } | null;
  extractedTags: ExtractedObservation;
}

interface LandOption {
  id: string;
  name: string;
}

interface PlotOption {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FieldScoutForm() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { queueObservation, isOnline } = useOfflineSync();

  // Form state
  const [lands, setLands] = useState<LandOption[]>([]);
  const [plots, setPlots] = useState<PlotOption[]>([]);
  const [landId, setLandId] = useState("");
  const [plotId, setPlotId] = useState("");
  const [observationType, setObservationType] = useState<ObservationType>("general");
  const [severity, setSeverity] = useState<Severity>("none");
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [voiceNoteUri, setVoiceNoteUri] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<ScoutReport["gpsCoords"]>(null);
  const [extracted, setExtracted] = useState<ExtractedObservation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // -----------------------------------------------------------------------
  // Load lands & plots
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    void landService.getByUser(user.id).then((data) => {
      const options = (data ?? []).map((l) => ({
        id: String(l["id"]),
        name: String(l["name"] ?? "Unnamed site"),
      }));
      setLands(options);
      if (options.length > 0 && options[0]) {
        setLandId(options[0].id);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!landId) {
      setPlots([]);
      return;
    }
    void plotService.getByLand(landId).then((data) => {
      const options = (data ?? []).map((p) => ({
        id: String(p["id"]),
        name: String(p["name"] ?? "Unnamed plot"),
      }));
      setPlots(options);
      if (options.length > 0 && options[0]) {
        setPlotId(options[0].id);
      } else {
        setPlotId("");
      }
    });
  }, [landId]);

  // -----------------------------------------------------------------------
  // GPS auto-capture
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGpsError("Geolocation not available");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        setGpsError(err.message);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  // -----------------------------------------------------------------------
  // Auto-extract tags from notes
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (notes.trim().length < 3) {
      setExtracted(null);
      return;
    }
    const timer = setTimeout(() => {
      setExtracted(extractObservationData(notes));
    }, 300);
    return () => clearTimeout(timer);
  }, [notes]);

  // -----------------------------------------------------------------------
  // Photo capture
  // -----------------------------------------------------------------------
  const handlePhotoCapture = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoUri(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // -----------------------------------------------------------------------
  // Voice note
  // -----------------------------------------------------------------------
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setVoiceNoteUri(reader.result);
          }
        };
        reader.readAsDataURL(blob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      // Permission denied or not available
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  }, []);

  // -----------------------------------------------------------------------
  // Submit
  // -----------------------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);

    const report: Record<string, unknown> = {
      land_id: landId || undefined,
      plot_id: plotId || undefined,
      observation_type: observationType,
      severity,
      notes,
      photo_uri: photoUri,
      voice_note_uri: voiceNoteUri,
      gps_lat: gpsCoords?.lat,
      gps_lon: gpsCoords?.lon,
      gps_accuracy: gpsCoords?.accuracy,
      extracted_crops: extracted?.crops ?? [],
      extracted_conditions: extracted?.conditions ?? [],
      extracted_actions: extracted?.actions ?? [],
      extracted_weather: extracted?.weatherNotes ?? [],
      sentiment: extracted?.sentiment ?? "neutral",
      created_at: new Date().toISOString(),
    };

    try {
      await queueObservation(report);
      setSubmitted(true);

      // Reset form after brief delay
      setTimeout(() => {
        setNotes("");
        setPhotoUri(null);
        setVoiceNoteUri(null);
        setObservationType("general");
        setSeverity("none");
        setExtracted(null);
        setSubmitted(false);
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  }, [
    landId, plotId, observationType, severity, notes,
    photoUri, voiceNoteUri, gpsCoords, extracted, queueObservation,
  ]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (submitted) {
    return (
      <div style={successBanner}>
        <span style={{ fontSize: 18 }}>{"\u2713"}</span>
        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16 }}>
          {isOnline ? "Observation submitted" : "Queued \u2014 will sync when connected"}
        </span>
      </div>
    );
  }

  return (
    <div style={formContainer}>
      <h3 style={formTitle}>{t("fieldScout.title", "Field Scout Report")}</h3>

      {/* Garden / Site selector */}
      <label style={labelStyle}>
        {t("fieldScout.site", "Garden / Site")}
        <select
          value={landId}
          onChange={(e) => setLandId(e.target.value)}
          style={selectStyle}
        >
          <option value="">Select a site...</option>
          {lands.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </label>

      {/* Bed / Plot selector */}
      <label style={labelStyle}>
        {t("fieldScout.plot", "Bed / Plot")}
        <select
          value={plotId}
          onChange={(e) => setPlotId(e.target.value)}
          style={selectStyle}
        >
          <option value="">Select a bed...</option>
          {plots.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>

      {/* Observation type */}
      <label style={labelStyle}>
        {t("fieldScout.type", "Observation type")}
        <select
          value={observationType}
          onChange={(e) => setObservationType(e.target.value as ObservationType)}
          style={selectStyle}
        >
          <option value="general">General</option>
          <option value="pest">Pest</option>
          <option value="disease">Disease</option>
          <option value="growth">Growth</option>
          <option value="harvest">Harvest</option>
          <option value="weather">Weather</option>
        </select>
      </label>

      {/* Severity */}
      <label style={labelStyle}>
        {t("fieldScout.severity", "Severity")}
        <div style={severityRow}>
          {(["none", "low", "medium", "high"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              style={{
                ...severityButton,
                ...(severity === s ? severityButtonActive : {}),
                ...(s === "high" && severity === s ? { background: "#c0392b", borderColor: "#c0392b" } : {}),
                ...(s === "medium" && severity === s ? { background: "#d4a017", borderColor: "#d4a017" } : {}),
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </label>

      {/* Photo & Voice row */}
      <div style={mediaRow}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={handlePhotoCapture}
          style={mediaButton}
        >
          {photoUri ? "\u2713 Photo taken" : t("fieldScout.photo", "Take photo")}
        </button>

        <button
          type="button"
          onClick={isRecording ? stopRecording : () => void startRecording()}
          style={{
            ...mediaButton,
            ...(isRecording ? { background: "#c0392b", color: "white", borderColor: "#c0392b" } : {}),
          }}
        >
          {isRecording
            ? t("fieldScout.stopRecording", "Stop recording")
            : voiceNoteUri
              ? "\u2713 Voice note saved"
              : t("fieldScout.voiceNote", "Voice note")}
        </button>
      </div>

      {/* Photo preview */}
      {photoUri && (
        <div style={photoPreview}>
          <img src={photoUri} alt="Captured" style={photoImage} />
          <button
            type="button"
            onClick={() => setPhotoUri(null)}
            style={removeButton}
          >
            {"\u00D7"}
          </button>
        </div>
      )}

      {/* Notes */}
      <label style={labelStyle}>
        {t("fieldScout.notes", "Notes")}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you observe? Mention crops, beds, conditions..."
          rows={4}
          style={textareaStyle}
        />
      </label>

      {/* Auto-extracted tags */}
      {extracted && hasExtractedData(extracted) && (
        <div style={tagsContainer}>
          <p style={tagsLabel}>Auto-detected:</p>
          <div style={tagsRow}>
            {extracted.crops.map((c) => (
              <span key={`crop-${c}`} style={{ ...tag, ...cropTag }}>{c}</span>
            ))}
            {extracted.beds.map((b) => (
              <span key={`bed-${b}`} style={{ ...tag, ...bedTag }}>{b}</span>
            ))}
            {extracted.conditions.map((c) => (
              <span key={`cond-${c}`} style={{ ...tag, ...condTag }}>{c}</span>
            ))}
            {extracted.actions.map((a) => (
              <span key={`act-${a}`} style={{ ...tag, ...actionTag }}>{a}</span>
            ))}
            {extracted.weatherNotes.map((w) => (
              <span key={`weather-${w}`} style={{ ...tag, ...weatherTag }}>{w}</span>
            ))}
            {extracted.phenologyEvents.map((p) => (
              <span key={`phen-${p}`} style={{ ...tag, ...phenTag }}>{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* GPS display */}
      <div style={gpsDisplay}>
        {gpsCoords ? (
          <span style={gpsText}>
            GPS: {gpsCoords.lat.toFixed(5)}, {gpsCoords.lon.toFixed(5)}
            {" "}&middot; {"\u00B1"}{gpsCoords.accuracy.toFixed(0)}m
          </span>
        ) : gpsError ? (
          <span style={{ ...gpsText, color: "#aa6d22" }}>GPS: {gpsError}</span>
        ) : (
          <span style={gpsText}>Acquiring GPS...</span>
        )}
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={submitting}
        style={{
          ...submitButton,
          ...(submitting ? { opacity: 0.6 } : {}),
        }}
      >
        {submitting
          ? t("fieldScout.submitting", "Submitting...")
          : isOnline
            ? t("fieldScout.submit", "Submit report")
            : t("fieldScout.queueReport", "Queue report (offline)")}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasExtractedData(e: ExtractedObservation): boolean {
  return (
    e.crops.length > 0 ||
    e.beds.length > 0 ||
    e.conditions.length > 0 ||
    e.actions.length > 0 ||
    e.phenologyEvents.length > 0 ||
    e.weatherNotes.length > 0
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const formContainer: React.CSSProperties = {
  background: "#fbfaf7",
  border: "1px solid #e8e5de",
  borderRadius: 12,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  maxWidth: 520,
};

const formTitle: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: 20,
  color: "#3d3a36",
  margin: 0,
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 13,
  fontWeight: 600,
  color: "#706b63",
  textTransform: "uppercase",
  letterSpacing: "0.3px",
};

const selectStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #e8e5de",
  fontSize: 14,
  fontWeight: 400,
  textTransform: "none",
  letterSpacing: "normal",
  color: "#3d3a36",
  background: "white",
};

const severityRow: React.CSSProperties = {
  display: "flex",
  gap: 6,
  marginTop: 2,
};

const severityButton: React.CSSProperties = {
  flex: 1,
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #e8e5de",
  background: "white",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  color: "#3d3a36",
  textTransform: "none",
  letterSpacing: "normal",
};

const severityButtonActive: React.CSSProperties = {
  background: "#5d7d4a",
  color: "white",
  borderColor: "#5d7d4a",
};

const mediaRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
};

const mediaButton: React.CSSProperties = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #e8e5de",
  background: "white",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  color: "#3d3a36",
};

const photoPreview: React.CSSProperties = {
  position: "relative",
  borderRadius: 8,
  overflow: "hidden",
  maxHeight: 200,
};

const photoImage: React.CSSProperties = {
  width: "100%",
  maxHeight: 200,
  objectFit: "cover",
  display: "block",
};

const removeButton: React.CSSProperties = {
  position: "absolute",
  top: 6,
  right: 6,
  width: 24,
  height: 24,
  borderRadius: "50%",
  border: "none",
  background: "rgba(0,0,0,0.5)",
  color: "white",
  fontSize: 14,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const textareaStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #e8e5de",
  fontSize: 14,
  fontWeight: 400,
  textTransform: "none",
  letterSpacing: "normal",
  color: "#3d3a36",
  resize: "vertical",
  fontFamily: "inherit",
};

const tagsContainer: React.CSSProperties = {
  background: "#f5f4f0",
  borderRadius: 8,
  padding: "10px 12px",
};

const tagsLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#706b63",
  margin: "0 0 6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tagsRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 4,
};

const tag: React.CSSProperties = {
  fontSize: 11,
  padding: "2px 8px",
  borderRadius: 12,
  fontWeight: 500,
};

const cropTag: React.CSSProperties = {
  background: "#d4edda",
  color: "#2d6a3f",
};

const bedTag: React.CSSProperties = {
  background: "#e2ecf7",
  color: "#2b5c8a",
};

const condTag: React.CSSProperties = {
  background: "#fef3cd",
  color: "#856404",
};

const actionTag: React.CSSProperties = {
  background: "#e8dff5",
  color: "#5a3d8a",
};

const weatherTag: React.CSSProperties = {
  background: "#d6eaf8",
  color: "#2e6da4",
};

const phenTag: React.CSSProperties = {
  background: "#fde2e2",
  color: "#922b21",
};

const gpsDisplay: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 6,
  background: "#f5f4f0",
};

const gpsText: React.CSSProperties = {
  fontSize: 12,
  color: "#706b63",
  fontFamily: "'SF Mono', 'Fira Code', monospace",
};

const submitButton: React.CSSProperties = {
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

const successBanner: React.CSSProperties = {
  background: "linear-gradient(135deg, #e8f0e0 0%, #d8e8cc 100%)",
  border: "1px solid #b8d4a0",
  borderRadius: 12,
  padding: "20px 24px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  maxWidth: 520,
};
