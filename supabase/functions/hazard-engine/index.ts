// hazard-engine: Computes operational state from NWS alerts + AirNow AQI.
// Cron: every 30 minutes. Checks weather hazards and air quality,
// then updates each user's operational state (green/yellow/red/black).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type OperationalState = "green" | "yellow" | "red" | "black";

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

    // Fetch all lands
    const { data: lands, error: landsError } = await serviceClient
      .from("lands")
      .select("id, user_id, latitude, longitude, name");

    if (landsError) {
      throw new Error(`Failed to fetch lands: ${landsError.message}`);
    }

    const results: Array<{ user_id: string; state: OperationalState }> = [];

    for (const land of lands ?? []) {
      try {
        if (!land.latitude || !land.longitude) continue;

        let state: OperationalState = "green";
        const hazards: string[] = [];

        // Check NWS active alerts
        try {
          const alertsRes = await fetch(
            `https://api.weather.gov/alerts/active?point=${land.latitude},${land.longitude}`,
            { headers: { "User-Agent": "Hortus App (contact@hortus.app)" } }
          );

          if (alertsRes.ok) {
            const alertsData = await alertsRes.json();
            const features = alertsData.features ?? [];

            for (const feature of features) {
              const severity = feature.properties?.severity;
              const event = feature.properties?.event ?? "Unknown";

              if (severity === "Extreme") {
                state = "black";
                hazards.push(`EXTREME: ${event}`);
              } else if (severity === "Severe" && state !== "black") {
                state = "red";
                hazards.push(`SEVERE: ${event}`);
              } else if (severity === "Moderate" && state !== "black" && state !== "red") {
                state = "yellow";
                hazards.push(`MODERATE: ${event}`);
              }
            }
          }
        } catch (nwsErr) {
          console.error(`NWS alerts error for land ${land.id}:`, nwsErr);
        }

        // Check AirNow AQI
        try {
          const airnowKey = Deno.env.get("AIRNOW_API_KEY");
          if (airnowKey) {
            const aqiRes = await fetch(
              `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${land.latitude}&longitude=${land.longitude}&distance=25&API_KEY=${airnowKey}`
            );

            if (aqiRes.ok) {
              const aqiData = await aqiRes.json();
              const maxAqi = Math.max(
                0,
                ...aqiData.map((d: Record<string, unknown>) => (d.AQI as number) ?? 0)
              );

              if (maxAqi > 300 && state !== "black") {
                state = "black";
                hazards.push(`AQI HAZARDOUS: ${maxAqi}`);
              } else if (maxAqi > 200 && state !== "black") {
                state = "red";
                hazards.push(`AQI VERY UNHEALTHY: ${maxAqi}`);
              } else if (maxAqi > 150 && state !== "black" && state !== "red") {
                state = "yellow";
                hazards.push(`AQI UNHEALTHY: ${maxAqi}`);
              }
            }
          }
        } catch (aqiErr) {
          console.error(`AirNow error for land ${land.id}:`, aqiErr);
        }

        // Update operational state
        await serviceClient.from("operational_states").upsert({
          user_id: land.user_id,
          land_id: land.id,
          state,
          hazards,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,land_id" });

        // Send notification if state is red or black
        if (state === "red" || state === "black") {
          await serviceClient.from("notifications").insert({
            user_id: land.user_id,
            type: "hazard_alert",
            title: state === "black" ? "Extreme Hazard Alert" : "Hazard Warning",
            body: `Active hazards for ${land.name ?? "your garden"}: ${hazards.join("; ")}`,
            metadata: { land_id: land.id, state, hazards },
          });
        }

        results.push({ user_id: land.user_id, state });
      } catch (landErr) {
        console.error(`Hazard check error for land ${land.id}:`, landErr);
      }
    }

    return new Response(
      JSON.stringify({ checked: lands?.length ?? 0, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("hazard-engine error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
