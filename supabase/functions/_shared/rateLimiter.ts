import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function checkRateLimit(
  key: string,
  windowSeconds: number,
  maxRequests: number
): Promise<boolean> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_window_seconds: windowSeconds,
    p_max_requests: maxRequests,
  });
  return data as boolean;
}

export function rateLimitedResponse(corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
