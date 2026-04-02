# Hortus — Lovable Master Build Prompt
**Version 1.0 · Hand this to Lovable as the first message in a new project.**

---

Build a production-grade web application called **Hortus** — a place-aware gardening operating system centered on land, season, memory, and community stewardship.

Attach all five files to this prompt before sending:
- `hortus-app-prototype.html`
- `hortus-parcel-planner.html`
- `hortus-seed-pack-v2.json`
- `nri-system-prompt.md`
- `hortus-marketing.html`

## CRITICAL: USE THE FILES. DO NOT INVENT ANYTHING.

**`hortus-app-prototype.html` is the design source of truth.**
Every screen, component, layout, color, spacing, icon, label, navigation pattern, and interaction in this file is final. Do not redesign, simplify, reinterpret, or improve it. Extract the HTML structure and CSS from this file and convert it directly into React components. If a screen exists in the prototype, your React component must match it exactly — same layout, same visual hierarchy, same copy (moved to i18n keys), same icons, same spacing. Do not use placeholder layouts while "real" ones come later. Build it right the first time from the file.

**`hortus-seed-pack-v2.json` is the data and content source of truth.**
All phase names, philosophy names and descriptions, crop patterns, field dictionary labels, NRI prompt templates, entity schemas, and affiliate config come from this file. Do not invent field names, labels, or copy. When building components that display phases, philosophies, crops, or soil attributes — read the structure from this JSON and mirror it exactly in your data layer and UI.

**`nri-system-prompt.md` is the NRI instruction source of truth.**
The content between the code fences is pasted verbatim as the `system` parameter in every Anthropic API call that goes to NRI. Do not summarize it, shorten it, or paraphrase it. Do not write your own NRI prompt. Use the file exactly as written.

**`hortus-parcel-planner.html` is the parcel planner screen source of truth.**
This file contains four screens not present in the main prototype: the onboarding parcel step (Step 4 of 7), the Aerial View / bed placement screen, the Photo Refinement screen, and the AR Placement screen. Extract each into its corresponding React component exactly as designed. The dev bar in this file follows the same strip-in-production rule as the main prototype.
The `/` route renders this page. Extract it into a React component the same way as the app prototype — structure, copy, and design come from the file, not from your judgment about what a marketing page should look like.

If something is not in these files, ask before inventing it.

---

## HOW THE PROTOTYPE IS STRUCTURED — READ THIS BEFORE TOUCHING THE HTML

The prototype file contains three separate shells controlled by a `#dev-bar` at the top of the page. **The dev bar is a preview navigation tool only. It does not exist in the real app. Do not build it. Do not reference it.**

The three shells and what they map to in the real app:

**Shell 1 — `#app-shell`** (activated by "App (Returning User)" button)
The authenticated app. All screens under `/app/*`. This is the main product. Extract every screen from this shell into its own React page component at the route shown in the ROUTING section below.

**Shell 2 — `#onboarding`** (activated by "Onboarding (First Login)" button)
The 7-step onboarding flow (updated from 6 — the parcel map step is now Step 4). Maps to `/onboarding`. Steps 1–3 and 5–7 are in `hortus-app-prototype.html`. Step 4 (the parcel/aerial map step) is in `hortus-parcel-planner.html` as `#ob-parcel`. The step has a "Skip for now" link — skipping marks the land's `parcelSkipped: true` and proceeds to Step 5. Users can always return to draw their parcel from the planner later.

**Shell 3 — `#admin-shell`** (activated by "🌿 Master Gardener" button)
The admin console. Gated by `profiles.is_admin = true`. Renders as a completely separate layout shell — its own sidebar, its own top bar, its own bottom nav — with no overlap with the main app shell. In the real app, admin users see this shell instead of the regular app shell when they navigate to `/app/admin/*`. The `initAdminScreens()` function in the prototype clones DOM nodes — in React, these are just separate page components under the admin route group.

**The `switchView()` function in the prototype does nothing in production.** It exists only to let you preview all three sections in a single HTML file. In the real app, routing handles this:
- Unauthenticated → `/auth/login`
- Authenticated, no land record → `/onboarding`
- Authenticated, has land record, `is_admin = false` → `/app/home` (app shell)
- Authenticated, `is_admin = true` → `/app/admin/growth` (admin shell)

