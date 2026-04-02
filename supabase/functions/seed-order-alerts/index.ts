// seed-order-alerts: Checks plan seedList for unordered items with
// plant-by dates within 21 days. Sends notification reminders.
// Cron: daily at 6 AM.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const ALERT_WINDOW_DAYS = 21;

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

    // Fetch all active plans with seed lists
    const { data: plans, error: plansError } = await serviceClient
      .from("plans")
      .select("id, user_id, seed_list");

    if (plansError) {
      throw new Error(`Failed to fetch plans: ${plansError.message}`);
    }

    const now = new Date();
    const alertCutoff = new Date(now.getTime() + ALERT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const alertsSent: Array<{ user_id: string; seeds: string[] }> = [];

    for (const plan of plans ?? []) {
      try {
        const seedList = plan.seed_list;
        if (!Array.isArray(seedList) || seedList.length === 0) continue;

        // Find unordered seeds with plant-by dates within the alert window
        const urgentSeeds = seedList.filter((seed: Record<string, unknown>) => {
          if (seed.ordered) return false;
          const plantBy = seed.plant_by_date ? new Date(seed.plant_by_date as string) : null;
          if (!plantBy) return false;
          return plantBy <= alertCutoff && plantBy >= now;
        });

        if (urgentSeeds.length === 0) continue;

        const seedNames = urgentSeeds.map(
          (s: Record<string, unknown>) => s.name ?? s.variety ?? "Unknown seed"
        );

        // Check if we already sent an alert today for this user
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const { data: existingAlert } = await serviceClient
          .from("notifications")
          .select("id")
          .eq("user_id", plan.user_id)
          .eq("type", "seed_order_reminder")
          .gte("created_at", todayStart)
          .limit(1)
          .maybeSingle();

        if (existingAlert) continue; // Already alerted today

        // Send notification
        await serviceClient.from("notifications").insert({
          user_id: plan.user_id,
          type: "seed_order_reminder",
          title: "Time to Order Seeds",
          body: `${urgentSeeds.length} seed${urgentSeeds.length > 1 ? "s" : ""} need ordering soon: ${seedNames.join(", ")}. Plant-by dates are within ${ALERT_WINDOW_DAYS} days.`,
          metadata: {
            plan_id: plan.id,
            seeds: urgentSeeds,
          },
        });

        alertsSent.push({ user_id: plan.user_id, seeds: seedNames as string[] });
      } catch (planErr) {
        console.error(`Seed alert error for plan ${plan.id}:`, planErr);
      }
    }

    return new Response(
      JSON.stringify({
        checked: plans?.length ?? 0,
        alerts_sent: alertsSent.length,
        alerts: alertsSent,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("seed-order-alerts error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
