# Hortus — Lovable Handoff

This scaffold is ready for implementation. Everything below tells you what's done, what's next, and where to find the source of truth for every decision.

---

## What's Already Done

### Project scaffold
- Vite + React + TypeScript (strict mode) with SWC
- Path alias `@/` → `src/`
- PWA config with offline caching strategy for garden data, weather, and fonts
- `vitest.config.ts` with jsdom environment and setup file
- `src/test/setup.ts` with mocks for `matchMedia`, `IntersectionObserver`, `ResizeObserver`
- `src/test/i18n-parity.test.ts` — validates key parity between `en.json` and `es.json`

### Supabase migrations
- `supabase/migrations/00001_initial_schema.sql` — complete schema with all tables
- Every table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` immediately after creation
- Three helper functions: `is_community_member`, `get_user_community_role`, `is_admin_user` — all with `SECURITY DEFINER STABLE SET search_path = public`
- All RLS policies using helper functions, scoped to `TO authenticated`
- `profiles` table with `garden_mode`, `is_admin`, `stripe_*`, `subscription_*` columns
- `handle_new_user()` trigger on `auth.users`
- `check_rate_limit()` function and `rate_limit_counters` table

### i18n
- `src/i18n/index.ts` — i18next setup with browser language detection
- `src/i18n/locales/en.json` — all user-facing strings seeded from the prototype, organized by namespace: `common`, `nav`, `phases`, `nri`, `onboarding`, `planner`, `loam`, `weather`, `source`, `logs`, `community`, `settings`, `philosophy`, `harvest`, `succession`, `phenology`
- `src/i18n/locales/es.json` — mirror key structure with English placeholders (translator fills in later)

### Demo mode
- `src/demo/fixture.ts` — complete `DEMO_FIXTURE` and `DEMO_COMMUNITY` objects matching the Sundown Edge demo garden
- `src/demo/DemoProvider.tsx` — context provider that replaces Supabase calls with fixture data
- `src/demo/DemoBanner.tsx` — persistent, dismissible demo banner with signup CTA

### Community resilience features (Strong Towns + Local Futures alignment)
- `src/components/FoodSystemMap.tsx` — Interactive US SVG map with seed markers for Hortus users + color-coded food system points (farmers markets, CSAs, seed libraries, etc.)
- `src/components/FoodResilienceScore.tsx` — 0-100 circular gauge, 9 weighted metrics (lbs produced, days of food, seeds saved, crops shared, etc.)
- `src/components/YieldDashboard.tsx` — lbs/sqft per bed, season totals, most/least productive callouts
- `src/components/SeedExchangeBoard.tsx` — Community seed sharing with offer/request/swap tabs, heirloom tracking, shipping flags
- `src/components/EconomicImpact.tsx` — Grocery value saved, local spend, donated value, compost value, local multiplier effect
- `src/components/CompostTracker.tsx` — Pile management with green/brown ratio, temperature gauge, entry timeline
- `src/components/GardenReadyFinder.tsx` — Vacant lot scoring (0-100) with NRI soil assessment, public/private filter
- `src/components/ScreenToSoil.tsx` — Session timer nudges, one-tap quick-log, task-complete auto-close, seed SVG icon
- `supabase/migrations/00002_food_system_features.sql` — 6 new tables: `food_system_points`, `user_map_pins`, `seed_exchanges`, `compost_logs`, `compost_entries`, `food_resilience_snapshots`

### Service layer
- Typed service modules in `src/services/` for: `profile`, `land`, `plot`, `observation`, `harvest`, `plan`, `seedLibrary`, `community`, `nri`, `affiliate`, `foodSystemMap`, `seedExchange`, `compost`, `resilience`
- All queries go through these services — components use TanStack Query hooks only

### Hooks
- `src/hooks/useAuth.ts` — exposes `user`, `session`, `loading`, `isAdmin`, `gardenId`, `communityId`, `communityRole`, `signOut`
- `src/hooks/useGardenMode.ts` — returns `mode`, `isSolo`, `isCommunity`
- `src/hooks/useEntitlement.ts` — returns `tier`, `isActive`, `isTrial`, `daysRemaining`

### Utilities
- `src/lib/seeds.ts` — `seedsNowUrl(path)` function using `VITE_SEEDS_NOW_AFFILIATE_TAG`
- `src/lib/authRateLimit.ts` — `checkAuthRateLimit(email, action)` with fail-open behavior
- `src/integrations/supabase/client.ts` — Supabase client setup

---

## What Lovable Needs to Build

### Screens and components
Extract directly from `specs/hortus-app-prototype.html`. Every screen, component, layout, color, spacing, icon, and label is in that file. Do not redesign — match it exactly.

- Marketing home (`/`) — extract from `specs/hortus-marketing.html`
- Auth screens (login, signup, magic link callback)
- Onboarding 7-step flow
- All app screens listed in the ROUTING section of `specs/hortus-lovable-prompt.md`
- Admin/Master Gardener screens (gated by `is_admin = true`)
- Demo mode layout wrapping `/demo/*` routes

### Edge Functions
Create in `supabase/functions/`:
- `nri-chat/` — handles user messages, injects full context object
  - System prompt: paste verbatim content from `specs/nri-system-prompt.md`
  - Model: `claude-sonnet-4-6`, max tokens: 1000 (standard), 2000 (ground reading, Rule of Life)
- `nri-ground-read/` — onboarding soil reading
- `nri-phase-detect/` — daily phase detection per user
- `nri-rule-of-life/` — weekly Rule of Life generation (Monday 5 AM cron)
- `nri-voice-log/` — processes voice log transcripts
- `create-checkout/` — Stripe Checkout session creation
- `stripe-webhook/` — handles Stripe webhook events, updates profiles
- `get-subscription-status/` — returns current tier for authed user
- `log-affiliate-click/` — logs Seeds Now clicks before redirect
- `search-food-systems/` — uses Perplexity to find farmers markets, CSAs, seed libraries near a zip code; stores results in `food_system_points`
- `compute-resilience/` — computes food resilience score from harvest logs, seed library, compost, sharing data
- `sync-user-map-pin/` — updates `user_map_pins` aggregate when a user creates/updates a land record
- `_shared/rateLimiter.ts` — shared rate limit utility

Every Edge Function must follow the template in `specs/hortus-lovable-prompt.md` Rule 5 (CORS, auth check, rate limit).

### Routing
See the complete route table in `specs/hortus-lovable-prompt.md` → ROUTING section, plus these new routes:

```
/app/food-map         → Local Food System Map (public view also at /food-map)
/app/resilience       → Food Resilience Score dashboard
/app/yield            → Yield-per-square-foot dashboard
/app/seed-exchange    → Seed Exchange Board
/app/impact           → Economic Impact summary
/app/compost          → Compost Tracker
/app/garden-ready     → Garden-Ready vacant lot finder
```

### Local Food System Map — Perplexity Integration

The map at `/app/food-map` is the public-facing showpiece of Hortus. It shows every Hortus garden (anonymous seed markers by zip code) and every local food resource discovered via Perplexity. The component is built (`src/components/FoodSystemMap.tsx`) using `us-atlas` TopoJSON for state outlines.

**What goes on the map (stored in `food_system_points` table):**

| Type | Icon/Color | Source | How discovered |
|---|---|---|---|
| `hortus_user` | Teal seed marker (#0d6f74), sized by count | `user_map_pins` table | Auto-created when user saves a land record (zip-level only, anonymous) |
| `farmers_market` | Green circle (#5d7d4a) | Perplexity search + USDA AMS API | Edge Function `search-food-systems` queries by zip/state |
| `csa` | Light green circle (#7a9b5a) | Perplexity search | "CSA farms near {zip}" |
| `seed_library` | Amber circle (#aa6d22) | Perplexity search | "Seed libraries near {zip}" |
| `community_garden` | Brown circle (#8b5e3c) | Perplexity search | "Community gardens near {zip}" |
| `nursery` | Gray circle (#706b63) | Perplexity search | "Independent garden centers near {zip}" |
| `food_co_op` | Teal-green circle (#4a7d6a) | Perplexity search | "Food co-ops near {zip}" |
| `urban_farm` | Green circle (#5d7d4a) | Perplexity search | "Urban farms near {zip}" |
| `food_forest` | Dark green circle (#3d6a3e) | Perplexity search | "Food forests near {zip}" |
| `compost_site` | Brown circle (#8b6e3c) | Perplexity search | "Community compost sites near {zip}" |

**Edge Function: `search-food-systems`**

This is the key integration. When called with a zip code:

1. Calls Perplexity with structured queries for each food system type near that zip
2. Parses results to extract: name, address, lat/lon, description, hours, website
3. Upserts results into `food_system_points` table with `source: 'perplexity'`
4. Returns the points for immediate display

**Perplexity prompt template:**
```
System: You are a local food system researcher. Return results as JSON arrays.
User: Find all {type} within 25 miles of zip code {zip}. For each, return:
- name (string)
- address (string)  
- description (1 sentence — hours, season, notable features)
- lat (number)
- lon (number)
- website (string or null)

Types to search: farmers markets, CSA farms, seed libraries, community gardens, 
independent garden centers/nurseries, food co-ops, urban farms, food forests, 
community compost sites.

Return only verified, currently operating locations. No chains. No big-box stores.
```

**When to call:**
- On user signup/onboarding — search their zip code
- On admin trigger — batch search for a state or region
- Never on passive page view — cache results in `food_system_points`

**Auto-updating user pins:**
When a user creates or updates a land record, the `sync-user-map-pin` Edge Function calls `upsert_user_map_pin(zip, lat, lon, state_code)` to increment the anonymous aggregate count. The map shows these as seed-shaped markers sized by count. No individual addresses are ever exposed.

**Map placement:**
- `/app/food-map` — full interactive map for authenticated users, centered on their location
- Marketing page — static preview with demo data (Lovable renders the React component when marketing page becomes a React route)
- `/food-map` — optional public route, unauthenticated, shows all data

**USDA AMS supplemental data (free, no key):**
For farmers markets specifically, also pull from the USDA Agricultural Marketing Service API:
```
GET https://www.usdalocalfoodportal.com/api/farmersmarket/?apikey=API_KEY&zip={zip}&radius=25
```
This gives verified market data including SNAP/EBT acceptance. Merge with Perplexity results, dedup by name/address proximity.

### Stripe integration
Two products, four prices:
- `hortus_solo` — $4.99/month, $39/year (14-day trial)
- `hortus_community` — $9.99/month, $79/year (30-day trial)

All Stripe logic lives in Edge Functions. Never on the client.

### External API connectors
See `specs/hortus-api-connector-map.md` for all 11 connectors with endpoints, field mappings, and caching.

### Push notifications
See `specs/hortus-push-notifications.md` for all 26 events with NRI voice copy and Edge Function schedules.

---

## 14-Step Build Order

Follow this order. Ship each step before starting the next.

1. **Project scaffold** — DONE (this is it)
2. **Supabase schema** — DONE (run `supabase db push`)
3. **Auth** — login, signup, magic link, useAuth hook, rate limiting
4. **Stripe** — Edge Functions, useEntitlement hook, pricing page
5. **Onboarding** — 7 steps: address → garden type → goal → parcel → budget → philosophy → crops → NRI welcome
6. **Core solo screens** — Home, Land/Loam Map, Plots, Common Year, Source (with Seeds Now), Memory
7. **NRI** — all 5 Edge Functions, chat screen, context builder
8. **External API connectors** — NWS, SSURGO, AirNow, USA-NPN
9. **Push notifications** — Edge Function cron jobs
10. **Community screens** — People, Workdays, Garden Map, Sharing Board, Messages, Volunteer Hours
11. **New solo screens** — Harvest Log, Succession, Phenology, Field Mode, Notification settings
12. **PWA** — service worker, offline strategy, installability
13. **Admin** — Master Gardener view gated by `is_admin = true`
14. **Tests** — i18n parity (already done), auth rate limit, service layer, page render tests

---

## Visual Reference

- `specs/hortus-app-prototype.html` — the complete app prototype. Every screen is here. Extract, don't redesign.
- `specs/hortus-marketing.html` — the marketing/landing page at `/`

Open these files in a browser to see the exact layouts, then convert to React components.

---

## Three Things You Must Never Do

1. **Do not invent screen layouts** — extract them from `hortus-app-prototype.html`
2. **Do not hardcode user-facing strings** — use i18n keys from `en.json`/`es.json`
3. **Do not put Stripe logic on the client** — all Stripe calls go through Edge Functions

---

## Key Files Reference

| File | Purpose |
|---|---|
| `specs/hortus-lovable-prompt.md` | Master build spec — every rule, schema, route |
| `specs/hortus-garden-mode-addendum.md` | Solo vs. community garden fork |
| `specs/hortus-demo-mode-addendum.md` | Public demo mode at `/demo` |
| `specs/hortus-seed-pack-v2.json` | All content: phases, philosophies, crops, prompts |
| `specs/nri-system-prompt.md` | Verbatim NRI system prompt — do not modify |
| `specs/hortus-api-connector-map.md` | All 11 external API connectors |
| `specs/hortus-push-notifications.md` | All 26 push notification events |

---

## Environment Variables

### Client-side (`.env.local`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_SEEDS_NOW_AFFILIATE_TAG=HORTUS_AFFILIATE
```

### Server-side (Supabase dashboard secrets)
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
ANTHROPIC_API_KEY=
AIRNOW_API_KEY=
```

---

## Design Tokens

Already in the prototype CSS. Copy these into your global stylesheet:

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

Fonts: `Instrument Serif` (headings, NRI voice) + `Work Sans` (body, UI). Load from Google Fonts.
