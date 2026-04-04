# Hortus — Lovable Build Prompt

**Paste this as the FIRST message in a new Lovable project. Attach these files from the repo:**
- `specs/hortus-app-prototype.html`
- `specs/hortus-seed-pack-v2.json`
- `specs/nri-system-prompt.md`
- `specs/hortus-marketing.html`

---

## CRITICAL: This project has a pre-built scaffold. Do not start from scratch.

A complete scaffold already exists in this repository. Before writing any code, read `LOVABLE_HANDOFF.md` — it tells you exactly what's done and what you need to build. Here is a summary:

### What's already built (DO NOT rebuild):

**150 files, 22,000+ lines already written:**

- **Database**: 3 SQL migrations with 28 tables, 104+ RLS policies, helper functions, triggers. Run `supabase db push` and you have a working schema.
- **29 page components** in `src/pages/` — Auth (login, signup, callback), Onboarding (7-step), 7 core app screens, 6 community screens, 5 growing screens, 5 Ancient Library screens. All render with demo data.
- **16 reusable components** in `src/components/` — FoodSystemMap, FoodResilienceScore, YieldDashboard, SeedExchangeBoard, EconomicImpact, CompostTracker, GardenReadyFinder, ScreenToSoil, ErrorBoundary, DemoGuidedTour, FeaturesSlider, DemoGate, BottomNav, Sidebar, AppShell, DemoBanner.
- **8 hooks** — useAuth, useGardenMode, useEntitlement, useNRINudgeEngine, useNRIPosture, useNRIGlow, useNRIAutoOpen, useNRIGuide.
- **14 typed service modules** — All Supabase queries centralized. Components use TanStack Query only.
- **18 Edge Function shells** with CORS, auth, rate limiting — NRI (5), Stripe (3), Food Systems (3), Notifications (5), Affiliate (1), plus shared utilities.
- **NRI Knowledge Base** — `src/content/` with 7 files: gardening techniques, crop guides, soil science, composting, seed saving, app help.
- **Ancient Library** — `src/ancientLibrary/` with 49 plants, 12 techniques, 4 traditions, seasonal calendar, context provider.
- **i18n** — 25 namespaces in `en.json` + `es.json` with key parity tests passing.
- **Demo mode** — DemoProvider, DemoBanner, fixture data, structured JSON in `data/`.
- **Tests** — 32 passing (i18n parity, auth rate limit, resilience scoring, nudge engine, seeds utility).
- **Router** — `src/components/routing/AppRouter.tsx` with all 40+ routes configured.
- **Navigation** — Sidebar (desktop) + BottomNav (mobile) with all sections.

### Your job — what to build:

**Phase 1: Connect to real infrastructure (do this first)**
1. Connect Supabase — set env vars, run migrations, generate types with `supabase gen types typescript --local > src/integrations/supabase/types.ts`
2. Wire auth — the Login/Signup pages exist, connect them to real `supabase.auth`
3. Add Stripe keys — Edge Functions are structured, just add secrets

**Phase 2: Extract visual design from prototype HTML**
4. Open `hortus-app-prototype.html` in a browser. Every screen, layout, color, spacing, icon, and label is final.
5. Extract the CSS custom properties and component styles into your global stylesheet or Tailwind config.
6. **Replace the inline styles** in the existing page components with the extracted CSS classes from the prototype. The current pages render correctly with demo data — you're upgrading the styling, not rebuilding the pages.

**Phase 3: Fill in Edge Function business logic**
7. Each Edge Function in `supabase/functions/` has the structure (CORS, auth, rate limit, error handling). Fill in the TODO business logic sections. Key ones:
   - `nri-chat/` — paste the system prompt from `specs/nri-system-prompt.md` verbatim as the `system` parameter. Model: `claude-sonnet-4-6`, max_tokens: 1000.
   - `stripe-webhook/` — add Stripe signature verification and profile updates
   - `search-food-systems/` — wire Perplexity API (see LOVABLE_HANDOFF.md for prompt template)

