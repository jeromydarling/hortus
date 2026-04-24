// search-food-systems: Uses Perplexity API to find local food system points
// (farmers markets, CSAs, seed libraries) near a zip code.
// Stores results in food_system_points table. Rate limit: 10/hour per user.

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

    // Rate limit: 10 requests per hour per user
    const allowed = await checkRateLimit(`search-food-systems:${user.id}`, 3600, 10);
    if (!allowed) {
      return rateLimitedResponse(corsHeaders);
    }

    const body = await req.json();
    const { zip } = body;

    if (!zip || typeof zip !== "string") {
      return new Response(
        JSON.stringify({ error: "zip is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Perplexity API to search for local food system resources
    const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("PERPLEXITY_API_KEY")!}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          {
            role: "system",
            content: `You are a local food system researcher. Given a zip code, find nearby farmers markets, CSAs (Community Supported Agriculture), seed libraries, community gardens, and food co-ops. Return a JSON array of objects with keys: name (string), type (one of: farmers_market, csa, seed_library, community_garden, food_coop), address (string), description (string), url (string or null), lat (number or null), lng (number or null).`,
          },
          {
            role: "user",
            content: `Find farmers markets, CSAs, seed libraries, community gardens, and food co-ops near zip code ${zip}. Return results as a JSON array.`,
          },
        ],
      }),
    });

    if (!perplexityRes.ok) {
      const errBody = await perplexityRes.text();
      console.error("Perplexity API error:", errBody);
      return new Response(
        JSON.stringify({ error: "Search service unavailable" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const perplexityData = await perplexityRes.json();
    const responseText = perplexityData.choices?.[0]?.message?.content ?? "[]";

    // Parse the response to extract structured data
    let points: Array<Record<string, unknown>> = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        points = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error("Failed to parse Perplexity response:", parseErr);
    }

    // Store results in food_system_points
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (points.length > 0) {
      const rows = points.map((p) => ({
        name: p.name,
        type: p.type,
        address: p.address,
        description: p.description,
        url: p.url ?? null,
        lat: p.lat ?? null,
        lng: p.lng ?? null,
        zip,
        discovered_by: user.id,
      }));

      const { error: insertError } = await serviceClient
        .from("food_system_points")
        .upsert(rows, { onConflict: "name,zip" });

      if (insertError) {
        console.error("Failed to store food system points:", insertError);
      }
    }

    return new Response(
      JSON.stringify({ points, raw_response: responseText }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("search-food-systems error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
