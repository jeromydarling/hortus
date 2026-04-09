-- =============================================================================
-- Field Agent & Coordinator Features
-- WhatsApp integration, visit tracking, coordinator management
-- =============================================================================

-- Coordinator assignments: which gardens a coordinator manages
CREATE TABLE public.coordinator_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(coordinator_id, community_id)
);
ALTER TABLE public.coordinator_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY coordinator_assignments_select ON public.coordinator_assignments
  FOR SELECT TO authenticated USING (coordinator_id = auth.uid() OR public.is_admin_user(auth.uid()));
CREATE POLICY coordinator_assignments_insert ON public.coordinator_assignments
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY coordinator_assignments_update ON public.coordinator_assignments
  FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid()));

-- Field visits: GPS-verified visit tracking
CREATE TABLE public.field_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id uuid REFERENCES public.communities(id),
  land_id uuid REFERENCES public.lands(id),
  start_lat numeric,
  start_lon numeric,
  end_lat numeric,
  end_lon numeric,
  gps_accuracy_meters numeric,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  duration_minutes numeric,
  notes text,
  issues_flagged jsonb DEFAULT '[]',
  photos jsonb DEFAULT '[]',
  scouting_data jsonb,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  synced_from_offline boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.field_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY field_visits_select ON public.field_visits
  FOR SELECT TO authenticated USING (visitor_id = auth.uid() OR public.is_admin_user(auth.uid()));
CREATE POLICY field_visits_insert ON public.field_visits
  FOR INSERT TO authenticated WITH CHECK (visitor_id = auth.uid());
CREATE POLICY field_visits_update ON public.field_visits
  FOR UPDATE TO authenticated USING (visitor_id = auth.uid());

-- WhatsApp message log: tracks all NRI<->WhatsApp interactions
CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  phone_number text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type text CHECK (message_type IN ('text', 'image', 'voice', 'location', 'template')),
  content text,
  media_url text,
  whatsapp_message_id text,
  nri_context jsonb,
  nri_response text,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY whatsapp_messages_select ON public.whatsapp_messages
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin_user(auth.uid()));
-- Edge Functions (service role) handle insert/update

-- Morning briefings: daily NRI push messages
CREATE TABLE public.morning_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  land_id uuid REFERENCES public.lands(id),
  content text NOT NULL,
  nudges jsonb DEFAULT '[]',
  weather_summary text,
  phase_note text,
  delivered_via text CHECK (delivered_via IN ('push', 'whatsapp', 'sms', 'in_app')),
  delivered_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.morning_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY morning_briefings_select ON public.morning_briefings
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Photo analysis results
CREATE TABLE public.photo_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  observation_id uuid REFERENCES public.observations(id),
  land_id uuid REFERENCES public.lands(id),
  plot_id uuid REFERENCES public.plots(id),
  image_url text,
  plant_identification jsonb,
  disease_detection jsonb,
  crop_stage text,
  estimated_health text CHECK (estimated_health IN ('healthy', 'caution', 'concern')),
  tags jsonb DEFAULT '[]',
  nri_summary text,
  confidence numeric CHECK (confidence BETWEEN 0 AND 1),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.photo_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY photo_analyses_select ON public.photo_analyses
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY photo_analyses_insert ON public.photo_analyses
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_coordinator_assignments_user ON public.coordinator_assignments (coordinator_id) WHERE is_active = true;
CREATE INDEX idx_field_visits_visitor ON public.field_visits (visitor_id);
CREATE INDEX idx_field_visits_community ON public.field_visits (community_id);
CREATE INDEX idx_whatsapp_messages_phone ON public.whatsapp_messages (phone_number);
CREATE INDEX idx_morning_briefings_user ON public.morning_briefings (user_id);
CREATE INDEX idx_photo_analyses_observation ON public.photo_analyses (observation_id);
