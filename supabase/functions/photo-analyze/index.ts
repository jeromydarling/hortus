/**
 * photo-analyze — Photo analysis pipeline for plant/pest identification.
 *
 * Receives a base64 image + context, runs through Plant.id API,
 * then sends results to NRI for interpretation.
 *
 * Returns: plant identification, disease detection, crop stage,
 * health assessment, tags, and NRI summary.
 *
 * Cost guard: Only called on explicit user action ("What is this?").
 * Never auto-processes photos.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitedResponse } from "../_shared/rateLimiter.ts";

const PLANT_ID_API_KEY = Deno.env.get("PLANT_ID_API_KEY") ?? "";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Rate limit: 10 analyses per hour per user
    const allowed = await checkRateLimit(`photo-analyze:${user.id}`, 3600, 10);
    if (!allowed) return rateLimitedResponse(corsHeaders);

    const { imageBase64, context } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 1: Call Plant.id API for identification
    let plantIdResult = null;
    if (PLANT_ID_API_KEY) {
      try {
        const plantIdRes = await fetch("https://api.plant.id/v3/identification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Api-Key": PLANT_ID_API_KEY,
          },
          body: JSON.stringify({
            images: [imageBase64],
            latitude: context?.lat,
            longitude: context?.lon,
            similar_images: true,
            health: "auto",
          }),
        });
        plantIdResult = await plantIdRes.json();
      } catch (e) {
        console.error("Plant.id API error:", e);
      }
    }

    // Step 2: Extract structured data from Plant.id results
    const plantIdentification = plantIdResult?.result?.classification?.suggestions?.[0]
      ? {
          name: plantIdResult.result.classification.suggestions[0].name,
          confidence: plantIdResult.result.classification.suggestions[0].probability,
          latinName: plantIdResult.result.classification.suggestions[0].name,
        }
      : undefined;

    const diseaseDetection = plantIdResult?.result?.disease?.suggestions?.[0]
      ? {
          name: plantIdResult.result.disease.suggestions[0].name,
          confidence: plantIdResult.result.disease.suggestions[0].probability,
          severity: plantIdResult.result.disease.suggestions[0].probability > 0.7 ? "high" : "moderate",
        }
      : undefined;

    // Step 3: Ask NRI to interpret the results
    let nriSummary = "";
    if (ANTHROPIC_API_KEY) {
      const nriPrompt = `Analyze this plant photo result. Plant identified: ${plantIdentification?.name ?? "unknown"} (${Math.round((plantIdentification?.confidence ?? 0) * 100)}% confidence). Disease detected: ${diseaseDetection?.name ?? "none"}. Context: crop ${context?.cropName ?? "unknown"}, land ${context?.landId ?? "unknown"}. Give a 2-sentence assessment in NRI voice — plain language, actionable.`;

      try {
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 200,
            messages: [{ role: "user", content: nriPrompt }],
          }),
        });
        const data = await anthropicRes.json();
        nriSummary = data.content?.[0]?.text ?? "";
      } catch {
        nriSummary = plantIdentification
          ? `This looks like ${plantIdentification.name} (${Math.round(plantIdentification.confidence * 100)}% confidence).`
          : "I couldn't identify this plant from the photo. Try a clearer image with the plant centered.";
      }
    }

    const result = {
      plantIdentification,
      diseaseDetection,
      cropStage: null, // TODO: infer from photo + season
      estimatedHealth: diseaseDetection ? "concern" : "healthy",
      tags: [
        plantIdentification?.name,
        diseaseDetection?.name,
        context?.cropName,
      ].filter(Boolean),
      nriSummary,
      confidence: plantIdentification?.confidence ?? null,
    };

    // Store analysis result
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await serviceSupabase.from("photo_analyses").insert({
      user_id: user.id,
      observation_id: context?.observationId ?? null,
      land_id: context?.landId ?? null,
      plot_id: context?.plotId ?? null,
      plant_identification: plantIdentification ?? null,
      disease_detection: diseaseDetection ?? null,
      estimated_health: result.estimatedHealth,
      tags: result.tags,
      nri_summary: nriSummary,
      confidence: result.confidence,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ error: err.message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
