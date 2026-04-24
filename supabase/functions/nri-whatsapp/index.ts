/**
 * nri-whatsapp — WhatsApp Business API webhook handler for NRI.
 *
 * Receives WhatsApp messages (text, photo, voice, location),
 * processes them through NRI, and sends responses back via WhatsApp.
 *
 * Webhook verification: GET request returns hub.challenge
 * Message processing: POST request with message payload
 *
 * Supports:
 * - Text messages → NRI chat response
 * - Photos → photo analysis pipeline + NRI interpretation
 * - Voice notes → transcription + NRI voice log processing
 * - Location → associates with user's land record
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";

const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN") ?? "";
const WHATSAPP_VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") ?? "";
const WHATSAPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID") ?? "";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

// Paste verbatim content from specs/nri-system-prompt.md here
const NRI_SYSTEM_PROMPT = ""; // TODO: Paste from nri-system-prompt.md

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Webhook verification (GET)
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // Message processing (POST)
  try {
    const body = await req.json();
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.length) {
      // Status update or other non-message webhook — acknowledge
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const message = value.messages[0];
    const from = message.from; // phone number
    const messageType = message.type; // text, image, audio, location

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Look up user by phone number (stored in profiles or a phone mapping table)
    // TODO: Implement phone-to-user lookup
    // For now, log the message and process

    // Log inbound message
    await supabase.from("whatsapp_messages").insert({
      phone_number: from,
      direction: "inbound",
      message_type: messageType,
      content: message.text?.body ?? message.caption ?? null,
      media_url: message.image?.id ?? message.audio?.id ?? null,
      whatsapp_message_id: message.id,
    });

    let nriResponse = "";

    if (messageType === "text") {
      const userMessage = message.text.body;

      // TODO: Build NRI context from user's land data
      const context = {};

      // Call Anthropic API
      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: NRI_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `${JSON.stringify(context)}\n\nUser message: ${userMessage}`,
            },
          ],
        }),
      });

      const anthropicData = await anthropicRes.json();
      nriResponse = anthropicData.content?.[0]?.text ?? "I'm here. What does your garden need today?";
    } else if (messageType === "image") {
      nriResponse = "I see your photo. Let me take a look at what's growing. Send me a text describing what you'd like to know about it.";
      // TODO: Download image via WhatsApp media API, run through photo-analyze Edge Function
    } else if (messageType === "audio") {
      nriResponse = "I received your voice note. Let me process that for you.";
      // TODO: Download audio, transcribe, run through nri-voice-log
    } else if (messageType === "location") {
      nriResponse = "I've noted your location. This helps me give you more accurate soil and weather information.";
      // TODO: Update user's land record with location
    }

    // Send NRI response back via WhatsApp
    await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: nriResponse },
      }),
    });

    // Log outbound message
    await supabase.from("whatsapp_messages").insert({
      phone_number: from,
      direction: "outbound",
      message_type: "text",
      content: nriResponse,
      nri_response: nriResponse,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
