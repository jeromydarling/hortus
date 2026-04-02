// create-checkout: Creates a Stripe Checkout session.
// Takes tier (solo/community) and interval (monthly/annual).
// Returns the checkout URL for client-side redirect.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13?target=deno";
import { corsHeaders } from "../_shared/cors.ts";

const PRICE_IDS: Record<string, Record<string, string>> = {
  solo: {
    monthly: Deno.env.get("STRIPE_PRICE_SOLO_MONTHLY") ?? "",
    annual: Deno.env.get("STRIPE_PRICE_SOLO_ANNUAL") ?? "",
  },
  community: {
    monthly: Deno.env.get("STRIPE_PRICE_COMMUNITY_MONTHLY") ?? "",
    annual: Deno.env.get("STRIPE_PRICE_COMMUNITY_ANNUAL") ?? "",
  },
};

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
    const { tier, interval } = body;

    // Validate inputs
    if (!tier || !["solo", "community"].includes(tier)) {
      return new Response(
        JSON.stringify({ error: "tier must be 'solo' or 'community'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!interval || !["monthly", "annual"].includes(interval)) {
      return new Response(
        JSON.stringify({ error: "interval must be 'monthly' or 'annual'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const priceId = PRICE_IDS[tier][interval];
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Price not configured for this tier/interval" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    // Look up or create Stripe customer
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await serviceClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await serviceClient
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${Deno.env.get("APP_URL")}/settings?checkout=success`,
      cancel_url: `${Deno.env.get("APP_URL")}/settings?checkout=cancelled`,
      subscription_data: {
        metadata: { supabase_user_id: user.id, tier },
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-checkout error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
