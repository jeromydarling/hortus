-- =============================================================================
-- Hortus Initial Schema Migration
-- =============================================================================
-- Strategy: Create ALL tables with RLS enabled first, then helper functions,
-- then all RLS policies. This avoids circular dependency issues.
-- =============================================================================

-- ===================== TABLES =====================

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  garden_mode text DEFAULT 'solo' CHECK (garden_mode IN ('solo', 'community')),
  language_mode text DEFAULT 'plain' CHECK (language_mode IN ('plain','gardener','source')),
  notification_preferences jsonb DEFAULT '{}',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free','solo','community')),
  subscription_status text DEFAULT 'inactive',
  trial_ends_at timestamptz,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- rate_limit_counters
CREATE TABLE public.rate_limit_counters (
  key text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer DEFAULT 1,
  PRIMARY KEY (key, window_start)
);
ALTER TABLE public.rate_limit_counters ENABLE ROW LEVEL SECURITY;

-- communities
CREATE TABLE public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  admin_user_id uuid NOT NULL REFERENCES auth.users(id),
  member_count integer DEFAULT 0,
  philosophy text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- community_members
CREATE TABLE public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('member','steward','coordinator','mentor','admin')),
  is_active boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- lands
CREATE TABLE public.lands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address text NOT NULL,
  display_name text,
  zip text,
  hardiness_zone text,
  parcel_geometry jsonb,
  soil_profile jsonb,
  frost_dates jsonb,
  sun_exposure jsonb,
  current_phase jsonb,
  phase_history jsonb DEFAULT '[]',
  philosophy text,
  language_mode text DEFAULT 'plain',
  sourcing_preference jsonb,
  nws jsonb,
  community_garden_id uuid REFERENCES public.communities(id),
  parcel_skipped boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.lands ENABLE ROW LEVEL SECURITY;

-- plots
CREATE TABLE public.plots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  land_id uuid NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  geometry jsonb,
  type text CHECK (type IN ('raised','inGround','container','wildPatch')),
  dimensions jsonb,
  soil_override jsonb,
  sun_hours numeric,
  steward_id uuid,
  crops jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

-- observations
CREATE TABLE public.observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  land_id uuid NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plot_id uuid REFERENCES public.plots(id),
  type text CHECK (type IN ('note','voice','photo','video','scan')),
  content text,
  media_url text,
  tags jsonb DEFAULT '[]',
  phenology_flag boolean DEFAULT false,
  phenology_event text,
  phase_at_time text,
  weather_snapshot jsonb,
  observation_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;

-- harvest_logs
CREATE TABLE public.harvest_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  land_id uuid NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plot_id uuid REFERENCES public.plots(id),
  crop_name text NOT NULL,
  variety text,
  harvest_date date,
  weight_lbs numeric,
  destination text CHECK (destination IN ('household','donated','shared','composted','sold')),
  notes text,
  phase_at_time text,
  quality_rating integer CHECK (quality_rating BETWEEN 1 AND 5),
  seed_saved boolean DEFAULT false,
  seed_packet_id uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.harvest_logs ENABLE ROW LEVEL SECURITY;

-- seed_library
CREATE TABLE public.seed_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  land_id uuid NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  variety text,
  source_type text CHECK (source_type IN ('self-saved','seedsNow','local','gifted','exchanged')),
  seeds_now_url text,
  year_harvested integer,
  estimated_germ_rate numeric CHECK (estimated_germ_rate BETWEEN 0 AND 1),
  quantity_estimate text,
  storage_notes text,
  processing_method text CHECK (processing_method IN ('dry-ferment','dry','wet','none')),
  shared_with_community boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.seed_library ENABLE ROW LEVEL SECURITY;

-- plans
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  land_id uuid NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  philosophy text,
  crop_pattern_id text,
  plot_ids jsonb DEFAULT '[]',
  seed_list jsonb DEFAULT '[]',
  materials_list jsonb DEFAULT '[]',
  succession_schedule jsonb DEFAULT '[]',
  status text DEFAULT 'planning' CHECK (status IN ('planning','active','complete')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- persons (community member profiles)
CREATE TABLE public.persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  display_name text NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('member','steward','coordinator','mentor','admin')),
  plot_id uuid REFERENCES public.plots(id),
  joined_at date,
  last_active_at timestamptz,
  volunteer_hours_ytd numeric DEFAULT 0,
  engagement_score numeric DEFAULT 0 CHECK (engagement_score BETWEEN 0 AND 1),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;