**The `#dev-bar` CSS and HTML (`id="dev-bar"`, `.dev-btn`, `.dev-btn-admin`) must not appear anywhere in the production build.**

---

## STACK

- **React** (Vite + SWC) with **TypeScript** — strict mode, no `any`
- **Supabase** — auth, database, storage, Edge Functions, Realtime
- **React Router v6** — file-based routing under `src/pages/`
- **TanStack Query v5** — all server state, no ad hoc fetch calls in components
- **react-hook-form + zod** — all forms, all validation
- **i18next + react-i18next + i18next-browser-languagedetector** — every user-facing string
- **Vitest + @testing-library/react** — unit and component tests
- **Deno** — Edge Functions only (not the frontend)
- **Stripe** — subscriptions via Edge Functions only, never client-side
- **Vite PWA plugin** — offline-capable, installable

---

## NON-NEGOTIABLE ENGINEERING RULES

Read these before writing a single component. They are not suggestions.

### 1. i18n first — no hardcoded strings

Every user-facing string lives in `src/i18n/locales/en.json` and `es.json`. No exceptions.

```ts
// src/i18n/index.ts — use this exact setup
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import es from "./locales/es.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, es: { translation: es } },
    fallbackLng: "en",
    supportedLngs: ["en", "es"],
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "hortus-language",
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });
```

Structure keys by feature namespace. `common.*` for shared labels. `nav.*` for navigation. `phases.*` for Common Year. `nri.*` for NRI voice strings. Seed the English keys from `hortus-seed-pack-v2.json` where content exists there.

Write an i18n parity test at `src/test/i18n-parity.test.ts` that flattens both JSON trees and asserts:
- Every English key exists in Spanish
- Every Spanish key exists in English
- No empty string values in either file

This test runs in CI. It must pass before any PR merges.

### 2. RLS first — every table locked from day one

Every table gets `ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY;` immediately after `CREATE TABLE`. No table is ever created without it.

Use three helper functions in every RLS policy — define these first, before any table policies:

```sql
-- All functions must have SET search_path = public
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
```

RLS policy pattern for every table — apply consistently:
```sql
-- Solo-owned data (Land, Plot, Observation, HarvestLog, SeedLibrary, Plan)
CREATE POLICY "Owner access" ON public.{table}
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Community data — members read, role-gated write
CREATE POLICY "Members can view" ON public.{table}
  FOR SELECT TO authenticated
  USING (public.is_community_member(community_id, auth.uid()));

CREATE POLICY "Coordinators can manage" ON public.{table}
  FOR ALL TO authenticated
  USING (public.get_user_community_role(community_id, auth.uid()) IN ('admin','coordinator'));

-- Admin-only (affiliate events, NRI quality, content drafts)
CREATE POLICY "Admin only" ON public.{table}
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()));
```

Never use `TO public`. Always specify `TO authenticated` or `TO anon` explicitly.

### 3. Auth — email+password + magic link, no OAuth at launch

```ts
// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
```

Auth rate limiting via Supabase RPC — enforce on every auth action:
```ts
// src/lib/authRateLimit.ts
export async function checkAuthRateLimit(email: string): Promise<boolean> {
  const key = `auth:login:${email.toLowerCase().trim()}`;
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key, p_window_seconds: 60, p_max_requests: 5,
  });
  if (error) return true; // fail open
  return data as boolean;
}
// Signup: 3 per 600s. Reset: 3 per 300s.
```

`useAuth` hook must expose: `user`, `session`, `loading`, `isAdmin`, `gardenId`, `communityId`, `communityRole`, `signOut`. Gate every protected route on `loading === false` before checking auth — never flash unauthenticated content.

### 4. No ad hoc queries in components

All Supabase queries live in typed service modules under `src/services/`. Components use TanStack Query hooks only.

```ts
// src/services/land.ts
export const landService = {
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from("lands")
      .select("*, soil_profile(*), phase_history(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  // ...
};

// src/hooks/useLand.ts
export function useLands() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["lands", user?.id],
    queryFn: () => landService.getByUser(user!.id),
    enabled: !!user,
  });
}
```

### 5. Edge Functions — Deno, CORS, auth check, rate limit every time

Every Edge Function follows this exact template:

```ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitedResponse } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const allowed = await checkRateLimit(`{function-name}:${user.id}`, 60, 20);
    if (!allowed) return rateLimitedResponse(corsHeaders);

    // ... function logic

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ error: err.message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

Write a `_shared/rateLimiter.ts` with `checkRateLimit()` and `rateLimitedResponse()`. Write a `{function}.test.ts` alongside every function that tests at minimum: OPTIONS returns 200, missing auth returns 401/500, rate limit returns 429.

Deno tests run with `deno test --allow-net --allow-env supabase/functions/`. Include in CI.

### 6. Vitest — test everything that has logic

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

`src/test/setup.ts` must mock: `window.matchMedia`, `IntersectionObserver`, `ResizeObserver`.

Mock Supabase in all unit tests with `vi.mock("@/integrations/supabase/client", ...)`. Never hit a real database in unit tests.

Test requirements:
- `src/test/i18n-parity.test.ts` — key parity across all locales
- `src/test/authRateLimit.test.ts` — rate limit logic (fail open, normalize email)
- `src/services/*.test.ts` — service layer with mocked Supabase
- `src/pages/**/__tests__/*.test.tsx` — page-level render + interaction tests

### 7. TypeScript strict — no `any`, no `!` assertions in app code

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

Generate types from Supabase schema: `supabase gen types typescript --local > src/integrations/supabase/types.ts`. Import database types from this file. Never hand-write DB types.

### 8. Stripe — server-side only

Stripe secret key never touches the client. All Stripe logic lives in Edge Functions.

Two products, four prices:
- `hortus_solo` — monthly ($4.99) and annual ($39)
- `hortus_community` — monthly ($9.99) and annual ($79)

```sql
-- profiles table must have these subscription fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_tier text CHECK (subscription_tier IN ('free', 'solo', 'community')) DEFAULT 'free',
  subscription_status text DEFAULT 'inactive',
  trial_ends_at timestamptz,
  is_admin boolean DEFAULT false;  -- Master Gardener flag — set manually
```

Edge Functions needed:
- `create-checkout` — creates Stripe Checkout session, returns URL
- `stripe-webhook` — handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` — updates `profiles` table via service role client
- `get-subscription-status` — returns current tier and status for the authed user

Trial logic: `solo` gets 14 days, `community` gets 30 days. Store `trial_ends_at` on the profile. Check in the entitlement hook:

```ts
// src/hooks/useEntitlement.ts
export function useEntitlement() {
  const { user } = useAuth();
  // query profiles for subscription_tier, subscription_status, trial_ends_at
  // returns: { tier, isActive, isTrial, daysRemaining }
}
```

Gate features with `<RequiresTier tier="solo">` and `<RequiresTier tier="community">` wrapper components that redirect to `/pricing` if not entitled.

### 9. PWA — offline-capable

```ts
// vite.config.ts — VitePWA config
VitePWA({
  registerType: "autoUpdate",
  manifest: {
    name: "Hortus",
    short_name: "Hortus",
    theme_color: "#0d6f74",
    background_color: "#f7f6f2",
    display: "standalone",
    orientation: "portrait",
  },
  workbox: {
    navigateFallback: "/index.html",
    navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//, /^\/rest\//, /^\/auth\//],
    runtimeCaching: [
      // Cache land/plot/observation data for offline field use
      { urlPattern: /\/rest\/v1\/(lands|plots|observations)/, handler: "StaleWhileRevalidate",
        options: { cacheName: "garden-data", expiration: { maxEntries: 200, maxAgeSeconds: 86400 } } },
      // NWS weather — NetworkFirst with 5s timeout (fail gracefully offline)
      { urlPattern: /api\.weather\.gov/, handler: "NetworkFirst",
        options: { cacheName: "weather", networkTimeoutSeconds: 5 } },
      // Fonts
      { urlPattern: /fonts\.googleapis\.com/, handler: "CacheFirst",
        options: { cacheName: "fonts", expiration: { maxAgeSeconds: 31536000 } } },
    ],
  },
})
```

### 10. Environment variables — never commit secrets

Required `.env.local` keys (never in source):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_SEEDS_NOW_AFFILIATE_TAG=HORTUS_AFFILIATE
```

Required Supabase secrets (set via dashboard, never in code):
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
ANTHROPIC_API_KEY=
AIRNOW_API_KEY=
```

---

## DATABASE SCHEMA

Implement all schemas from `hortus-seed-pack-v2.json` → `schemas` section. Key tables and RLS patterns:

**Solo garden data** (scoped by `user_id = auth.uid()`):
`lands`, `plots`, `observations`, `harvest_logs`, `seed_library`, `plans`

**Community data** (scoped by `is_community_member(community_id, auth.uid())`):
`communities`, `community_members`, `persons`, `workdays`, `workday_rsvps`, `sharing_posts`, `messages`, `message_threads`, `volunteer_hour_logs`, `nri_signals`

**Admin only** (scoped by `is_admin_user(auth.uid())`):
`admin_content_drafts`, `affiliate_events`

Additional tables needed beyond the seed pack schemas:

```sql
-- Stripe subscription data on profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
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
CREATE POLICY "Own profile" ON public.profiles
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Auto-create profile on signup
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

-- Rate limiting (required for auth + Edge Functions)
CREATE TABLE public.rate_limit_counters (
  key text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

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
```

---

## NRI INTEGRATION

NRI lives exclusively in Edge Functions. Never call the Anthropic API from the client.

```
supabase/functions/
  nri-chat/          — handles user messages, injects full context object
  nri-ground-read/   — onboarding soil reading
  nri-phase-detect/  — daily phase detection per user
  nri-rule-of-life/  — weekly Rule of Life generation (Monday 5 AM cron)
  nri-voice-log/     — processes voice log transcripts
```

Every NRI function:
1. Validates auth
2. Checks rate limit (`nri-chat`: 30/hour per user)
3. Builds full context object from DB (land, weather snapshot, recent observations, active plan, phase history)
4. Calls Anthropic API with verbatim system prompt from `nri-system-prompt.md`
5. Stores assistant response in `nri_chat_messages` table
6. Returns response

Context object shape (matches `nri-system-prompt.md` → "CONTEXT YOU RECEIVE"):
```ts
interface NRIContext {
  user: { name: string };
  land: {
    displayName: string;
    hardinessZone: string;
    soilProfile: object;
    currentPhase: { phaseId: string; confidence: number; reason: string };
    frostDates: { lastSpring: string; firstFall: string };
    philosophy: string;
    languageMode: "plain" | "gardener" | "source";
  };
  weather: { state: string; headline: string; forecast: string; aqi: number };
  recentObservations: string[];
  activePlan: object | null;
  phaseHistory: object[];
  nriSignals: object[];
}
```

---

## ROUTING

```
/                     → marketing home (public)
/pricing              → pricing page (public)
/auth/login           → email+password + magic link
/auth/signup          → signup + tier selection
/auth/callback        → magic link handler
/onboarding           → 6-step flow (address, goal, budget, philosophy, crops, NRI welcome)
/app                  → redirect to /app/home
/app/home             → Home screen
/app/land             → Loam Map
/app/weather          → Weather + hazard state
/app/planner            → Garden Planner (Layout / Crops / Materials tabs)
/app/planner/aerial     → Parcel aerial view + bed placement (from hortus-parcel-planner.html)
/app/planner/photos     → Yard photo upload + NRI interpretation (from hortus-parcel-planner.html)
/app/planner/ar         → AR bed placement (from hortus-parcel-planner.html)
/app/succession       → Crop succession timeline
/app/harvest          → Harvest log + seed saving
/app/phenology        → Observation streak + phenology log
/app/commonyear       → Common Year phases
/app/source           → Source Materials + Seeds Now
/app/offline          → Field Mode
/app/notifications    → Notification preferences
/app/community/people → People + NRI signals
/app/community/workdays → Workday scheduler
/app/community/map    → Garden map + bed ownership
/app/community/sharing → Sharing board
/app/community/messages → Internal messaging
/app/community/hours  → Volunteer hour tracking
/app/logs             → Memory / observation log
/app/philosophy       → Philosophy lenses
/app/settings         → Settings
/app/nri              → NRI chat (also accessible via bottom nav compass)
```

All `/app/*` routes are protected. Redirect unauthenticated users to `/auth/login`. Redirect users without a completed land record to `/onboarding`.

---

## SEEDS NOW AFFILIATE

```ts
// src/lib/seeds.ts
const AFFILIATE_TAG = import.meta.env.VITE_SEEDS_NOW_AFFILIATE_TAG ?? "HORTUS_AFFILIATE";
const BASE = "https://www.seedsnow.com";

export function seedsNowUrl(path: string): string {
  return `${BASE}${path}?ref=${AFFILIATE_TAG}`;
}
```

Log every click as an `AffiliateEvent` record via a lightweight Edge Function before redirecting. This enables the affiliate revenue tracker in the admin view.

Seed URLs come from `hortus-seed-pack-v2.json` → `cropPatterns[].crops[].seedsNowUrl`. Pass through `seedsNowUrl()` at render time — never hardcode the full URL with tag in the database.

---

## DESIGN SYSTEM

**Extract directly from `hortus-app-prototype.html` — do not write your own styles.**
Copy all CSS custom properties, class definitions, and layout patterns from the prototype into your global stylesheet or Tailwind config. The prototype is the specification. Key tokens (already in the file — copy them, don't rewrite them):

```css
:root {
  --color-bg: #f7f6f2;
  --color-surface: #fbfaf7;
  --color-primary: #0d6f74;
  --color-accent: #5d7d4a;
  --color-warn: #aa6d22;
  --color-text: #26231d;
  --color-text-muted: #706b63;
  --radius-full: 9999px;
  --transition: 180ms cubic-bezier(.16,1,.3,1);
}
```

Fonts: `Instrument Serif` (headings, NRI voice, italic emphasis) + `Work Sans` (body, UI). Load from Google Fonts.

Mobile-first. Bottom nav on mobile (Home, Plots, NRI compass, Seasons, Memory). Sidebar on desktop (≥768px). Hamburger drawer on mobile for secondary navigation. Bottom nav compass button is 52px, raised 10px above the bar, teal background, double-ring halo.

---

## WHAT LOVABLE MUST NOT DO

- Do not invent screen layouts — extract them directly from `hortus-app-prototype.html`
- Do not use placeholder or skeleton UI while "building toward" the real design — build the real design from the file on the first pass
- Do not redesign, simplify, or reinterpret any screen — if it's in the prototype, match it exactly
- Do not hardcode user-facing strings — use i18n keys
- Do not write Stripe logic in React components
- Do not call the Anthropic API from the client
- Do not skip RLS on any table
- Do not use `SECURITY DEFINER` functions without `SET search_path = public`
- Do not use `TO public` in RLS policies
- Do not put the Stripe secret key or Anthropic key in `.env.local` or source files
- Do not write tests that hit real Supabase — mock the client
- Do not create tables without immediately enabling RLS
- Do not use `any` in TypeScript
- Do not generate DB types by hand — use `supabase gen types`
- Do not add OAuth providers at launch — email+password and magic link only

---

## BUILD ORDER

1. Project scaffold — Vite + React + TS strict + Tailwind + i18n setup + test setup
2. Supabase schema — all migrations in order, RLS on every table, helper functions, profile trigger, rate limit function
3. Auth — login, signup, magic link callback, useAuth hook, rate limiting
4. Stripe — Edge Functions (create-checkout, webhook, status), useEntitlement hook, pricing page
5. Onboarding — 6 steps, address → NWS grid point → SSURGO pull → hardiness zone → NRI welcome
6. Core solo screens — Home, Land/Loam Map, Plots, Common Year, Source (with Seeds Now), Memory
7. NRI — all 5 Edge Functions, chat screen, context builder
8. External API connectors — NWS, SSURGO, AirNow, USA-NPN (see `hortus-api-connector-map.md`)
9. Push notifications — Supabase Edge Function cron jobs (see `hortus-push-notifications.md`)
10. Community screens — People, Workdays, Garden Map, Sharing Board, Messages, Volunteer Hours
11. New solo screens — Harvest Log, Succession, Phenology, Field Mode, Notifications settings
12. PWA — service worker, offline strategy, installability
13. Admin flag — `is_admin = true` gating for Master Gardener view (no separate tier, no billing)
14. Tests — i18n parity, auth rate limit, service layer, page render tests

Ship each step before starting the next. Do not scaffold the whole app and fill in later.
