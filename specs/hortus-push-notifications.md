# Hortus Push Notification Event Map
**Version 1.0 · All events, NRI voice, cadence, quiet hours, and Supabase Edge Function triggers**

---

## Architecture

Notifications are delivered via **Supabase Edge Functions** triggering **Expo Push Notifications** (React Native) or **Web Push API** (browser). Every notification is generated in NRI voice — never generic alert language.

**Default state: silent.** Users opt in per category during onboarding and can adjust in Settings → Notifications. No notification fires without explicit opt-in except the safety override.

**Safety override:** Frost risk and severe weather alerts fire regardless of quiet hours or opt-in state. This is disclosed during onboarding: "Some alerts — frost tonight, severe storms — will always reach you. Everything else is your call."

---

## Quiet Hours

Default: **9:00 PM – 6:00 AM** local time.

All non-safety notifications are held until quiet hours end, then delivered as a batch in order of priority. Safety alerts (frost, severe weather, suspend state) bypass quiet hours unconditionally.

User-configurable in Settings → Notifications → Quiet hours.

---

## Priority Tiers

| Tier | Description | Quiet hours | Examples |
|---|---|---|---|
| **P0 — Safety** | Immediate danger to plants or people | Bypass always | Hard freeze, severe storm, lightning |
| **P1 — Urgent** | Time-sensitive action window closing | Deliver at quiet hours end | Planting window opens, frost risk in 24h |
| **P2 — Scheduled** | Predictable cadence, user-set | Respect quiet hours | Weekly Rule of Life, workday reminder |
| **P3 — Ambient** | Soft nudges, encouragement | Respect quiet hours | Observation streak, seasonal milestone |

---

## Event Registry

### WEATHER & HAZARD (P0–P1)

---

#### FROST_ALERT
**Trigger:** NWS hourly forecast shows overnight low < 34°F within 18 hours  
**Priority:** P0  
**Quiet hours:** Bypass  
**Supabase function:** `edge/frost-monitor` — runs every 30 min

**NRI message:**
> Frost tonight at Sundown Edge — low of 29°F expected. Cover tender transplants before dusk. Your peas are fine. Your tomato starts are not.

**Personalization variables:** `land.displayName`, tonight's forecast low, crops currently in `planted` or `growing` status that are frost-sensitive.

**Suppressed when:** User has no frost-sensitive crops in active plots. Still fires if any warm-season transplants are in ground.

---

#### FREEZE_WARNING
**Trigger:** NWS issues Freeze Warning (28°F or below for 2+ hours)  
**Priority:** P0  
**Quiet hours:** Bypass

**NRI message:**
> Hard freeze warning at Sundown Edge — 26°F before dawn. Bring in containers. Mulch perennial crowns. Don't wait until morning.

---

#### PLANTING_WINDOW_OPENS
**Trigger:** NWS 7-day forecast shows no temps below 36°F AND soil temp estimate > 50°F AND phase is `firstSigns` or `planting`  
**Priority:** P1  
**Quiet hours:** Deliver at 6 AM

**NRI message:**
> Verso l'alto. The frost window looks clear for the next ten days at Sundown Edge. Your planting window has opened. Warm crops can go out this weekend.

**Fires once per season.** Suppressed after firing until next `preparation` phase.

---

#### PLANTING_WINDOW_CLOSING
**Trigger:** First fall frost within 14 days, phase is `abundance` or `preservation`  
**Priority:** P1  
**Quiet hours:** Deliver at 6 AM

**NRI message:**
> First frost likely around October 4 at Sundown Edge — about two weeks away. Harvest green tomatoes if nights drop below 45°F. Garlic goes in after the first hard frost.

---

#### SEVERE_WEATHER
**Trigger:** NWS issues Thunderstorm Warning, Tornado Watch/Warning, or Severe Storm  
**Priority:** P0  
**Quiet hours:** Bypass

**NRI message:**
> Severe weather warning near Sundown Edge. Stay out of the garden. Secure anything loose. Check back when the warning expires.

---

#### HAZARD_STATE_CHANGE
**Trigger:** Operational state changes from `clear` to `caution`, `delay`, `protect`, or `suspend`  
**Priority:** P1  
**Quiet hours:** P0 states bypass; others deliver at quiet hours end

