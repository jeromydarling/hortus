// nri-phase-detect: Daily phase detection (cron: daily 4 AM).
// Fetches each user's land, weather, and observations,
// then asks NRI to detect the current phenological phase.
// No rate limit (cron-triggered).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify cron secret to prevent unauthorized invocation
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all active users with land data
    const { data: lands, error: landsError } = await serviceClient
      .from("lands")
      .select("user_id, *");

    if (landsError) {
      throw new Error(`Failed to fetch lands: ${landsError.message}`);
    }

    const results: Array<{ user_id: string; phase: string; ok: boolean }> = [];

    for (const land of lands ?? []) {
      try {
        // Fetch weather and recent observations for this user
        const [weatherRes, obsRes] = await Promise.all([
          serviceClient
            .from("weather_snapshots")
            .select("*")
            .eq("user_id", land.user_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          serviceClient
            .from("observations")
            .select("*")
            .eq("user_id", land.user_id)
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        const context = {
          land,
          weather: weatherRes.data,
          observations: obsRes.data ?? [],
        };

        // Ask NRI to detect phenological phase
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 500,
            system: `You are NRI, the Natural Rhythm Intelligence. Based on the user's land data, current weather, and recent observations, detect the current phenological phase. Return JSON with keys: phase (string), confidence (number 0-1), indicators (array of strings), summary (string).`,
            messages: [
              {
                role: "user",
                content: `Detect the current phase:\n${JSON.stringify(context, null, 2)}`,
              },
            ],
          }),
        });

        if (!anthropicRes.ok) {
          console.error(`Phase detect failed for user ${land.user_id}:`, await anthropicRes.text());
          results.push({ user_id: land.user_id, phase: "unknown", ok: false });
          continue;
        }

        const nriResponse = await anthropicRes.json();
        const phaseText = nriResponse.content?.[0]?.text ?? "";

        // Store phase detection
        await serviceClient.from("phase_detections").insert({
          user_id: land.user_id,
          detection: phaseText,
          detected_at: new Date().toISOString(),
        });

        results.push({ user_id: land.user_id, phase: phaseText, ok: true });
      } catch (userErr) {
        console.error(`Phase detect error for user ${land.user_id}:`, userErr);
        results.push({ user_id: land.user_id, phase: "error", ok: false });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("nri-phase-detect error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
