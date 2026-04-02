# Hortus — Demo Mode Addendum
**Addendum to `hortus-lovable-prompt.md` · Build this after the core app is complete**

---

## What This Is

Build a fully functional demo mode accessible at `/demo` — no account required, no data saved, full product experience including live NRI. This serves two purposes:

1. **Public visitors** — anyone can explore the full app before signing up
2. **Perplexity AI computer / automated testing** — the demo must be navigable by a browser agent without auth, with predictable structure and accessible selectors

The demo should feel indistinguishable from the real app. It is not a tour, a slideshow, or a limited preview. Every screen works. Every button does something. NRI responds. The only difference is nothing persists beyond the session.

---

## Route

```
/demo                    → enters demo mode, lands on home screen
/demo/[screen]           → deep link to any screen in demo mode
```

Add a persistent banner at the top of every demo screen:

```
🌱 Demo mode · Your session resets when you close this tab · [Start for real →]
```

"Start for real →" links to `/auth/signup`. Banner is dismissible per session (localStorage flag). Height is fixed — it does not shift layout.

---

## Demo User Fixture

Pre-seed a complete, coherent demo dataset. This is the same garden shown in the prototype. Every screen reads from this fixture — nothing is fetched from a real user's Supabase row.

```ts
// src/demo/fixture.ts
export const DEMO_FIXTURE = {
  user: {
    id: 'demo-user',
    name: 'Demo Gardener',
  },
  land: {
    id: 'demo-land',
    displayName: 'Sundown Edge',
    address: '4821 Oak Street, Savage, MN 55378',
    zip: '55378',
    hardinessZone: '4b',
    philosophy: 'backToEden',
    languageMode: 'plain',
    frostDates: { lastSpring: '2026-05-03', firstFall: '2026-10-01' },
    currentPhase: {
      phaseId: 'firstSigns',
      confidence: 0.88,
      detectedAt: new Date().toISOString(),
      reason: 'Forsythia at 45% bloom. Soil temp 41°F at 4 inches. Frost risk remains through May 3.'
    },
    soilProfile: {
      texture: { plain: 'Sandy loam — holds shape but drains well', gardener: 'Sandy loam', source: 'Loamy sand, USDA textural class', value: 'Sandy loam' },
      drainage: { plain: 'Water drains in about an hour after rain', gardener: 'Well drained', source: 'NRCS drainage class A/B', value: 'Well drained' },
      pH: { plain: 'Slightly acidic — good for most vegetables', gardener: 'pH 6.4', source: 'pH 6.4 (1:1 water method)', value: 6.4 },
      organicMatter: { plain: 'Decent amount of life in the soil', gardener: '3.2% organic matter', source: 'SOM 3.2%', value: '3.2%' },
      depth: { plain: '18 inches before you hit dense subsoil', gardener: 'Effective rooting depth ~18 in', source: 'Depth to restrictive layer: 46cm', value: 18 },
      slope: { plain: 'Gentle slope toward the southeast', gardener: '2–4% SE slope', source: 'Percent slope from DEM: 2.8%', value: 2.8 },
      waterHolding: { plain: 'Holds water reasonably well — mulch helps', gardener: 'AWC 0.17 in/in', source: 'Available water capacity 0.17 in/in', value: '0.17 in/in' },
      workability: { plain: 'Easy to dig — good structure', gardener: 'High workability', source: 'Derived: ksat 15 μm/s, low compaction risk', value: 'High' },
      floodRisk: { plain: 'Not in a flood zone', gardener: 'Flood zone X — minimal risk', source: 'FEMA designation: Zone X', value: 'Zone X' },
    },
    sunExposure: { bestSpot: 'Southwest corner — 6.5 hours direct sun', hoursEstimate: 6.5 },
    phaseHistory: [
      { phaseId: 'rest', date: '2025-12-01', confidence: 0.95, reason: 'Ground frozen, under 10h daylight' },
      { phaseId: 'preparation', date: '2026-02-15', confidence: 0.87, reason: 'Daylight lengthening, forsythia buds swelling' },
      { phaseId: 'firstSigns', date: '2026-03-20', confidence: 0.88, reason: 'Forsythia bloom, soil temp crossing 40°F' },
    ],
    sourcingPreference: { organic: false, local: true, budget: 'thrifty' },
  },
  plots: [
    {
      id: 'demo-plot-1',
      landId: 'demo-land',
      name: 'Bed 1',
      type: 'raised',
      dimensions: { length: 8, width: 4 },
      sunHours: 6.5,
      crops: [
        { cropName: 'Sugar Snap Peas', plantedDate: null, status: 'planned', seedSource: 'seedsNow', notes: 'Direct sow after May 3' },
        { cropName: 'Lettuce mix', plantedDate: null, status: 'planned', seedSource: 'seedsNow', notes: 'Start indoors now' },
      ]
    },
    {
      id: 'demo-plot-2',
      landId: 'demo-land',
      name: 'Bed 2',
      type: 'raised',
      dimensions: { length: 8, width: 4 },
      sunHours: 6.0,
      crops: [
        { cropName: 'Tomatoes (Brandywine)', plantedDate: null, status: 'planned', seedSource: 'seedsNow', notes: 'Start indoors Apr 10' },
        { cropName: 'Basil', plantedDate: null, status: 'planned', seedSource: 'seedsNow', notes: 'Start with tomatoes' },
      ]
    },
  ],
  observations: [
    { id: 'obs-1', type: 'note', content: 'Saw first crocus near the east fence. Small and purple.', phaseAtTime: 'firstSigns', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), tags: ['crocus', 'east fence', 'first signs'] },
    { id: 'obs-2', type: 'voice', content: 'Checked the chip pile — still plenty there from last fall. Bed 1 edges look like they need a refresh though. Maybe 2 inches thin.', phaseAtTime: 'firstSigns', createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), tags: ['chip pile', 'Bed 1', 'mulch'] },
    { id: 'obs-3', type: 'note', content: 'Forsythia on the neighbor\'s fence is starting to open. Maybe 30% bloom. Getting close.', phaseAtTime: 'firstSigns', createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), tags: ['forsythia', 'phenology', 'phase signal'] },
  ],
  weather: {
    state: 'caution',
    headline: 'Frost risk through May 3',
    forecast: 'Partly cloudy, high 52°F. Overnight low 34°F — frost advisory in effect.',
    aqi: 18,
  },
  activePlan: {
    id: 'demo-plan-1',
    name: 'Spring 2026',
    philosophy: 'backToEden',
    cropPatternId: 'firstGarden',
    status: 'active',
    seedList: [
      { cropName: 'Sugar Snap Peas', variety: 'Oregon Sugar Pod', quantity: '1 packet', source: 'seedsNow', seedsNowUrl: 'https://www.seedsnow.com/collections/pea-seeds?ref=HORTUS_AFFILIATE', estimatedCost: 2.99, ordered: false, plantBy: '2026-05-03' },
      { cropName: 'Lettuce mix', variety: 'Mesclun', quantity: '1 packet', source: 'seedsNow', seedsNowUrl: 'https://www.seedsnow.com/collections/lettuce-seeds?ref=HORTUS_AFFILIATE', estimatedCost: 2.49, ordered: true, plantBy: '2026-04-15' },
      { cropName: 'Tomatoes', variety: 'Brandywine', quantity: '1 packet', source: 'seedsNow', seedsNowUrl: 'https://www.seedsnow.com/collections/tomato-seeds?ref=HORTUS_AFFILIATE', estimatedCost: 3.49, ordered: false, plantBy: '2026-04-10' },
    ],
  },
};
```

