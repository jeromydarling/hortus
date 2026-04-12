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

## DEFINITION OF DONE — Read This Before You Think You're Finished

**The site is NOT done when it compiles. The site is NOT done when pages render. The site is done when EVERYTHING is wired front to back.**

A page that renders with demo data but doesn't read from Supabase is scaffolding, not a feature. A form that displays inputs but doesn't submit to the database is decoration. An Edge Function shell with TODO comments is unfinished work.

### Every feature must be wired end-to-end:

**Auth must work:**
- [ ] Login with email+password calls `supabase.auth.signInWithPassword()` and redirects to `/app/home`
- [ ] Signup creates a real user, triggers `handle_new_user()`, creates a profile row
- [ ] Magic link sends a real email and the callback at `/auth/callback` completes the session
- [ ] Rate limiting calls `check_rate_limit` RPC before every auth action
- [ ] Protected routes redirect unauthenticated users to `/auth/login`
- [ ] Users without a land record redirect to `/onboarding`

**Onboarding must persist:**
- [ ] Step 1 address is geocoded and stored on the land record
- [ ] Step 2 garden_mode is written to the profiles table
- [ ] Step 4 parcel data is fetched from GIS or skipped with `parcel_skipped: true`
- [ ] Step 5 budget preference is stored on the land record
- [ ] Step 6 philosophy is stored on the land record
- [ ] NWS grid point is resolved from lat/lon and stored on the land record
- [ ] SSURGO soil data is fetched and stored as `soil_profile` on the land record
- [ ] Hardiness zone is resolved and stored
- [ ] NRI ground reading is generated via the `nri-ground-read` Edge Function
- [ ] After step 7, the user lands on `/app/home` with real data, not demo data

**Every screen must read from Supabase, not demo fixtures:**
- [ ] Home screen shows the user's real land name, phase, weather, and Rule of Life
- [ ] Loam Map shows the user's real soil profile from SSURGO
- [ ] Weather screen shows real NWS forecast data
- [ ] Planner shows the user's real plots and crops
- [ ] Memory shows the user's real observation history
- [ ] NRI Chat sends real messages to the `nri-chat` Edge Function and stores responses
- [ ] Common Year shows the user's real phase history
- [ ] Harvest log reads from and writes to `harvest_logs` table
- [ ] Settings reads from and writes to `profiles` table
- [ ] All community screens read from real community data when `garden_mode === 'community'`

**Every form must submit to the database:**
- [ ] "Add note" on Memory creates a row in `observations`
- [ ] "Log harvest" creates a row in `harvest_logs`
- [ ] "Add Bed" creates a row in `plots`
- [ ] "Post Seeds" creates a row in `seed_exchanges`
- [ ] "Log Hours" creates a row in `volunteer_hour_logs`
- [ ] "RSVP" creates/updates a row in `workday_rsvps`
- [ ] "Post Surplus" creates a row in `sharing_posts`
- [ ] Settings changes update the `profiles` row
- [ ] Onboarding steps write to `lands` and `profiles`

**Every Edge Function must have real business logic:**
- [ ] `nri-chat` calls Anthropic API with the verbatim system prompt and full context object
- [ ] `nri-ground-read` calls SSURGO, then Anthropic for trilingual interpretation
- [ ] `nri-phase-detect` queries user data and calls Anthropic for phase detection
- [ ] `nri-rule-of-life` generates weekly rhythm from real user data via Anthropic
- [ ] `nri-voice-log` processes transcripts and extracts structured tags
- [ ] `create-checkout` creates a real Stripe Checkout session
- [ ] `stripe-webhook` verifies signature and updates `profiles` subscription fields
- [ ] `search-food-systems` calls Perplexity and stores results in `food_system_points`
- [ ] `frost-monitor` fetches NWS hourly forecast and fires push notifications
- [ ] `morning-briefing` generates personalized NRI briefings via Anthropic
- [ ] `photo-analyze` calls Plant.id API and stores results
- [ ] `nri-whatsapp` receives WhatsApp webhooks and responds via NRI

**API keys are the LAST step, not a reason to skip wiring:**
- [ ] All Edge Functions that call external APIs (Anthropic, Stripe, Plant.id, Perplexity, WhatsApp) must be fully coded with the API call structure, error handling, and response processing. The ONLY thing missing should be the actual API key value in the Supabase dashboard secrets. If you can't test because you don't have a key, that's fine — but the code must be complete and correct.
- [ ] Never leave a `// TODO: call API` comment. Write the fetch call, the request body, the response parsing, the error handling, and the database storage. Just leave the key as `Deno.env.get("KEY_NAME")`.

**Navigation must work end-to-end:**
- [ ] Bottom nav navigates between all 5 main sections
- [ ] NRI compass button opens the NRI chat
- [ ] Sidebar (desktop) shows all sections including Community (if community mode) and coordinator routes
- [ ] Clicking a seed exchange post navigates to detail
- [ ] Ancient Library CTA cards navigate to the correct sub-pages
- [ ] "Back" buttons work everywhere
- [ ] Browser back/forward works on all routes

**The NRI intelligence layer must be mounted:**
- [ ] `useNRINudgeEngine` is called with real signals from the user's data
- [ ] `useNRIGlow` makes the compass button glow when high-confidence nudges exist
- [ ] `useNRIAutoOpen` opens the NRI drawer on first daily login
- [ ] `useNRIGuide` shows first-visit explanations for the first 3 days
- [ ] `useNRIPosture` adapts NRI's opening line based on the current route

**Offline must work:**
- [ ] `OfflineIndicator` shows in the app shell when offline
- [ ] Observations queue in IndexedDB when offline and sync when back online
- [ ] Visits queue in IndexedDB when offline

**How to verify you're actually done:**
1. Create a new account with email+password
2. Complete all 7 onboarding steps with a real address
3. Verify the home screen shows real data (not "Sundown Edge" demo data)
4. Log an observation and verify it appears in the Memory screen
5. Send a message to NRI and verify you get a response
6. Add a bed in the Planner and verify it persists on reload
7. Log a harvest and verify it appears in the Harvest log
8. Check the Food Resilience Score updates based on your actual data
9. Toggle language to Spanish and verify all strings change
10. Go offline, log an observation, go back online, verify it syncs
11. If community mode: create a community, invite a member, schedule a workday
12. If coordinator: see the coordinator dashboard with real assigned gardens

**If any of these fail, you are not done. Keep building.**

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
