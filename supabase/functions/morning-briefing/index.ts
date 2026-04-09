/**
 * morning-briefing — Daily NRI morning briefing generator.
 *
 * Cron: Daily at 6:00 AM local time per user
 * For each active user, generates a personalized morning briefing:
 * - Current weather + hazard state
 * - Rule of Life focus for today
 * - Top NRI nudge (highest confidence)
 * - Frost countdown if relevant
 * - Harvest reminders
 *
 * Delivers via: push notification, WhatsApp (if connected), or in-app.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN") ?? "";
const WHATSAPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID") ?? "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get all active users with land records
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, display_name, notification_preferences")
      .not("id", "is", null);

    if (usersError || !users) {
      throw new Error(`Failed to fetch users: ${usersError?.message}`);
    }

    let generated = 0;
    let delivered = 0;

    for (const user of users) {
      // Get user's primary land
      const { data: land } = await supabase
        .from("lands")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!land) continue;

      // Build briefing context
      // TODO: Fetch real weather from NWS cached data
      const weatherSummary = "Check weather conditions for your area today.";
      const phaseNote = land.current_phase
        ? `You're in ${(land.current_phase as Record<string, unknown>).phaseId ?? "your current phase"}.`
        : "";

      // TODO: Compute real nudges from user's data
      // For now, generate a simple briefing via NRI
      const briefingPrompt = `Generate a brief (3-4 sentences) morning garden briefing for ${user.display_name ?? "gardener"} at ${land.display_name ?? "their garden"}, Zone ${land.hardiness_zone ?? "unknown"}. Current phase: ${(land.current_phase as Record<string, unknown>)?.phaseId ?? "unknown"}. Keep it warm, specific, and actionable. Start with "Verso l'alto."`;

      let briefingContent = "";

      try {
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 300,
            messages: [{ role: "user", content: briefingPrompt }],
          }),
        });

        const anthropicData = await anthropicRes.json();
        briefingContent = anthropicData.content?.[0]?.text ?? "Verso l'alto. Check on your garden today.";
      } catch {
        briefingContent = `Verso l'alto. Good morning at ${land.display_name ?? "the garden"}. ${phaseNote} ${weatherSummary}`;
      }

      // Store briefing
      const { data: briefing } = await supabase
        .from("morning_briefings")
        .insert({
          user_id: user.id,
          land_id: land.id,
          content: briefingContent,
          weather_summary: weatherSummary,
          phase_note: phaseNote,
          nudges: [],
          delivered_via: "in_app", // Default — upgrade to WhatsApp if connected
        })
        .select()
        .single();

      generated++;

      // TODO: Deliver via WhatsApp if user has connected their phone
      // TODO: Deliver via push notification if enabled
      // For now, briefings are stored for in-app display

      if (briefing) delivered++;
    }

    return new Response(
      JSON.stringify({ ok: true, generated, delivered }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
