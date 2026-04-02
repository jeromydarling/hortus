-- =============================================================================
-- Error capture table for production resilience
-- Ported from thecros system_error_events pattern
-- =============================================================================

CREATE TABLE public.system_error_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid, -- reserved for multi-tenant future
  error_type text CHECK (error_type IN ('render_crash', 'unhandled_rejection', 'window_error', 'edge_function_error')),
  message text,
  stack text,
  component text,
  route text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.system_error_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert errors (including anonymous/demo users)
CREATE POLICY error_events_insert ON public.system_error_events
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY error_events_anon_insert ON public.system_error_events
  FOR INSERT TO anon WITH CHECK (true);

-- Only admins can read error logs
CREATE POLICY error_events_admin_select ON public.system_error_events
  FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- Index for admin queries
CREATE INDEX idx_error_events_created ON public.system_error_events (created_at DESC);
CREATE INDEX idx_error_events_route ON public.system_error_events (route);