---

## Demo Mode Architecture

### Context Provider

Wrap the `/demo` route tree in a `DemoProvider` that replaces all Supabase calls with fixture data:

```ts
// src/demo/DemoProvider.tsx
import { createContext, useContext, useState } from 'react';
import { DEMO_FIXTURE } from './fixture';

interface DemoContextType {
  isDemo: boolean;
  land: typeof DEMO_FIXTURE.land;
  plots: typeof DEMO_FIXTURE.plots;
  observations: typeof DEMO_FIXTURE.observations;
  weather: typeof DEMO_FIXTURE.weather;
  activePlan: typeof DEMO_FIXTURE.activePlan;
  nriMessageCount: number;
  incrementNRICount: () => void;
  addObservation: (obs: any) => void;
  sessionObservations: any[];
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [nriMessageCount, setNRIMessageCount] = useState(0);
  const [sessionObservations, setSessionObservations] = useState<any[]>([]);

  return (
    <DemoContext.Provider value={{
      isDemo: true,
      land: DEMO_FIXTURE.land,
      plots: DEMO_FIXTURE.plots,
      observations: [...DEMO_FIXTURE.observations, ...sessionObservations],
      weather: DEMO_FIXTURE.weather,
      activePlan: DEMO_FIXTURE.activePlan,
      nriMessageCount,
      incrementNRICount: () => setNRIMessageCount(n => n + 1),
      addObservation: (obs) => setSessionObservations(prev => [obs, ...prev]),
      sessionObservations,
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
};
```

### Routing