**NRI messages by state:**
- `caution`: "Conditions at Sundown Edge are tricky today — wind and moderate rain. Nothing urgent, but read the weather before heading out."
- `delay`: "Your ground is likely too wet to work after this morning's rain. Wait until tomorrow afternoon before shaping beds."
- `protect`: "Frost risk tonight at Sundown Edge. Cover tender transplants before dusk."
- `suspend`: "Thunderstorm warning near Sundown Edge. Stand down for now — the garden can wait."

---

#### AIR_QUALITY_ALERT
**Trigger:** AirNow AQI > 100 (Unhealthy for Sensitive Groups)  
**Priority:** P1  
**Quiet hours:** Deliver at quiet hours end

**NRI message:**
> Air quality near Sundown Edge is poor today — AQI 118. Limit outdoor time, especially for long work sessions. Short essential checks are fine. Heavy labor can wait.

---

### NRI CHECK-INS (P2)

---

#### WEEKLY_RULE_OF_LIFE
**Trigger:** Monday at 7:00 AM local time (user-configured day/time)  
**Priority:** P2  
**Quiet hours:** Respect

**NRI message:**
> Verso l'alto. This week at Sundown Edge: your ground is still cool but workable. Peas go in this week — before the soil warms past 65°F they'll lose vigor. Keep the new bed covered until Thursday's frost risk passes. What have you noticed in the past seven days?

**Generated fresh each week** from current phase, forecast, crop plan, and recent observations. Never canned. Calls NRI via Anthropic API during Edge Function execution.

---

#### DAILY_OBSERVATION_NUDGE
**Trigger:** User has not logged an observation today by 5:00 PM local  
**Priority:** P3  
**Quiet hours:** Respect  
**Opt-in:** Off by default

**NRI message (rotates):**
- "Sundown Edge is out there. One thing you noticed today is enough."
- "A 30-second voice note counts. What's the ground doing?"
- "Your observation streak is at {streak} days. Today keeps it alive."

**Suppressed when:** User has already logged today. Suppressed on days when operational state is `suspend`.

---

#### OBSERVATION_STREAK_MILESTONE
**Trigger:** User reaches 7, 14, 30, 60, 100 consecutive observation days  
**Priority:** P3  
**Quiet hours:** Respect

**NRI message (30-day example):**
> Thirty days of noticing. That's a month of Sundown Edge remembered. You've logged six phenology events, two pest sightings, and forty-one field notes. The garden knows you're watching.

---

#### MONTHLY_SUMMARY
**Trigger:** First of the month at 8:00 AM local  
**Priority:** P2  
**Quiet hours:** Respect

**NRI message (April example):**
> March at Sundown Edge is behind you. You planted 3 beds, logged 14 observations, and spotted the first crocus 7 days earlier than last year. April asks more of you — First Signs is giving way to Planting. Your frost window closes around May 3.

Generated fresh via NRI API call with full phaseHistory and harvestLog context.

---

### SEASONAL & PHENOLOGY (P1–P2)

---

#### PHASE_TRANSITION
**Trigger:** NRI phase detection fires with confidence > 0.75 and phase changes  
**Priority:** P1  
**Quiet hours:** Deliver at 6 AM

**NRI message (First Signs → Planting):**
> Verso l'alto. Sundown Edge has moved into Planting. The dandelions confirmed it — your frost window is closing. This is the brief, generous window. Act with sequence: peas and greens first, warm crops after May 3.

**Fires once per phase transition.** Each of the 8 transitions has a distinct NRI voice note.

---

#### PHENOLOGY_MILESTONE
**Trigger:** USA-NPN data or user log records a first-of-season event (first crocus, first earthworm, forsythia 50%)  
**Priority:** P2  
**Quiet hours:** Respect

**NRI message (forsythia example):**
> Forsythia at 50% bloom near Sundown Edge — the old signal. Your last spring frost is typically 3–4 weeks away. Begin hardening off transplants if you haven't already.

---

#### FROST_COUNTDOWN_MILESTONE
**Trigger:** Days until last spring frost reaches 14, 7, 3, 1  
**Priority:** P1 (7d and under); P2 (14d)  
**Quiet hours:** Respect

**NRI messages:**
- 14 days: "Two weeks to Sundown Edge's frost-free window. Time to harden off tomatoes and peppers outdoors for a few hours each day."
- 7 days: "One week. Frost risk drops to near zero after May 3. Get your warm starts ready."
- 3 days: "Three days. Your warm crops can go out Sunday if the forecast holds."
- 1 day: "Tomorrow is your frost-free date at Sundown Edge. Check the hourly forecast tonight before planting."

---

### COMMUNITY (P1–P2)

---

