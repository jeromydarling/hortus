import { supabase } from "@/integrations/supabase/client";

export async function checkAuthRateLimit(
  email: string,
  action: "login" | "signup" | "reset" = "login",
): Promise<boolean> {
  const key = `auth:${action}:${email.toLowerCase().trim()}`;

  const limits = {
    login: { window: 60, max: 5 },
    signup: { window: 600, max: 3 },
    reset: { window: 300, max: 3 },
  } as const;

  const { window, max } = limits[action];

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_window_seconds: window,
    p_max_requests: max,
  });

  if (error) return true; // fail open
  return data as boolean;
}
