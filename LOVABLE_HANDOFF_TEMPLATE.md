# Lovable Handoff Template

**Use this template for every project you hand to Lovable. Adapt the specifics — the structure is universal.**

---

## How to Use This Template

Do NOT paste this entire file as a single message. Lovable processes long prompts selectively — it reads the beginning, skims the middle, and misses the end. Instead, follow the **Sequential Prompt Protocol** below.

### Pre-Handoff Checklist (before you open Lovable)

- [ ] All database migrations are written and tested
- [ ] All Edge Function shells have structure (CORS, auth, rate limit)
- [ ] All pages exist with demo data
- [ ] All services/hooks are typed
- [ ] i18n files have key parity
- [ ] Unit tests pass
- [ ] E2E tests pass with screenshots
- [ ] LOVABLE_HANDOFF.md is complete
- [ ] Demo data JSON files exist in `/data/`
- [ ] `.env.example` lists every required variable

---

## The Sequential Prompt Protocol

### PROMPT 1 — Orientation (no code)

```
I'm handing you a pre-built scaffold for [PROJECT NAME]. Before writing
ANY code, read these files in order:

1. LOVABLE_HANDOFF.md — what's done, what you build
2. [MASTER_SPEC].md — the complete product spec

After reading, answer these questions:
- How many database tables exist in the migrations?
- How many pages are in src/pages/?
- How many Edge Functions are in supabase/functions/?
- What is the build order?
- What is the Definition of Done?

Do not write code. Just answer the questions so I know you read it.
```

**Why:** Forces Lovable to prove it read the spec before touching code. If the answers are wrong, correct them before proceeding.

---

### PROMPT 2 — Database verification

```
Run the database migrations. Verify:
1. All tables exist (list them)
2. RLS is enabled on every table (run: SELECT tablename FROM pg_tables
   WHERE schemaname = 'public' AND NOT rowsecurity)
3. The handle_new_user trigger exists on auth.users
4. The check_rate_limit function exists
5. All helper functions exist (is_community_member,
   get_user_community_role, is_admin_user)

Paste the actual query results. Do not say "verified" — show me the output.
```

**Why:** Lovable often creates tables but forgets triggers and functions. This catches it immediately.

---

### PROMPT 3 — Auth (must work before anything else)

```
Wire authentication. The pages exist at src/pages/auth/. Connect them
to real Supabase auth:

1. Login page: supabase.auth.signInWithPassword() on submit
2. Signup page: supabase.auth.signUp() with display_name in metadata
3. Magic link: supabase.auth.signInWithOtp()
4. Callback page: handle the auth redirect
5. Rate limiting: call check_rate_limit RPC before every auth action

Test by:
- Creating a new account with email+password
- Verifying a row appears in the profiles table
- Logging out and logging back in
- Verifying the auth redirect to /app/home works

Paste the profile row from Supabase after signup. Show me the actual data.
```

**Why:** Auth is the foundation. If signup doesn't create a profile row, onboarding breaks, which breaks everything downstream.

---

### PROMPT 4 — Onboarding (every step must persist)

```
Wire onboarding. The page exists at src/pages/Onboarding.tsx.
Every step must write to the database:

Step 1: Address → create a row in lands table
Step 2: Garden type → update profiles.garden_mode
Step 3: Goals → store on land record
Step 4: Parcel → fetch GIS data or set parcel_skipped=true
Step 5: Budget → store sourcing_preference on land
Step 6: Philosophy → store on land record
Step 7: Crops → create initial plan record

After step 7, redirect to /app/home.

Test by completing all 7 steps, then show me:
- The lands row (paste the full JSON)
- The profiles row (paste garden_mode and other fields)
- The plans row if created
- That /app/home shows the REAL land name, not "Sundown Edge"
```

**Why:** Lovable's #1 failure mode is rendering onboarding steps visually but not persisting them. If the lands row doesn't exist after onboarding, every screen downstream shows demo data forever.

---

### PROMPT 5 — Core screens (real data, not demo)

```
Connect all core app screens to real Supabase data. The pages exist
in src/pages/app/. Each must read from the database, not demo fixtures:

- Home: real land name, phase, weather from NWS cache
- Loam Map: real soil_profile from the lands table
- Weather: real forecast from NWS (or cached)
- Planner: real plots and crops from plots table
- Memory: real observations from observations table
- NRI Chat: real messages sent to Edge Function, stored in nri_chat_messages
- Settings: reads and writes to profiles table

Test by:
1. Navigating to each screen
2. Verifying the data matches what's in the database
3. Adding an observation on the Memory screen
4. Verifying the new row appears in the observations table
5. Sending an NRI message and verifying the response is stored

For each screen, tell me what data source it reads from and whether
it's real or demo.
```

---

### PROMPT 6 — Forms (every form must submit)

```
Wire every form in the app to submit to the database. List:

[LIST EVERY FORM IN YOUR APP — adapt this for each project]

For each form:
1. Fill it out with test data
2. Click submit
3. Show me the database row that was created
4. Verify it appears in the relevant list/feed screen

Do not skip any form. If a form has a submit button, it must create
or update a database row.
```

---

### PROMPT 7 — Edge Functions (no TODOs)

```
Fill in the business logic for every Edge Function. Currently they
have structure (CORS, auth, rate limit) but the core logic is TODO.

For each function:
1. Open supabase/functions/[name]/index.ts
2. Find every TODO comment
3. Replace it with working code
4. The API call structure, request body, response parsing, error
   handling, and database storage must all be written
5. The ONLY thing that can be missing is the actual API key value

List every Edge Function and tell me:
- Does it have any TODO comments remaining? (must be zero)
- What external API does it call?
- What Supabase secret does it need?
```