#### WORKDAY_REMINDER_24H
**Trigger:** Scheduled workday in 24 hours  
**Priority:** P2  
**Quiet hours:** Respect

**NRI message:**
> Tomorrow's workday at Sundown Edge starts at 9 AM. Forecast: 54°F, partly cloudy — good conditions. Focus: spring bed prep and Bed 3 frame build. Eight members RSVPed. Bring your broadfork if you have one.

**Suppressed when:** NRI hazard state is `suspend` for that time window. Replacement message fires instead: "Tomorrow's workday has been flagged — thunderstorm risk in the forecast. Watch for an update from your coordinator."

---

#### WORKDAY_REMINDER_1H
**Trigger:** Scheduled workday in 1 hour  
**Priority:** P1  
**Quiet hours:** Bypass if within working hours (6 AM – 9 PM)

**NRI message:**
> One hour to the Sundown Edge workday. Weather is clear. See you there.

---

#### WORKDAY_HAZARD_POSTPONE
**Trigger:** NRI operational state reaches `suspend` or `protect` within 48h of a scheduled workday  
**Priority:** P1  
**Quiet hours:** Deliver at quiet hours end

**NRI message:**
> The workday scheduled for Saturday at Sundown Edge has a weather conflict — frost risk Friday night may leave the ground too wet to work by 9 AM. Your coordinator has been notified. Watch for an update.

---

#### SHARING_BOARD_POST
**Trigger:** New `SharingPost` with `type: surplus` posted to user's community  
**Priority:** P3  
**Quiet hours:** Respect  
**Opt-in:** Off by default

**NRI message:**
> Maya R. posted surplus kale at Sundown Edge — about 4 lbs, in the shared bin by the gate. First come, first served.

**Rate limited:** Max 2 sharing board notifications per day per user.

---

#### DIRECT_MESSAGE
**Trigger:** New `Message` with `isDirect: true` addressed to user  
**Priority:** P2  
**Quiet hours:** Respect

**NRI message:**
> Marcus T. sent you a message at Sundown Edge Community Garden.

Plain delivery — no message content in the notification for privacy.

---

#### NRI_COMMUNITY_SIGNAL
**Trigger:** NRI generates a new `NRISignal` for a member in the coordinator's garden  
**Priority:** P2  
**Quiet hours:** Respect  
**Recipient:** Garden coordinator / admin only

**NRI message (checkin example):**
> Marcus T. hasn't logged in 11 days and missed the last two workdays. A quiet check-in this week might be worth it.

**NRI message (mentor candidate):**
> Maya R. is in her third season with consistent records and strong engagement. She may be ready to mentor a newer member.

---

### GROWING (P2–P3)

---

#### SUCCESSION_GAP_ALERT
**Trigger:** Active succession schedule shows a bed going empty in 14 days with no crop assigned  
**Priority:** P2  
**Quiet hours:** Respect

**NRI message:**
> Bed 2 at Sundown Edge will be empty in about two weeks when the peas finish. Bush beans can go straight in — 60-day crop, no gap. Want to add them to your plan?

---

#### HARVEST_REMINDER
**Trigger:** Crop in a plot has been in `growing` status past its `daysToHarvest` max  
**Priority:** P2  
**Quiet hours:** Respect

**NRI message:**
> Your lettuce in Bed 1 at Sundown Edge is past its peak window. Harvest the outer leaves now before it bolts. Daily picking at this stage is the right rhythm.

---

#### SEED_ORDER_TIMING
**Trigger:** Active plan has `ordered: false` seeds with `plantBy` dates within 21 days  
**Priority:** P1  
**Quiet hours:** Deliver at 6 AM

**NRI message:**
> Your tomato seeds aren't ordered yet — they need to be started indoors by April 10. Seeds Now has Brandywine in stock. Order this week.

Includes deep link to seed sourcing screen with pre-filled cart.

---

### ADMIN (P1–P2)
*(Fires only for Master Gardener account)*

---

#### CONTENT_DRAFT_READY
**Trigger:** `AdminContentDraft` created with `status: draft` by Gemini Flash  
**Priority:** P2  
**Quiet hours:** Respect

**Message:**
> A new SEO post is ready for your review: "What to Plant in Zone 4b This Week." Approve, edit, or reject.

---

#### AFFILIATE_WEEKLY_SUMMARY
**Trigger:** Every Friday at 9:00 AM  
**Priority:** P3  
**Quiet hours:** Respect

