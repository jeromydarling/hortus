/**
 * Global error capture — logs unhandled errors to Supabase.
 *
 * Ported from thecros initOperatorErrorCapture pattern.
 *
 * Call once at app startup. Captures:
 * - Unhandled promise rejections
 * - Window error events
 * Logs to system_error_events table with route context.
 */

import { supabase } from "@/integrations/supabase/client";

let initialized = false;

export function initErrorCapture(): void {
  if (initialized) return;
  initialized = true;

  window.addEventListener("unhandledrejection", (event) => {
    const message =
      event.reason instanceof Error
        ? event.reason.message
        : String(event.reason);

    void supabase
      .from("system_error_events")
      .insert({
        error_type: "unhandled_rejection",
        message: message.slice(0, 500),
        route: window.location.pathname,
        created_at: new Date().toISOString(),
      })
      .then(() => {});
  });

  window.addEventListener("error", (event) => {
    void supabase
      .from("system_error_events")
      .insert({
        error_type: "window_error",
        message: event.message?.slice(0, 500) ?? "Unknown error",
        stack: event.error?.stack?.slice(0, 2000),
        route: window.location.pathname,
        component: event.filename,
        created_at: new Date().toISOString(),
      })
      .then(() => {});
  });
}