---

### PROMPT 8 — Navigation & routing

```
Verify every navigation link works:

1. Click every item in the bottom nav — verify it navigates correctly
2. Click every item in the sidebar (desktop) — verify route
3. Click every link on every page — verify no dead ends
4. Test browser back/forward on 5 different routes
5. Navigate to a protected route while logged out — verify redirect
6. Navigate to a community route in solo mode — verify redirect

List any broken links or dead-end routes.
```

---

### PROMPT 9 — Admin section (Lovable ALWAYS skips this)

```
IMPORTANT: You skipped the admin section on the last project. Do not
skip it this time.

Build the admin console gated by is_admin=true on the profiles table.
[LIST YOUR ADMIN FEATURES]

Test by:
1. Setting is_admin=true on your test user in Supabase
2. Verifying the admin routes are accessible
3. Verifying non-admin users cannot access admin routes
4. Verifying each admin screen shows real data
```

---

### PROMPT 10 — Prove you're done

```
Before I review, walk through this verification script. For EACH item,
paste the ACTUAL result — not "it works" but the specific data you see.

1. Create a brand new account with email test-[timestamp]@example.com
2. Complete onboarding with address "4821 Oak Street, Savage, MN 55378"
3. Screenshot the home screen — what land name and phase does it show?
4. Go to Memory, add a note: "First crocus spotted near east fence"
   - Paste the observations table row
5. Go to NRI Chat, send: "What should I plant this week?"
   - Paste the nri_chat_messages rows (user + assistant)
6. Go to Planner, add a bed named "South Bed" with type "raised"
   - Paste the plots table row
7. Go to Harvest, log: 3 lbs of lettuce
   - Paste the harvest_logs row
8. Go to Settings, change language mode to "Gardener"
   - Paste the profiles row showing the change
9. Toggle language to Spanish — do all strings change?
10. Open browser DevTools Network tab — are there any failed requests?
11. Go offline (DevTools > Network > Offline), add an observation
    - Does the offline indicator appear?
    - Go back online — does it sync?
12. Set is_admin=true on your profile, navigate to admin console
    - Does it load? List the screens that work.

If ANY of these fail, tell me which ones and fix them before declaring done.
```

---

## Common Lovable Failure Modes

Include this in your first message so Lovable is forewarned:

```
KNOWN FAILURE MODES — Do not repeat these mistakes:

1. DO NOT declare done when pages render with demo data but aren't
   connected to real Supabase data. Every screen must read from the
   database.

2. DO NOT create Edge Function shells with TODO comments. Every
   function must have complete business logic. API keys are the LAST
   step — the code must be written first.

3. DO NOT skip the admin section. It is in the spec. Build it.

4. DO NOT embed HTML files in iframes. Convert them to React components.

5. DO NOT forget database triggers. If a migration creates a trigger,
   verify it exists after running migrations.

6. DO NOT create forms that don't submit. Every form with a submit
   button must create or update a database row.

7. DO NOT use your AI Gateway for features that specify a particular
   model. If the spec says "claude-sonnet-4-6 via Anthropic API",
   use that exact model, not Gemini or your built-in AI.

8. DO NOT skip demo mode wiring. If a DemoProvider exists, verify
   it actually feeds fixture data to components.

9. DO NOT leave navigation dead-ends. Every link must go somewhere.
   Every back button must work.

10. DO NOT claim "verified" without showing proof. Paste the actual
    database row, the actual screenshot, the actual network response.
```

---

## Adapting This Template

For each of your 6 projects, customize:

1. **PROMPT 1** — Change the file names to your project's spec files
2. **PROMPT 3** — Adjust auth flow (some projects may have OAuth, SSO, etc.)
3. **PROMPT 4** — Replace onboarding steps with your project's setup flow
4. **PROMPT 5** — List your specific screens and their data sources
5. **PROMPT 6** — List every form in your app
6. **PROMPT 7** — List your specific Edge Functions
7. **PROMPT 9** — List your specific admin features
8. **PROMPT 10** — Customize the 12-step verification for your app

The structure stays the same. The specifics change per project.

---

## The One Rule

**Never let Lovable batch multiple steps.** One prompt = one step = one verification. If Lovable tries to "do steps 3-7 together to save time," say no. Sequential verification catches errors at the source instead of discovering them three steps later.

---

## Credit Budget Estimate

Based on the Hortus experience:

| Phase | Prompts | Expected credits |
|---|---|---|
| Orientation + DB | 2 | Low |
| Auth + Onboarding | 2 | Medium |
| Core screens | 1-2 | Medium |
| Forms + Edge Functions | 2-3 | Medium-High |
| Navigation + Admin | 2 | Medium |
| Verification + fixes | 2-4 | Medium |
| **Total** | **11-15 prompts** | |

Without the sequential protocol, expect 25-40 prompts (Lovable declares done at prompt 8, you spend 15-30 more fixing what it missed). The protocol cuts total prompts by 40-60%.

---

## File Placement

Save this as `LOVABLE_HANDOFF_TEMPLATE.md` in your project templates directory. For each new project, copy it, customize prompts 1-10, and use it as your conversation guide — not a file you paste into Lovable, but a script you follow prompt by prompt.
