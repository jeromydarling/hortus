// compute-resilience: Computes food resilience score for the authed user.
// Aggregates data from harvest logs, seed library, compost activity,
// and sharing/exchange data. Stores snapshot in food_resilience_snapshots.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";

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

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all relevant data in parallel
    const [harvestRes, seedRes, compostRes, sharingRes] = await Promise.all([
      serviceClient
        .from("harvest_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("harvested_at", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()),
      serviceClient
        .from("seed_library")
        .select("*")
        .eq("user_id", user.id),
      serviceClient
        .from("compost_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()),
      serviceClient
        .from("sharing_events")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const harvests = harvestRes.data ?? [];
    const seeds = seedRes.data ?? [];
    const compostLogs = compostRes.data ?? [];
    const sharingEvents = sharingRes.data ?? [];

    // Compute resilience score components (0-100 each)
    // TODO: Refine scoring weights based on research and user feedback

    // Harvest diversity: unique crops harvested in past year
    const uniqueCrops = new Set(harvests.map((h: Record<string, unknown>) => h.crop)).size;
    const harvestScore = Math.min(100, uniqueCrops * 10);

    // Seed sovereignty: seeds saved and available
    const seedScore = Math.min(100, seeds.length * 15);

    // Soil building: compost activity
    const compostScore = Math.min(100, compostLogs.length * 8);

    // Community sharing: exchanges and gifts
    const sharingScore = Math.min(100, sharingEvents.length * 12);

    // Overall resilience score (weighted average)
    const overallScore = Math.round(
      harvestScore * 0.35 +
      seedScore * 0.25 +
      compostScore * 0.20 +
      sharingScore * 0.20
    );

    const snapshot = {
      user_id: user.id,
      overall_score: overallScore,
      harvest_score: harvestScore,
      seed_score: seedScore,
      compost_score: compostScore,
      sharing_score: sharingScore,
      unique_crops: uniqueCrops,
      total_harvests: harvests.length,
      seed_varieties: seeds.length,
      compost_entries: compostLogs.length,
      sharing_events: sharingEvents.length,
      computed_at: new Date().toISOString(),
    };

    // Store snapshot
    const { error: insertError } = await serviceClient
      .from("food_resilience_snapshots")
      .insert(snapshot);

    if (insertError) {
      console.error("Failed to store resilience snapshot:", insertError);
    }

    return new Response(
      JSON.stringify(snapshot),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("compute-resilience error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
