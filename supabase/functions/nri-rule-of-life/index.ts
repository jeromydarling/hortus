// nri-rule-of-life: Weekly Rule of Life generation (cron: Monday 5 AM).
// Generates a personalized weekly rhythm for each user based on their
// land, current phase, weather forecast, and plan.
// No rate limit (cron-triggered). max_tokens: 2000.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify cron secret
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

    const results: Array<{ user_id: string; ok: boolean }> = [];

    for (const land of lands ?? []) {
      try {
        // Fetch context for this user
        const [weatherRes, phaseRes, planRes] = await Promise.all([
          serviceClient
            .from("weather_snapshots")
            .select("*")
            .eq("user_id", land.user_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          serviceClient
            .from("phase_detections")
            .select("*")
            .eq("user_id", land.user_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          serviceClient
            .from("plans")
            .select("*")
            .eq("user_id", land.user_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        const context = {
          land,
          weather: weatherRes.data,
          phase: phaseRes.data,
          plan: planRes.data,
        };

        // Generate Rule of Life
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 2000,
            system: `You are NRI, the Natural Rhythm Intelligence. Generate a personalized weekly Rule of Life for a gardener. This should be a rhythmic schedule of daily attentions, tasks, and contemplations suited to their land, phase, weather, and plan. Structure it by day (Monday-Sunday) with morning, midday, and evening suggestions. Include both practical tasks and reflective moments. Return valid JSON with key "days" containing an array of day objects.`,
            messages: [
              {
                role: "user",
                content: `Generate this week's Rule of Life:\n${JSON.stringify(context, null, 2)}`,
              },
            ],
          }),
        });

        if (!anthropicRes.ok) {
          console.error(`Rule of Life failed for user ${land.user_id}:`, await anthropicRes.text());
          results.push({ user_id: land.user_id, ok: false });
          continue;
        }

        const nriResponse = await anthropicRes.json();
        const ruleText = nriResponse.content?.[0]?.text ?? "";

        // Store the Rule of Life
        await serviceClient.from("rules_of_life").insert({
          user_id: land.user_id,
          content: ruleText,
          week_of: new Date().toISOString(),
        });

        results.push({ user_id: land.user_id, ok: true });
      } catch (userErr) {
        console.error(`Rule of Life error for user ${land.user_id}:`, userErr);
        results.push({ user_id: land.user_id, ok: false });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("nri-rule-of-life error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