**Message:**
> This week: 312 Seeds Now clicks, 52 conversions, est. $234 commission. Top crop: Lacinato Kale (18 sales).

---

#### NRI_QUALITY_FLAG
**Trigger:** User thumbs-down on an NRI response, or NRI response ignored for > 5 min  
**Priority:** P2  
**Quiet hours:** Respect

**Message:**
> An NRI response was flagged. Review it in Master Gardener → NRI Quality before it affects more users.

---

## Notification Delivery Summary

| Event | Priority | Quiet hours | Opt-in default | Recipient |
|---|---|---|---|---|
| Frost alert | P0 | Bypass | On | Gardener |
| Freeze warning | P0 | Bypass | On | Gardener |
| Planting window opens | P1 | 6 AM delivery | On | Gardener |
| Planting window closing | P1 | 6 AM delivery | On | Gardener |
| Severe weather | P0 | Bypass | On | Gardener |
| Hazard state change | P1/P0 | Varies | On | Gardener |
| Air quality alert | P1 | Quiet end | On | Gardener |
| Weekly Rule of Life | P2 | Respect | On | Gardener |
| Daily observation nudge | P3 | Respect | **Off** | Gardener |
| Observation streak milestone | P3 | Respect | On | Gardener |
| Monthly summary | P2 | Respect | On | Gardener |
| Phase transition | P1 | 6 AM delivery | On | Gardener |
| Phenology milestone | P2 | Respect | On | Gardener |
| Frost countdown | P1/P2 | Respect | On | Gardener |
| Workday reminder 24h | P2 | Respect | On | Community |
| Workday reminder 1h | P1 | Bypass (daytime) | On | Community |
| Workday hazard postpone | P1 | Quiet end | On | Community |
| Sharing board post | P3 | Respect | **Off** | Community |
| Direct message | P2 | Respect | On | Community |
| NRI community signal | P2 | Respect | On | Coordinator only |
| Succession gap alert | P2 | Respect | On | Gardener |
| Harvest reminder | P2 | Respect | On | Gardener |
| Seed order timing | P1 | 6 AM delivery | On | Gardener |
| Content draft ready | P2 | Respect | On | Admin only |
| Affiliate weekly summary | P3 | Respect | On | Admin only |
| NRI quality flag | P2 | Respect | On | Admin only |

---

## Supabase Edge Functions Required

| Function | Trigger | Schedule |
|---|---|---|
| `frost-monitor` | Checks NWS hourly forecast | Every 30 min |
| `hazard-engine` | Computes operational state from NWS + AirNow | Every 30 min |
| `phenology-sync` | Pulls USA-NPN data for active user locations | Daily at 3 AM |
| `phase-detector` | Runs NRI phase detection for each user | Daily at 4 AM |
| `rule-of-life-generator` | Calls NRI API to generate weekly Rule of Life | Monday at 5 AM |
| `monthly-summary` | Calls NRI API for monthly summary per user | 1st of month at 5 AM |
| `succession-checker` | Checks for upcoming bed gaps | Daily at 6 AM |
| `harvest-reminder` | Checks crop status against daysToHarvest | Daily at 7 AM |
| `seed-order-alerts` | Checks plan seedList for unordered items | Daily at 6 AM |
| `affiliate-weekly` | Aggregates AffiliateEvent records | Friday at 8 AM |
| `nri-quality-monitor` | Scans for flagged/ignored NRI responses | Every 4 hours |

---

## NRI Voice Principles for Notifications

Every notification is written as NRI would say it — not as a system alert:

| Don't | Do |
|---|---|
| "⚠️ FROST WARNING: Temperatures will drop below 32°F tonight" | "Frost tonight at Sundown Edge — low of 29°F. Cover tender transplants before dusk." |
| "Your planting window is now open. Click here to plant." | "Verso l'alto. The frost window looks clear for ten days. Your planting window has opened." |
| "You haven't logged an observation today." | "Sundown Edge is out there. One thing you noticed today is enough." |
| "New message from Marcus T." | "Marcus T. sent you a message at Sundown Edge Community Garden." |
| "Workday tomorrow at 9 AM" | "Tomorrow's workday starts at 9 AM. Forecast: clear. Eight members are coming." |

**Rules:**
- Named place always ("at Sundown Edge") — never "your garden"
- Specific always — named crops, specific temps, specific dates
- One clear action — never a list
- Verso l'alto only on openings of significance (phase transitions, planting window, Rule of Life)
- No exclamation marks
- No emoji in body text (header emoji in notification banner is acceptable per platform convention)