```ts
// In your router
<Route path="/demo" element={<DemoProvider><DemoLayout /></DemoProvider>}>
  <Route index element={<HomeScreen />} />
  <Route path=":screen" element={<DemoScreen />} />
</Route>
```

All screens under `/demo` use `useDemo()` instead of `useAuth()` + Supabase hooks. Use a pattern like:

```ts
// In each screen, detect demo mode and use fixture data
const demo = useContext(DemoContext);
const { data: land } = demo
  ? { data: demo.land }
  : useLands();  // real Supabase hook
```

Or cleaner — abstract into a `useActiveLand()` hook that checks for demo context automatically.

---

## NRI in Demo Mode

NRI makes real Anthropic API calls in demo mode — but rate-limited and pre-contexted.

### Rate limit
- **5 messages per demo session**
- After 5: show a soft wall — "You've had a taste of NRI. Start your free trial to keep the conversation going." with a signup CTA. Do not hard-block — show the wall below the last response, not instead of it.
- Track count in `DemoContext.nriMessageCount` (session only, not persisted)

### Pre-loaded context
The NRI Edge Function receives the full demo context object (from `DEMO_FIXTURE`) instead of fetching from Supabase. Add a `demo: true` flag to the request:

```ts
// In the demo NRI call
const response = await supabase.functions.invoke('nri-chat', {
  body: {
    message: userMessage,
    demo: true,
    context: {
      user: { name: 'Demo Gardener' },
      land: DEMO_FIXTURE.land,
      weather: DEMO_FIXTURE.weather,
      recentObservations: DEMO_FIXTURE.observations.map(o => o.content),
      activePlan: DEMO_FIXTURE.activePlan,
      phaseHistory: DEMO_FIXTURE.land.phaseHistory,
      nriSignals: [],
    }
  }
});
```

In the Edge Function, when `demo === true`:
- Skip Supabase auth check (demo is pre-authenticated)
- Skip user rate limit lookup (use a shared `demo-nri` key with a generous global cap — e.g. 500/hour across all demo sessions)
- Use the provided context directly instead of fetching from DB
- Still call Anthropic API with the full NRI system prompt — NRI should respond exactly as it would for a real user

### Demo NRI opening message
On first open of the NRI chat in demo mode, pre-load one NRI message so the conversation isn't blank:

```
Verso l'alto. I know this place — Sundown Edge, Zone 4b, First Signs. The forsythia is close to full bloom and your frost window runs through May 3. Your chip layer on Bed 1 needs refreshing before the planting window opens. What would you like to think through?
```

---

## What Works in Demo Mode

| Feature | Demo behavior |
|---|---|
| All screens | Fully navigable, all content from fixture |
| NRI chat | Real API, 5 message limit, pre-loaded context |
| Voice log | Records and transcribes (uses browser speech API), adds to session observations, does NOT call NRI processing |
| Photo log | Can take/upload photo, shows in session feed, no recognition API call |
| Observation log | Adds to session state, visible immediately, lost on tab close |
| Plan seed list | Displays correctly, Seeds Now links work with affiliate tag |
| Affiliate clicks | Logged to Supabase `affiliate_events` table with `user_id: 'demo'` — real tracking |
| Common Year phases | Fully interactive, reads from fixture phase history |
| Loam Map | All three language tabs work, data from fixture |
| Weather | From fixture (not live NWS call — keeps demo fast and consistent) |
| Planner | SVG canvas displays, bed selection works, tabs navigate |
| Harvest log | Pre-seeded with 2 demo entries, can add more to session |
| Settings | Toggle-able but changes don't persist |
| Community screens | Show demo community "Sundown Edge Garden Co-op" with 6 demo members |

---

## Demo Community Fixture

Community screens need data too. Pre-seed a small demo community:

```ts
export const DEMO_COMMUNITY = {
  id: 'demo-community',
  name: 'Sundown Edge Garden Co-op',
  memberCount: 6,
  members: [
    { id: 'dm-1', displayName: 'Maya R.', role: 'coordinator', plotId: 'demo-plot-1', volunteerHoursYTD: 14, engagementScore: 0.92 },
    { id: 'dm-2', displayName: 'Marcus T.', role: 'member', plotId: 'demo-plot-2', volunteerHoursYTD: 3, engagementScore: 0.41 },
    { id: 'dm-3', displayName: 'Li W.', role: 'mentor', plotId: null, volunteerHoursYTD: 22, engagementScore: 0.88 },
    { id: 'dm-4', displayName: 'Priya S.', role: 'member', plotId: null, volunteerHoursYTD: 8, engagementScore: 0.67 },
    { id: 'dm-5', displayName: 'James K.', role: 'member', plotId: null, volunteerHoursYTD: 1, engagementScore: 0.18 },
    { id: 'dm-6', displayName: 'Demo Gardener', role: 'member', plotId: 'demo-plot-1', volunteerHoursYTD: 0, engagementScore: 0.5 },
  ],
  nriSignals: [
    { personId: 'dm-2', type: 'checkin', severity: 'caution', reason: 'Marcus hasn\'t logged in 11 days and missed the last workday.' },
    { personId: 'dm-3', type: 'mentor_candidate', severity: 'info', reason: 'Li is in her third season with consistent records. She may be ready to mentor a newer member.' },
  ],
  workdays: [
    { id: 'wd-1', scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], startTime: '9:00 AM', focus: 'Spring bed prep and chip refresh', rsvps: 4 },
  ],
  sharingPosts: [
    { id: 'sp-1', authorId: 'dm-1', type: 'surplus', item: 'Surplus kale starts — 6 plants', status: 'available' },
    { id: 'sp-2', authorId: 'dm-3', type: 'announcement', item: 'Garlic order arriving Friday — pick up at the shed', status: 'available' },
  ],
};
```

---

## Perplexity AI Computer Compatibility

For automated browser agents to navigate the demo reliably:

**1. Add `data-screen` attributes to all nav items:**
```html
<button data-screen="home" onclick="navigate('home')">Home</button>
```

**2. Add `data-demo-section` to major content regions:**
```html
<div data-demo-section="parcel-map">...</div>
<div data-demo-section="rule-of-life">...</div>
<div data-demo-section="nri-chat">...</div>
```

**3. Ensure all interactive elements have descriptive `aria-label` attributes:**
```html
<button aria-label="Open NRI chat">NRI</button>
<button aria-label="Navigate to Loam Map">Loam Map</button>
```

**4. The demo banner must have `data-demo-banner` attribute:**
```html
<div data-demo-banner role="banner">
  🌱 Demo mode · Your session resets when you close this tab
  <a href="/auth/signup">Start for real →</a>
</div>
```

**5. NRI chat input must be reliably selectable:**
```html
<textarea
  id="nri-demo-input"
  data-demo-nri-input
  aria-label="Message NRI"
  placeholder="Ask NRI about your garden..."
/>
```

---

## Demo Banner

Persistent, non-intrusive, dismissible:

```tsx
// src/demo/DemoBanner.tsx
export function DemoBanner() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('demo-banner-dismissed') === 'true'
  );

  if (dismissed) return null;

  return (
    <div
      data-demo-banner
      role="banner"
      style={{
        background: 'color-mix(in srgb, var(--color-accent-soft) 80%, transparent)',
        borderBottom: '1px solid var(--color-accent)',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: 'var(--color-accent)',
        fontWeight: 600,
        flexShrink: 0,
        zIndex: 200,
      }}
    >
      <span>🌱 Demo mode · Nothing is saved · Sundown Edge, Zone 4b</span>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <a href="/auth/signup" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
          Start for real →
        </a>
        <button
          onClick={() => {
            sessionStorage.setItem('demo-banner-dismissed', 'true');
            setDismissed(true);
          }}
          aria-label="Dismiss demo banner"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '16px', lineHeight: 1 }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
```

---

## What Does NOT Work in Demo Mode

Be explicit in the UI when something requires a real account:

| Feature | Demo behavior |
|---|---|
| Stripe checkout | Clicking "Start free trial" goes to `/auth/signup`, not Stripe |
| Push notifications | Not requested — show "Enable notifications when you create your account" |
| Photo recognition (Plant.id) | Show "Recognition available in your account" on tap |
| Data export / grant report | "Export available in your account" |
| Invite / share garden | Disabled with tooltip |

---

## Build Notes

- Demo mode adds zero complexity to the core app — it's a parallel context layer, not a flag threaded through every component
- All demo data lives in `src/demo/` — isolated from production code
- The NRI Edge Function needs one extra branch: `if (body.demo) { useProvidedContext() }` — everything else is identical
- Affiliate click tracking works in demo — Seeds Now clicks from demo sessions are real and should be tracked
- Test the demo end-to-end with a real Perplexity browser session before launch

---

## File Structure

```
src/
  demo/
    fixture.ts          ← DEMO_FIXTURE and DEMO_COMMUNITY data
    DemoProvider.tsx    ← context provider
    DemoBanner.tsx      ← persistent banner component
    DemoLayout.tsx      ← wraps all demo screens with banner + provider
    useDemoNRI.ts       ← NRI hook with rate limiting and pre-context
    index.ts            ← exports
```
