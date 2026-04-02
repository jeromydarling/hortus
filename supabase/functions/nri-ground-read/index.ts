// nri-ground-read: Onboarding soil reading.
// Calls SSURGO API for soil data at the user's coordinates,
// then sends to NRI for trilingual interpretation (scientific, practical, poetic).
// Rate limit: 5/hour per user.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

    // Rate limit: 5 requests per hour per user
    const allowed = await checkRateLimit(`nri-ground-read:${user.id}`, 3600, 5);
    if (!allowed) {
      return rateLimitedResponse(corsHeaders);
    }

    const body = await req.json();
    const { latitude, longitude } = body;

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: "latitude and longitude are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch soil data from SSURGO/Web Soil Survey
    // TODO: Replace with actual SSURGO SDM API endpoint and proper query
    const ssurgoUrl = `https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest`;
    const ssurgoQuery = `SELECT musym, muname, comppct_r, taxclname, taxorder
      FROM component
      INNER JOIN mapunit ON component.mukey = mapunit.mukey
      INNER JOIN sacatalog ON mapunit.lkey = sacatalog.lkey
      WHERE sacatalog.areasymbol IN (
        SELECT areasymbol FROM sastatement
      )
      LIMIT 5`;

    let soilData: Record<string, unknown> = {};
    try {
      const ssurgoRes = await fetch(ssurgoUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: ssurgoQuery,
          format: "JSON",
        }),
      });
      if (ssurgoRes.ok) {
        soilData = await ssurgoRes.json();
      }
    } catch (ssurgoErr) {
      console.error("SSURGO fetch error:", ssurgoErr);
      // Proceed with empty soil data; NRI will note unavailability
    }

    // Send soil data to NRI for trilingual interpretation
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
        system: `You are NRI, the Natural Rhythm Intelligence for Hortus, a gardening app.
Given SSURGO soil data for a location, provide a Ground Read in three registers:
1. Scientific: soil taxonomy, drainage class, pH range, organic matter
2. Practical: what grows well here, amendments needed, drainage tips
3. Poetic: a brief, evocative description of this ground's character and potential

Return valid JSON with keys: scientific, practical, poetic.`,
        messages: [
          {
            role: "user",
            content: `Location: ${latitude}, ${longitude}\n\nSSURGO Soil Data:\n${JSON.stringify(soilData, null, 2)}`,
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
    const groundRead = nriResponse.content?.[0]?.text ?? "";

    // Store the ground read
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient.from("ground_reads").insert({
      user_id: user.id,
      latitude,
      longitude,
      ssurgo_data: soilData,
      interpretation: groundRead,
    });

    return new Response(
      JSON.stringify({ ground_read: groundRead }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("nri-ground-read error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
