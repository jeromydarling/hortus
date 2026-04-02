// nri-chat: Handles user messages to the NRI (Natural Rhythm Intelligence).
// Builds context from DB (land, weather, observations, plan, phase),
// calls Anthropic API with the NRI system prompt, and stores the response.
// When body.demo === true, skips auth and uses provided context.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitedResponse } from "../_shared/rateLimiter.ts";

// Paste verbatim content from specs/nri-system-prompt.md as the system parameter
const NRI_SYSTEM_PROMPT = `TODO: Paste verbatim content from specs/nri-system-prompt.md`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const isDemo = body.demo === true;

    let userId: string;
    let context: Record<string, unknown>;

    if (isDemo) {
      // Demo mode: skip auth, use provided context
      userId = "demo";
      context = body.context ?? {};
    } else {
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
      userId = user.id;

      // Rate limit: 30 requests per hour per user
      const allowed = await checkRateLimit(`nri-chat:${userId}`, 3600, 30);
      if (!allowed) {
        return rateLimitedResponse(corsHeaders);
      }

      // Build context from DB
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const [landRes, weatherRes, obsRes, planRes, phaseRes] = await Promise.all([
        serviceClient.from("lands").select("*").eq("user_id", userId).maybeSingle(),
        serviceClient.from("weather_snapshots").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        serviceClient.from("observations").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
        serviceClient.from("plans").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        serviceClient.from("phase_detections").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

      context = {
        land: landRes.data,
        weather: weatherRes.data,
        observations: obsRes.data ?? [],
        plan: planRes.data,
        phase: phaseRes.data,
      };
    }

    // Call Anthropic API
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: NRI_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Context:\n${JSON.stringify(context, null, 2)}\n\nUser message: ${body.message}`,
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
    const assistantMessage = nriResponse.content?.[0]?.text ?? "";

    // Store conversation (skip for demo)
    if (!isDemo) {
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await serviceClient.from("nri_conversations").insert({
        user_id: userId,
        user_message: body.message,
        assistant_message: assistantMessage,
        context_snapshot: context,
      });
    }

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("nri-chat error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