**Phase 4: Polish and connect**
8. Wire the NRI intelligence layer — the hooks exist (`useNRINudgeEngine`, `useNRIGlow`, `useNRIAutoOpen`, `useNRIGuide`). Mount them in the AppShell/compass button.
9. Connect the food resilience features to real data (they currently use demo data)
10. Add the marketing page as a React route at `/` (currently it's a static HTML file in `public/`)

---

## NON-NEGOTIABLE RULES

Read `specs/hortus-lovable-prompt.md` for the full list. The critical ones:

1. **i18n first** — Every user-facing string uses a key from `src/i18n/locales/en.json`. Never hardcode strings.
2. **RLS on every table** — Already done in migrations. Never create a table without RLS.
3. **No Stripe on client** — All Stripe logic lives in Edge Functions.
4. **No `any` in TypeScript** — Strict mode is configured.
5. **No ad hoc queries in components** — Use the service modules in `src/services/`.
6. **Extract, don't redesign** — The prototype HTML is the design spec. Match it.
7. **NRI system prompt is verbatim** — Don't summarize or modify `nri-system-prompt.md`.

---

## Design System (from the prototype)

```css
:root {
  --color-bg: #f7f6f2;
  --color-surface: #fbfaf7;
  --color-primary: #0d6f74;
  --color-accent: #5d7d4a;
  --color-warn: #aa6d22;
  --color-text: #26231d;
  --color-text-muted: #706b63;
}
```

Fonts: `Instrument Serif` (headings, NRI voice) + `Work Sans` (body, UI). Load from Google Fonts.

Mobile-first. Bottom nav on mobile. Sidebar on desktop (≥768px). Compass button is 52px, raised 10px, teal background, double-ring halo.

---

## Key Architecture Decisions (already made)

| Decision | Choice | Where |
|---|---|---|
| Auth | Email + password + magic link, no OAuth | `src/pages/auth/` |
| Garden mode | Solo vs Community fork at onboarding step 2 | `useGardenMode` hook |
| NRI model | `claude-sonnet-4-6` via Edge Function | `supabase/functions/nri-chat/` |
| NRI intelligence | Nudge engine (max 3, confidence-scored), posture detection, glow, auto-open, first-visit guide | `src/hooks/useNRI*.ts` |
| NRI knowledge base | Structured content in `src/content/`, injected alongside system prompt | 7 content files |
| Subscriptions | Solo ($4.99/mo, $39/yr, 14d trial), Community ($9.99/mo, $79/yr, 30d trial) | Edge Functions |
| Affiliate | Seeds Now, tag `HORTUS_AFFILIATE`, `seedsNowUrl()` utility | `src/lib/seeds.ts` |
| Food map | us-atlas TopoJSON OR hand-coded state polygons, Perplexity for food system discovery | `src/components/FoodSystemMap.tsx` |
| Resilience | 9-dimension weighted score (0-100), inspired by Strong Towns Strength Test #8 | `src/services/resilience.ts` |
| Ancient Library | 49 plants, 12 techniques, 4 traditions, all from local JSON | `src/ancientLibrary/` |
| Screen-to-Soil | Nudge after 10min, quick-log, auto-close | `src/components/ScreenToSoil.tsx` |
| Error capture | ErrorBoundary + window error capture → `system_error_events` table | `src/components/ErrorBoundary.tsx` |
| Demo mode | DemoProvider context, DemoBanner, DemoGuidedTour (react-joyride) | `src/demo/` |

---

## Build Order

1. ~~Project scaffold~~ ✅
2. ~~Supabase schema~~ ✅ (run `supabase db push`)
3. **Auth** — wire existing pages to real Supabase auth
4. **Stripe** — fill Edge Function logic, add webhook endpoint
5. **Onboarding** — connect to real land creation + NWS/SSURGO calls
6. **Core screens** — replace demo data with real TanStack Query hooks
7. **NRI** — fill `nri-chat` Edge Function with Anthropic API call
8. **API connectors** — NWS, SSURGO, AirNow, USA-NPN (endpoints in `specs/hortus-api-connector-map.md`)
9. **Push notifications** — fill notification Edge Function crons
10. **Community screens** — connect to real community data
11. **Growing screens** — connect harvest, succession, phenology to real data
12. **PWA** — service worker already configured in `vite.config.ts`
13. **Admin** — gate by `is_admin = true`, build from prototype Shell 3
14. **Tests** — add page render tests, service layer tests

---

## Files to read first

| Priority | File | What it tells you |
|---|---|---|
| 1 | `LOVABLE_HANDOFF.md` | Complete handoff doc — what's done, what to build, NRI intelligence spec, Perplexity map integration |
| 2 | `specs/hortus-lovable-prompt.md` | Master build spec — every rule, schema, route |
| 3 | `specs/hortus-app-prototype.html` | Visual source of truth — open in browser |
| 4 | `specs/hortus-seed-pack-v2.json` | All content: phases, philosophies, crops |
| 5 | `specs/nri-system-prompt.md` | Verbatim NRI system prompt |
| 6 | `specs/hortus-api-connector-map.md` | All 11 external API endpoints |
| 7 | `specs/hortus-garden-mode-addendum.md` | Solo vs community fork |
| 8 | `specs/hortus-demo-mode-addendum.md` | Demo mode at /demo |
| 9 | `specs/hortus-push-notifications.md` | 26 notification events |

---

## What will save you the most credits

1. **Don't rebuild pages that already exist.** All 29 pages render with demo data. Your job is to connect them to real Supabase data and polish the CSS.
2. **Don't redesign.** The prototype HTML IS the design. Extract it.
3. **Don't write new Edge Functions from scratch.** 18 shells exist with structure. Fill in the business logic.
4. **Don't create new database tables.** 28 tables with RLS are migrated. Use them.
5. **Don't invent i18n keys.** 25 namespaces with 600+ keys already exist in en.json.
6. **Work in the build order.** Each step depends on the previous. Don't skip ahead.
7. **Read LOVABLE_HANDOFF.md before writing a single line.**
