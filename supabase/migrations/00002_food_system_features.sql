-- =============================================================================
-- Hortus Feature Expansion Migration
-- Local Food System Map, Food Resilience, Seed Exchange, Composting,
-- Economic Impact, Yield Tracking
-- =============================================================================

-- ===================== NEW TABLES =====================

-- food_system_points: Farmers markets, CSAs, seed libraries, community gardens
-- discovered via Perplexity or manually added
CREATE TABLE public.food_system_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN (
    'farmers_market', 'csa', 'seed_library', 'community_garden',
    'food_bank', 'nursery', 'garden_center', 'food_co_op',
    'urban_farm', 'food_forest', 'compost_site'
  )),
  name text NOT NULL,
  address text,
  zip text,
  lat numeric,
  lon numeric,
  description text,
  website text,
  seasonal_hours text,
  source text DEFAULT 'perplexity' CHECK (source IN ('perplexity', 'manual', 'usda', 'ams')),
  verified boolean DEFAULT false,
  last_verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.food_system_points ENABLE ROW LEVEL SECURITY;

-- Public read, admin write
CREATE POLICY food_system_points_select ON public.food_system_points
  FOR SELECT TO authenticated USING (true);
CREATE POLICY food_system_points_anon_select ON public.food_system_points
  FOR SELECT TO anon USING (true);
CREATE POLICY food_system_points_admin_insert ON public.food_system_points
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY food_system_points_admin_update ON public.food_system_points
  FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid()));
CREATE POLICY food_system_points_admin_delete ON public.food_system_points
  FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- user_map_pins: Anonymous aggregated user presence by zip code
-- Never stores exact addresses — only zip-level for the public map
CREATE TABLE public.user_map_pins (
  zip text PRIMARY KEY,
  user_count integer DEFAULT 1,
  lat numeric,
  lon numeric,
  state_code text,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_map_pins ENABLE ROW LEVEL SECURITY;

-- Public read (it's anonymous aggregate data)
CREATE POLICY user_map_pins_select ON public.user_map_pins
  FOR SELECT TO authenticated USING (true);
CREATE POLICY user_map_pins_anon_select ON public.user_map_pins
  FOR SELECT TO anon USING (true);
-- Only Edge Functions (service role) write to this table

-- seed_exchanges: Community seed sharing board
CREATE TABLE public.seed_exchanges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id uuid REFERENCES public.communities(id),
  type text NOT NULL CHECK (type IN ('offer', 'request', 'swap')),
  crop_name text NOT NULL,
  variety text,
  seed_type text CHECK (seed_type IN ('heirloom', 'open_pollinated', 'hybrid', 'unknown')),
  year_harvested integer,
  quantity_estimate text,
  germination_notes text,
  growing_zone text,
  seasons_grown integer,
  description text,
  status text DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'fulfilled', 'expired')),
  claimed_by uuid REFERENCES auth.users(id),
  zip text,
  willing_to_ship boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.seed_exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY seed_exchanges_select ON public.seed_exchanges
  FOR SELECT TO authenticated USING (true);
CREATE POLICY seed_exchanges_insert ON public.seed_exchanges
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY seed_exchanges_update ON public.seed_exchanges
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR claimed_by = auth.uid());
CREATE POLICY seed_exchanges_delete ON public.seed_exchanges
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- compost_logs: Compost pile/bin tracking
CREATE TABLE public.compost_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  land_id uuid NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text DEFAULT 'Compost pile',
  type text CHECK (type IN ('pile', 'bin', 'tumbler', 'worm_bin', 'bokashi', 'community')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'curing', 'ready', 'applied', 'archived')),
  started_at date,
  estimated_ready_at date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.compost_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY compost_logs_select ON public.compost_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY compost_logs_insert ON public.compost_logs
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY compost_logs_update ON public.compost_logs
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY compost_logs_delete ON public.compost_logs
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- compost_entries: Individual additions to a compost pile
CREATE TABLE public.compost_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compost_id uuid NOT NULL REFERENCES public.compost_logs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type text CHECK (entry_type IN ('green', 'brown', 'temperature', 'turn', 'moisture', 'note')),
  material text,
  volume_gallons numeric,
  temperature_f numeric,
  moisture_level text CHECK (moisture_level IN ('dry', 'damp', 'wet', 'soggy')),
  notes text,
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.compost_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY compost_entries_select ON public.compost_entries
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY compost_entries_insert ON public.compost_entries
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY compost_entries_update ON public.compost_entries
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY compost_entries_delete ON public.compost_entries
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- food_resilience_snapshots: Periodic computed resilience scores
CREATE TABLE public.food_resilience_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  land_id uuid REFERENCES public.lands(id) ON DELETE CASCADE,
  community_id uuid REFERENCES public.communities(id),
  scope text NOT NULL CHECK (scope IN ('household', 'community', 'zip')),
  zip text,
  score numeric CHECK (score BETWEEN 0 AND 100),
  metrics jsonb NOT NULL DEFAULT '{}',
  -- metrics: { lbs_produced, sqft_cultivated, varieties_grown, days_of_food,
  --   grocery_value_saved, seed_varieties_saved, compost_produced_gallons,
  --   local_spend_pct, crops_shared }
  season text,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.food_resilience_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY resilience_select ON public.food_resilience_snapshots
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR scope = 'zip');
CREATE POLICY resilience_anon_select ON public.food_resilience_snapshots
  FOR SELECT TO anon USING (scope = 'zip');
CREATE POLICY resilience_insert ON public.food_resilience_snapshots
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ===================== INDEXES =====================

CREATE INDEX idx_food_system_points_zip ON public.food_system_points (zip);
CREATE INDEX idx_food_system_points_type ON public.food_system_points (type);
CREATE INDEX idx_food_system_points_coords ON public.food_system_points (lat, lon);
CREATE INDEX idx_seed_exchanges_status ON public.seed_exchanges (status) WHERE status = 'available';
CREATE INDEX idx_seed_exchanges_zip ON public.seed_exchanges (zip);
CREATE INDEX idx_compost_logs_user ON public.compost_logs (user_id);
CREATE INDEX idx_compost_entries_compost ON public.compost_entries (compost_id);
CREATE INDEX idx_resilience_zip ON public.food_resilience_snapshots (zip) WHERE scope = 'zip';

-- ===================== FUNCTIONS =====================

-- Increment user count for a zip code (called from Edge Function on signup/land creation)
CREATE OR REPLACE FUNCTION public.upsert_user_map_pin(
  p_zip text, p_lat numeric, p_lon numeric, p_state_code text
) RETURNS void AS $$
BEGIN
  INSERT INTO public.user_map_pins (zip, user_count, lat, lon, state_code, updated_at)
  VALUES (p_zip, 1, p_lat, p_lon, p_state_code, now())
  ON CONFLICT (zip) DO UPDATE SET
    user_count = user_map_pins.user_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