-- nri_signals
CREATE TABLE public.nri_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  type text CHECK (type IN ('checkin','overwhelm','mentor_candidate','ready_for_more','strong_engagement')),
  severity text CHECK (severity IN ('info','caution','alert')),
  reason text,
  detected_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by text CHECK (resolved_by IN ('auto','admin','self')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.nri_signals ENABLE ROW LEVEL SECURITY;

-- workdays
CREATE TABLE public.workdays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  start_time text,
  end_time text,
  focus text,
  roles jsonb DEFAULT '[]',
  nri_weather_flag boolean DEFAULT false,
  nri_weather_note text,
  volunteer_hours_logged numeric DEFAULT 0,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','postponed')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.workdays ENABLE ROW LEVEL SECURITY;

-- workday_rsvps
CREATE TABLE public.workday_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workday_id uuid NOT NULL REFERENCES public.workdays(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  status text DEFAULT 'attending' CHECK (status IN ('attending','maybe','declined')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(workday_id, person_id)
);
ALTER TABLE public.workday_rsvps ENABLE ROW LEVEL SECURITY;

-- sharing_posts
CREATE TABLE public.sharing_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.persons(id),
  type text CHECK (type IN ('surplus','request','announcement')),
  item text NOT NULL,
  description text,
  quantity text,
  status text DEFAULT 'available' CHECK (status IN ('available','claimed','fulfilled','expired')),
  claimed_by_person_id uuid REFERENCES public.persons(id),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.sharing_posts ENABLE ROW LEVEL SECURITY;

-- message_threads
CREATE TABLE public.message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  tag text,
  title text,
  is_direct boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

-- messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.persons(id),
  content text NOT NULL,
  is_direct boolean DEFAULT false,
  recipient_id uuid REFERENCES public.persons(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- volunteer_hour_logs
CREATE TABLE public.volunteer_hour_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  workday_id uuid REFERENCES public.workdays(id),
  activity_type text CHECK (activity_type IN ('workday','general_tending','training','coordination','other')),
  hours numeric NOT NULL,
  notes text,
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.volunteer_hour_logs ENABLE ROW LEVEL SECURITY;

-- nri_chat_messages
CREATE TABLE public.nri_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  land_id uuid REFERENCES public.lands(id),
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  context_snapshot jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.nri_chat_messages ENABLE ROW LEVEL SECURITY;

-- admin_content_drafts
CREATE TABLE public.admin_content_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text CHECK (type IN ('seo_post','philosophy_summary','nri_review')),
  title text NOT NULL,
  body text,
  source_url text,
  source_philosophy text,
  seo_keyword text,
  seo_score integer CHECK (seo_score BETWEEN 0 AND 100),
  phase_context text,
  status text DEFAULT 'draft' CHECK (status IN ('draft','approved','published','rejected')),
  generated_by text CHECK (generated_by IN ('gemini-flash','perplexity','manual')),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admin_content_drafts ENABLE ROW LEVEL SECURITY;

-- affiliate_events
CREATE TABLE public.affiliate_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text CHECK (type IN ('click','conversion')),
  crop_name text,
  seeds_now_url text,
  user_id text,
  order_value numeric,
  estimated_commission numeric,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.affiliate_events ENABLE ROW LEVEL SECURITY;


-- ===================== HELPER FUNCTIONS =====================
-- Created after all tables exist so references resolve correctly.

CREATE OR REPLACE FUNCTION public.is_community_member(p_community_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = p_community_id AND user_id = p_user_id AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_community_role(p_community_id uuid, p_user_id uuid)
RETURNS text AS $$
  SELECT role FROM public.community_members
  WHERE community_id = p_community_id AND user_id = p_user_id AND is_active = true LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin_user(p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;


-- ===================== TRIGGER FUNCTIONS =====================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text, p_window_seconds integer, p_max_requests integer
) RETURNS boolean AS $$
DECLARE
  v_window timestamptz := date_trunc('minute', now()) -
    (EXTRACT(EPOCH FROM now())::integer % p_window_seconds || ' seconds')::interval;
  v_count integer;
BEGIN
  INSERT INTO public.rate_limit_counters (key, window_start, count)
  VALUES (p_key, v_window, 1)
  ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limit_counters.count + 1
  RETURNING count INTO v_count;
  RETURN v_count <= p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ===================== RLS POLICIES =====================

-- profiles: own profile only
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY profiles_delete ON public.profiles FOR DELETE TO authenticated
  USING (id = auth.uid());

-- lands: owner access
CREATE POLICY lands_select ON public.lands FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY lands_insert ON public.lands FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY lands_update ON public.lands FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY lands_delete ON public.lands FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- plots: owner access
CREATE POLICY plots_select ON public.plots FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY plots_insert ON public.plots FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY plots_update ON public.plots FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY plots_delete ON public.plots FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- observations: owner access
CREATE POLICY observations_select ON public.observations FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY observations_insert ON public.observations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY observations_update ON public.observations FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY observations_delete ON public.observations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- harvest_logs: owner access
CREATE POLICY harvest_logs_select ON public.harvest_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY harvest_logs_insert ON public.harvest_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY harvest_logs_update ON public.harvest_logs FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY harvest_logs_delete ON public.harvest_logs FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- seed_library: owner access
CREATE POLICY seed_library_select ON public.seed_library FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY seed_library_insert ON public.seed_library FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY seed_library_update ON public.seed_library FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY seed_library_delete ON public.seed_library FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- plans: owner access
CREATE POLICY plans_select ON public.plans FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY plans_insert ON public.plans FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY plans_update ON public.plans FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY plans_delete ON public.plans FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- communities: members can view, admin/coordinator can manage
CREATE POLICY communities_select ON public.communities FOR SELECT TO authenticated
  USING (
    public.is_community_member(id, auth.uid())
    OR admin_user_id = auth.uid()
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY communities_insert ON public.communities FOR INSERT TO authenticated
  WITH CHECK (admin_user_id = auth.uid() OR public.is_admin_user(auth.uid()));
CREATE POLICY communities_update ON public.communities FOR UPDATE TO authenticated
  USING (
    admin_user_id = auth.uid()
    OR public.get_user_community_role(id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  )
  WITH CHECK (
    admin_user_id = auth.uid()
    OR public.get_user_community_role(id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY communities_delete ON public.communities FOR DELETE TO authenticated
  USING (admin_user_id = auth.uid() OR public.is_admin_user(auth.uid()));

-- community_members: members can view own community, coordinators/admins can manage
CREATE POLICY community_members_select ON public.community_members FOR SELECT TO authenticated
  USING (public.is_community_member(community_id, auth.uid()));
CREATE POLICY community_members_insert ON public.community_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY community_members_update ON public.community_members FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY community_members_delete ON public.community_members FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );

-- persons: community members can view, coordinators can manage
CREATE POLICY persons_select ON public.persons FOR SELECT TO authenticated
  USING (public.is_community_member(community_id, auth.uid()));
CREATE POLICY persons_insert ON public.persons FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR (user_id = auth.uid() AND public.is_community_member(community_id, auth.uid()))
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY persons_update ON public.persons FOR UPDATE TO authenticated
  USING (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR user_id = auth.uid()
    OR public.is_admin_user(auth.uid())
  )
  WITH CHECK (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR user_id = auth.uid()
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY persons_delete ON public.persons FOR DELETE TO authenticated
  USING (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );

-- nri_signals: community members can view, coordinators can manage
CREATE POLICY nri_signals_select ON public.nri_signals FOR SELECT TO authenticated
  USING (public.is_community_member(community_id, auth.uid()));
CREATE POLICY nri_signals_insert ON public.nri_signals FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY nri_signals_update ON public.nri_signals FOR UPDATE TO authenticated
  USING (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  )
  WITH CHECK (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY nri_signals_delete ON public.nri_signals FOR DELETE TO authenticated
  USING (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );

-- workdays: community members can view, coordinators can manage
CREATE POLICY workdays_select ON public.workdays FOR SELECT TO authenticated
  USING (public.is_community_member(community_id, auth.uid()));
CREATE POLICY workdays_insert ON public.workdays FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY workdays_update ON public.workdays FOR UPDATE TO authenticated
  USING (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  )
  WITH CHECK (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY workdays_delete ON public.workdays FOR DELETE TO authenticated
  USING (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );

-- workday_rsvps: own RSVP or community coordinator
CREATE POLICY workday_rsvps_select ON public.workday_rsvps FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_user_community_role(
      (SELECT community_id FROM public.workdays WHERE id = workday_id),
      auth.uid()
    ) IN ('coordinator', 'admin')
  );
CREATE POLICY workday_rsvps_insert ON public.workday_rsvps FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY workday_rsvps_update ON public.workday_rsvps FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_user_community_role(
      (SELECT community_id FROM public.workdays WHERE id = workday_id),
      auth.uid()
    ) IN ('coordinator', 'admin')
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.get_user_community_role(
      (SELECT community_id FROM public.workdays WHERE id = workday_id),
      auth.uid()
    ) IN ('coordinator', 'admin')
  );
CREATE POLICY workday_rsvps_delete ON public.workday_rsvps FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_user_community_role(
      (SELECT community_id FROM public.workdays WHERE id = workday_id),
      auth.uid()
    ) IN ('coordinator', 'admin')
  );

-- sharing_posts: community members can view, author or coordinator can manage
CREATE POLICY sharing_posts_select ON public.sharing_posts FOR SELECT TO authenticated
  USING (public.is_community_member(community_id, auth.uid()));
CREATE POLICY sharing_posts_insert ON public.sharing_posts FOR INSERT TO authenticated
  WITH CHECK (public.is_community_member(community_id, auth.uid()));
CREATE POLICY sharing_posts_update ON public.sharing_posts FOR UPDATE TO authenticated
  USING (
    author_id IN (SELECT id FROM public.persons WHERE user_id = auth.uid())
    OR public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  )
  WITH CHECK (
    author_id IN (SELECT id FROM public.persons WHERE user_id = auth.uid())
    OR public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY sharing_posts_delete ON public.sharing_posts FOR DELETE TO authenticated
  USING (
    author_id IN (SELECT id FROM public.persons WHERE user_id = auth.uid())
    OR public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );

-- message_threads: community members can view
CREATE POLICY message_threads_select ON public.message_threads FOR SELECT TO authenticated
  USING (public.is_community_member(community_id, auth.uid()));
CREATE POLICY message_threads_insert ON public.message_threads FOR INSERT TO authenticated
  WITH CHECK (public.is_community_member(community_id, auth.uid()));
CREATE POLICY message_threads_update ON public.message_threads FOR UPDATE TO authenticated
  USING (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  )
  WITH CHECK (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY message_threads_delete ON public.message_threads FOR DELETE TO authenticated
  USING (
    public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );

-- messages: community members can view non-direct, author or recipient for direct
CREATE POLICY messages_select ON public.messages FOR SELECT TO authenticated
  USING (
    (is_direct = false AND public.is_community_member(community_id, auth.uid()))
    OR (is_direct = true AND (
      author_id IN (SELECT id FROM public.persons WHERE user_id = auth.uid())
      OR recipient_id IN (SELECT id FROM public.persons WHERE user_id = auth.uid())
    ))
  );
CREATE POLICY messages_insert ON public.messages FOR INSERT TO authenticated
  WITH CHECK (public.is_community_member(community_id, auth.uid()));
CREATE POLICY messages_update ON public.messages FOR UPDATE TO authenticated
  USING (author_id IN (SELECT id FROM public.persons WHERE user_id = auth.uid()));
CREATE POLICY messages_delete ON public.messages FOR DELETE TO authenticated
  USING (
    author_id IN (SELECT id FROM public.persons WHERE user_id = auth.uid())
    OR public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );

-- volunteer_hour_logs: own logs or community coordinator
CREATE POLICY volunteer_hour_logs_select ON public.volunteer_hour_logs FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY volunteer_hour_logs_insert ON public.volunteer_hour_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY volunteer_hour_logs_update ON public.volunteer_hour_logs FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );
CREATE POLICY volunteer_hour_logs_delete ON public.volunteer_hour_logs FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.get_user_community_role(community_id, auth.uid()) IN ('coordinator', 'admin')
    OR public.is_admin_user(auth.uid())
  );

-- nri_chat_messages: owner access
CREATE POLICY nri_chat_messages_select ON public.nri_chat_messages FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY nri_chat_messages_insert ON public.nri_chat_messages FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY nri_chat_messages_update ON public.nri_chat_messages FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY nri_chat_messages_delete ON public.nri_chat_messages FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- admin_content_drafts: admin only
CREATE POLICY admin_content_drafts_select ON public.admin_content_drafts FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));
CREATE POLICY admin_content_drafts_insert ON public.admin_content_drafts FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY admin_content_drafts_update ON public.admin_content_drafts FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY admin_content_drafts_delete ON public.admin_content_drafts FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- affiliate_events: admin only for SELECT; authenticated for INSERT
CREATE POLICY affiliate_events_select ON public.affiliate_events FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));
CREATE POLICY affiliate_events_insert ON public.affiliate_events FOR INSERT TO authenticated
  WITH CHECK (true);
