// log-affiliate-click: Logs Seeds Now affiliate clicks to the
// affiliate_events table before redirecting the user to the affiliate URL.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { product_url, product_name, source } = body;

    if (!product_url || typeof product_url !== "string") {
      return new Response(
        JSON.stringify({ error: "product_url is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to authenticate (optional -- anonymous clicks are allowed)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      } catch {
        // Anonymous click -- proceed without user ID
      }
    }

    // Build affiliate URL with tracking parameters
    const affiliateTag = Deno.env.get("SEEDS_NOW_AFFILIATE_TAG") ?? "";
    const affiliateUrl = new URL(product_url);
    if (affiliateTag) {
      affiliateUrl.searchParams.set("ref", affiliateTag);
    }

    // Log the click event
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient.from("affiliate_events").insert({
      user_id: userId,
      partner: "seeds_now",
      product_url: product_url,
      product_name: product_name ?? null,
      affiliate_url: affiliateUrl.toString(),
      source: source ?? "unknown",
      clicked_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ redirect_url: affiliateUrl.toString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("log-affiliate-click error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
