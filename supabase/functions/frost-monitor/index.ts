// frost-monitor: Checks NWS hourly forecast for frost risk.
// Cron: every 30 minutes. For each user with land, fetches the NWS
// hourly forecast and alerts if temperatures will drop below freezing.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const FROST_THRESHOLD_F = 32;

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

    // Fetch all lands with coordinates
    const { data: lands, error: landsError } = await serviceClient
      .from("lands")
      .select("id, user_id, latitude, longitude, name");

    if (landsError) {
      throw new Error(`Failed to fetch lands: ${landsError.message}`);
    }

    const alerts: Array<{ user_id: string; land_id: string; min_temp: number; frost_hours: number }> = [];

    for (const land of lands ?? []) {
      try {
        if (!land.latitude || !land.longitude) continue;

        // Fetch NWS grid point
        const pointsRes = await fetch(
          `https://api.weather.gov/points/${land.latitude},${land.longitude}`,
          { headers: { "User-Agent": "Hortus App (contact@hortus.app)" } }
        );

        if (!pointsRes.ok) {
          console.error(`NWS points failed for land ${land.id}:`, await pointsRes.text());
          continue;
        }

        const pointsData = await pointsRes.json();
        const forecastHourlyUrl = pointsData.properties?.forecastHourly;

        if (!forecastHourlyUrl) continue;

        // Fetch hourly forecast
        const forecastRes = await fetch(forecastHourlyUrl, {
          headers: { "User-Agent": "Hortus App (contact@hortus.app)" },
        });

        if (!forecastRes.ok) continue;

        const forecastData = await forecastRes.json();
        const periods = forecastData.properties?.periods ?? [];

        // Check next 48 hours for frost
        const next48h = periods.slice(0, 48);
        const frostPeriods = next48h.filter(
          (p: Record<string, unknown>) => (p.temperature as number) <= FROST_THRESHOLD_F
        );

        if (frostPeriods.length > 0) {
          const minTemp = Math.min(
            ...frostPeriods.map((p: Record<string, unknown>) => p.temperature as number)
          );

          alerts.push({
            user_id: land.user_id,
            land_id: land.id,
            min_temp: minTemp,
            frost_hours: frostPeriods.length,
          });

          // Insert notification
          await serviceClient.from("notifications").insert({
            user_id: land.user_id,
            type: "frost_warning",
            title: "Frost Warning",
            body: `Frost risk detected for ${land.name ?? "your garden"}. Low of ${minTemp}°F expected in the next 48 hours (${frostPeriods.length} hours below freezing).`,
            metadata: { land_id: land.id, min_temp: minTemp, frost_hours: frostPeriods.length },
          });
        }
      } catch (landErr) {
        console.error(`Frost check error for land ${land.id}:`, landErr);
      }
    }

    return new Response(
      JSON.stringify({ checked: lands?.length ?? 0, alerts_sent: alerts.length, alerts }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("frost-monitor error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
