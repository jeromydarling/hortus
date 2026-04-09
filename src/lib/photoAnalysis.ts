/**
 * Photo analysis pipeline — calls the `photo-analyze` Edge Function.
 *
 * Sends a base64-encoded image plus garden context and receives
 * plant identification, disease detection, crop stage, health rating,
 * tags, and an NRI-style summary.
 *
 * Falls back to offline queue when the device is offline.
 */

import { supabase } from "@/integrations/supabase/client";
import { queueAction } from "@/lib/offlineQueue";

export interface PhotoAnalysisResult {
  plantIdentification?: {
    name: string;
    confidence: number;
    latinName?: string;
  };
  diseaseDetection?: {
    name: string;
    confidence: number;
    severity: string;
  };
  cropStage?: string;
  estimatedHealth: "healthy" | "caution" | "concern";
  tags: string[];
  nriSummary: string;
}

export interface PhotoAnalysisContext {
  landId?: string;
  plotId?: string;
  cropName?: string;
}

/**
 * Analyze a photo by calling the `photo-analyze` Supabase Edge Function.
 *
 * If the device is offline the photo is queued for later analysis and
 * a placeholder result is returned so callers can proceed gracefully.
 */
export async function analyzePhoto(
  imageBase64: string,
  context: PhotoAnalysisContext,
): Promise<PhotoAnalysisResult> {
  // Check connectivity
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return queueForLater(imageBase64, context);
  }

  try {
    const { data, error } = await supabase.functions.invoke("photo-analyze", {
      body: {
        image: imageBase64,
        landId: context.landId,
        plotId: context.plotId,
        cropName: context.cropName,
      },
    });

    if (error) throw error;

    return parseResult(data as Record<string, unknown>);
  } catch {
    // Network failure — queue for retry
    return queueForLater(imageBase64, context);
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function parseResult(raw: Record<string, unknown>): PhotoAnalysisResult {
  const identification = raw["plantIdentification"] as
    | Record<string, unknown>
    | undefined;
  const disease = raw["diseaseDetection"] as
    | Record<string, unknown>
    | undefined;

  const healthRaw = String(raw["estimatedHealth"] ?? "caution");
  const estimatedHealth: PhotoAnalysisResult["estimatedHealth"] =
    healthRaw === "healthy" || healthRaw === "concern" ? healthRaw : "caution";

  return {
    plantIdentification: identification
      ? {
          name: String(identification["name"] ?? "Unknown"),
          confidence: Number(identification["confidence"] ?? 0),
          latinName: identification["latinName"]
            ? String(identification["latinName"])
            : undefined,
        }
      : undefined,
    diseaseDetection: disease
      ? {
          name: String(disease["name"] ?? "Unknown"),
          confidence: Number(disease["confidence"] ?? 0),
          severity: String(disease["severity"] ?? "unknown"),
        }
      : undefined,
    cropStage: raw["cropStage"] ? String(raw["cropStage"]) : undefined,
    estimatedHealth,
    tags: Array.isArray(raw["tags"])
      ? (raw["tags"] as unknown[]).map(String)
      : [],
    nriSummary: String(raw["nriSummary"] ?? "Analysis unavailable."),
  };
}

async function queueForLater(
  imageBase64: string,
  context: PhotoAnalysisContext,
): Promise<PhotoAnalysisResult> {
  await queueAction({
    type: "photo",
    payload: {
      image: imageBase64,
      ...context,
      queuedForAnalysis: true,
    },
    createdAt: new Date().toISOString(),
  });

  return {
    estimatedHealth: "caution",
    tags: ["queued-offline"],
    nriSummary: "Photo queued for analysis when connectivity returns.",
  };
}
