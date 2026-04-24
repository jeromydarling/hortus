// sync-user-map-pin: Updates user_map_pins aggregate when a user creates or
// updates their land. Calls the upsert_user_map_pin() database function.
// Typically triggered by a database webhook on the lands table.

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

    const body = await req.json();
    const { land_id } = body;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the land record
    const { data: land, error: landError } = await serviceClient
      .from("lands")
      .select("*")
      .eq("id", land_id ?? "")
      .eq("user_id", user.id)
      .single();

    if (landError || !land) {
      return new Response(
        JSON.stringify({ error: "Land not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the upsert_user_map_pin database function
    const { data: result, error: rpcError } = await serviceClient.rpc("upsert_user_map_pin", {
      p_user_id: user.id,
      p_land_id: land.id,
      p_lat: land.latitude,
      p_lng: land.longitude,
      p_display_name: land.name ?? "My Garden",
      p_zone: land.hardiness_zone ?? null,
    });

    if (rpcError) {
      console.error("upsert_user_map_pin error:", rpcError);
      return new Response(
        JSON.stringify({ error: "Failed to update map pin" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("sync-user-map-pin error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
