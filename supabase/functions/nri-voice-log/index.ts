// nri-voice-log: Processes voice transcripts from the user.
// Extracts tags, crops, conditions, and phenology events from
// natural-language voice observations. Rate limit: 20/hour per user.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitedResponse } from "../_shared/rateLimiter.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: 20 requests per hour per user
    const allowed = await checkRateLimit(`nri-voice-log:${user.id}`, 3600, 20);
    if (!allowed) {
      return rateLimitedResponse(corsHeaders);
    }

    const body = await req.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== "string") {
      return new Response(
        JSON.stringify({ error: "transcript is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send transcript to NRI for structured extraction
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: `You are NRI, the Natural Rhythm Intelligence. Extract structured data from a gardener's voice observation. Return valid JSON with these keys:
- summary (string): brief summary of the observation
- tags (string[]): relevant tags (e.g., "watering", "pest", "harvest")
- crops (string[]): any crops or plants mentioned
- conditions (object): weather/soil conditions noted (keys: weather, soil, moisture, temperature as available)
- phenology_events (array of {event: string, crop: string, date?: string}): any phenological events (first bloom, fruit set, leaf drop, etc.)
- actions_taken (string[]): any actions the gardener reports taking
- concerns (string[]): any worries or problems mentioned`,
        messages: [
          {
            role: "user",
            content: `Voice transcript:\n"${transcript}"`,
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      console.error("Anthropic API error:", errBody);
      return new Response(
        JSON.stringify({ error: "NRI service unavailable" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const nriResponse = await anthropicRes.json();
    const extraction = nriResponse.content?.[0]?.text ?? "";

    // Store the observation
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: observation, error: insertError } = await serviceClient
      .from("observations")
      .insert({
        user_id: user.id,
        transcript,
        extraction,
        source: "voice",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to store observation:", insertError);
      // Still return the extraction even if storage fails
    }

    return new Response(
      JSON.stringify({ observation_id: observation?.id, extraction }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("nri-voice-log error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
