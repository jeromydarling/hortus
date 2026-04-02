# Hortus — Claude Code Kickoff Prompt

You are being handed a complete, locked product specification for **Hortus** — a place-aware gardening operating system. Your job is to prepare this project for handoff to Lovable so that Lovable can build the production app without making a single design or architecture decision on its own.

---

## Your First Task: Read Everything

Before writing any code or creating any files, read these documents in this order:

1. `hortus-lovable-prompt.md` — the master build prompt. Every engineering rule, schema, route, and build order is here.
2. `hortus-garden-mode-addendum.md` — the solo vs. community garden fork. Understand how `garden_mode` shapes the entire user experience.
3. `hortus-demo-mode-addendum.md` — the public demo mode at `/demo`.
4. `hortus-seed-pack-v2.json` — the complete content backbone. Entity schemas, phase names, philosophy library, crop patterns, NRI prompts, affiliate config. All app data comes from here.
5. `nri-system-prompt.md` — the verbatim NRI system instruction. Do not summarize or rewrite it.
6. `hortus-api-connector-map.md` — all 11 external API connectors with endpoints, field mappings, and caching strategy.
7. `hortus-push-notifications.md` — all 26 push notification events with NRI voice copy and Edge Function requirements.

Do not skim. The details matter.

---

## What Hortus Is

A production PWA that serves as a lifelong gardening companion. It reads the user's actual land — soil from NRCS SSURGO, terrain from USGS, hardiness zone from USDA, parcel boundary from county GIS, weather from NWS — and guides them through seasonal planting using an AI intelligence layer called NRI (Natural Resource Interpreter).

Two user types determined at onboarding Step 2:
- **Solo gardeners** — personal land, household, homestead. Growing features only.
- **Community gardens** — shared space, multiple members, coordinator role. Growing features plus full community layer.

NRI is built on Claude (Anthropic API, `claude-sonnet-4-6`). It is not a chatbot. It is a structured intelligence layer with a specific voice, a specific system prompt, and pre-loaded context from the user's land data on every call.

---

## What Already Exists — Do Not Rebuild

- `hortus-app-prototype.html` — every screen, every layout, every component, every interaction. Visual and structural source of truth. Extract into React. Do not redesign.
- `hortus-marketing.html` — the marketing site. The `/` route renders this. Extract into a React component.

---

## Your Job: Prepare the Scaffold for Lovable

Lovable works best when it receives a pre-structured project. Your job is to build the scaffold so Lovable only implements — it makes no decisions.

### 1. Project structure
```
src/
  i18n/locales/en.json
  i18n/locales/es.json
  i18n/index.ts
  demo/fixture.ts
  demo/DemoProvider.tsx
  demo/DemoBanner.tsx
  demo/DemoLayout.tsx
  demo/useDemoNRI.ts
  services/              ← typed shells: land, plots, observations, plan, community, profiles
  hooks/                 ← useGardenMode, useEntitlement, useAuth, useLands shells
  lib/seeds.ts           ← seedsNowUrl() function
  lib/authRateLimit.ts   ← checkAuthRateLimit, checkSignupRateLimit, checkResetRateLimit
  test/setup.ts
  test/i18n-parity.test.ts
  test/authRateLimit.test.ts
supabase/
  migrations/            ← complete SQL migrations
  functions/_shared/rateLimiter.ts
  functions/nri-chat/index.ts      ← shell only
  functions/stripe-webhook/index.ts ← shell only
  functions/create-checkout/index.ts ← shell only
vitest.config.ts
LOVABLE_HANDOFF.md
```

### 2. Supabase migrations — write these completely
From `hortus-seed-pack-v2.json` schemas and `hortus-lovable-prompt.md` DATABASE SCHEMA section:
- All tables with correct column types and constraints
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` immediately after every `CREATE TABLE`
- Three helper functions with `SECURITY DEFINER STABLE SET search_path = public`
- All RLS policies using the helpers — follow the patterns in the main prompt exactly
- `profiles` table with `garden_mode`, `is_admin`, `subscription_tier`, trial fields, Stripe fields
- `handle_new_user()` trigger auto-creating a profile on signup
- `check_rate_limit()` function and `rate_limit_counters` table

Migration order matters. Helper functions before the policies that use them.

### 3. i18n files — seed from the prototype
Walk `hortus-app-prototype.html` and extract every user-facing string into `en.json`. Namespaces: `common`, `nav`, `onboarding`, `phases`, `nri`, `planner`, `loam`, `weather`, `source`, `logs`, `community`, `settings`, `philosophy`, `harvest`, `succession`, `phenology`, `notifications`, `demo`. Mirror the full key structure into `es.json` with English values as placeholders.

Phase names come from `hortus-seed-pack-v2.json` → `phases`. Use exactly: Rest, Preparation, First Signs, Planting, Establishment, Abundance, Preservation, Return.

### 4. Demo fixture — implement completely
From `hortus-demo-mode-addendum.md`, write `src/demo/fixture.ts` with the complete `DEMO_FIXTURE` and `DEMO_COMMUNITY` objects. Write `DemoProvider.tsx`, `DemoBanner.tsx`, `DemoLayout.tsx`, and `useDemoNRI.ts` shells from the addendum.

### 5. Test setup
Write `vitest.config.ts` and `src/test/setup.ts` exactly as specified in `hortus-lovable-prompt.md` Rule 6. Write `src/test/i18n-parity.test.ts` — the flattenKeys parity test. Write `src/test/authRateLimit.test.ts` — the rate limit behavior tests.

### 6. Utility functions
- `src/lib/seeds.ts` — `seedsNowUrl(path: string): string` using `import.meta.env.VITE_SEEDS_NOW_AFFILIATE_TAG`
- `src/lib/authRateLimit.ts` — `checkAuthRateLimit`, `checkSignupRateLimit`, `checkResetRateLimit` using Supabase RPC `check_rate_limit`

### 7. Edge Function shells
Write shells for the three most critical Edge Functions. Each shell must include the exact CORS headers, OPTIONS handler, auth check, and rate limit check from the template in `hortus-lovable-prompt.md` Rule 5. Leave business logic as `// TODO` comments:
- `supabase/functions/nri-chat/index.ts` — include comment: `// System prompt: paste verbatim from nri-system-prompt.md`
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/_shared/rateLimiter.ts` — implement fully

### 8. Write LOVABLE_HANDOFF.md
A single concise document telling Lovable:
- What's already scaffolded (list it)
- The 14-step build order from the main prompt
- Three files to read before writing any component: `hortus-lovable-prompt.md`, `hortus-app-prototype.html`, `hortus-seed-pack-v2.json`
- The cardinal rules: no invented layouts, no hardcoded strings, no client-side Stripe or Anthropic calls, RLS on every table

---

## Rules You Must Apply Right Now

- Every table gets RLS enabled the moment it's created
- All helper SQL functions use `SECURITY DEFINER STABLE SET search_path = public`
- TypeScript strict throughout — no `any`, no `!` assertions
- The affiliate tag is `HORTUS_AFFILIATE` — never hardcode URLs with the tag baked in
- NRI system prompt is verbatim — comment its location, do not reproduce it in code yet
- `garden_mode` is `'solo' | 'community'` — it gates the entire community feature set

---

## What Success Looks Like

When you hand this to Lovable:
1. `supabase db push` runs and produces a working schema with RLS on every table
2. `vitest` runs and the i18n parity test passes
3. Lovable reads `LOVABLE_HANDOFF.md` and knows exactly what to build
4. Every screen in `hortus-app-prototype.html` has a corresponding route stub
5. Lovable never asks "what should I call this?" — everything is already named

---

## Start

Read all seven documents. Then build the scaffold in this order: migrations → i18n → demo fixture → test setup → utility functions → Edge Function shells → LOVABLE_HANDOFF.md. Stop there. Do not build UI.
