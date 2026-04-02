# Hortus — Garden Mode Addendum
**Addendum to `hortus-lovable-prompt.md` · Implement during Step 3 of the build order (Auth)**

---

## The Core Fork

At Step 2 of onboarding, every user makes one choice that shapes their entire Hortus experience:

**My own land** — solo garden, household, homestead, or personal plot  
**Community garden** — shared space with multiple members

This is not a preference setting. It is a structural fork that determines which features exist for that user, which screens they see, which nav items appear, which Stripe tier is offered, and how NRI speaks to them.

Store it on the `profiles` table:

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  garden_mode text DEFAULT 'solo' CHECK (garden_mode IN ('solo', 'community'));
```

---

## What Each Mode Sees

### Solo mode — full growing feature set, no community features

**Bottom nav (mobile):** Home · Plots · NRI · Seasons · Memory  
**Sidebar (desktop):** Place, Growing, Rhythm sections only

**Screens available:**
- Home, Loam Map, Weather
- Plots (planner, aerial, AR, layout)
- Common Year, Source Materials
- Harvest Log, Succession, Phenology, Field Mode
- Memory / Observation Log
- Philosophy, Settings, Notifications
- NRI chat

**Screens hidden:** People & NRI, Workdays, Garden Map, Sharing Board, Messages, Volunteer Hours

**Pricing offered:** Solo tier ($4.99/month · $39/year)

**NRI context:** Speaks as a personal steward — "your beds," "your land," "your season"

---

### Community mode — everything in solo, plus the full community layer

**Bottom nav (mobile):** Home · Plots · NRI · Seasons · Memory (same)  
**Hamburger drawer:** adds Community section with all 6 community screens  
**Sidebar (desktop):** adds Community section

**Additional screens available:**
- People & NRI Signals
- Workday Scheduler
- Garden Map (shared bed ownership)
- Sharing Board
- Internal Messages
- Volunteer Hours

**Pricing offered:** Community tier ($9.99/month · $79/year per garden)

**NRI context:** Aware of members, workdays, NRI signals. Speaks to shared stewardship — "your garden's members," "tomorrow's workday," "Marcus hasn't logged in"

---

## Implementation

### 1. `useGardenMode` hook

```ts
// src/hooks/useGardenMode.ts
export function useGardenMode() {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => profileService.get(user!.id),
    enabled: !!user,
  });
  return {
    mode: profile?.garden_mode ?? 'solo',
    isSolo: (profile?.garden_mode ?? 'solo') === 'solo',
    isCommunity: profile?.garden_mode === 'community',
  };
}
```

### 2. Conditional nav

The Community section in the drawer and sidebar is rendered conditionally:

```tsx
// In Drawer and Sidebar components
const { isCommunity } = useGardenMode();

{isCommunity && (
  <NavSection label="Community">
    <NavLink to="/app/community/people" icon="users">{t('nav.people')}</NavLink>
    <NavLink to="/app/community/workdays" icon="calendar-days">{t('nav.workdays')}</NavLink>
    <NavLink to="/app/community/map" icon="map">{t('nav.garden_map')}</NavLink>
    <NavLink to="/app/community/sharing" icon="hand-heart">{t('nav.sharing')}</NavLink>
    <NavLink to="/app/community/messages" icon="message-square">{t('nav.messages')}</NavLink>
    <NavLink to="/app/community/hours" icon="clock-3">{t('nav.hours')}</NavLink>
  </NavSection>
)}
```

### 3. Route protection

Community routes are gated — solo users who navigate directly to `/app/community/*` are redirected:

```tsx
// src/components/RequiresCommunityMode.tsx
export function RequiresCommunityMode({ children }: { children: React.ReactNode }) {
  const { isCommunity } = useGardenMode();
  if (!isCommunity) return <Navigate to="/app/home" replace />;
  return <>{children}</>;
}

// In router
<Route path="/app/community/*" element={
  <RequiresCommunityMode>
    <CommunityRoutes />
  </RequiresCommunityMode>
} />
```

### 4. Onboarding saves the choice

Step 2 of onboarding writes `garden_mode` to the profile:

```ts
// After user completes Step 2 selection
await profileService.update(user.id, { garden_mode: selectedMode });
```

If the user selects **Community garden**, the pricing step (when it appears) shows the Community tier by default instead of Solo.

### 5. Switching modes after onboarding

Users can switch in Settings → Garden Type. When switching from solo → community:
- Unlock community screens immediately
- Prompt to set up or join a community garden
- Offer Community tier upgrade if on Solo plan

When switching community → solo:
- Confirm: "This will hide your community features. Your community data is preserved."
- Downgrade to Solo tier if desired

---

## Onboarding Step 2 — Garden Type UI

The prototype (`hortus-app-prototype.html`) shows the exact design. Two card options:

```
🌱  My own land
    Personal garden, household, or homestead. Just you and your ground.    ✓

🤝  Community garden
    Shared space with multiple members — church plot, neighborhood garden.
```

Cards use the `ob-mode-card` CSS class from the prototype. Selected state is a teal border and soft background. The checkmark shows on the selected card only.

This step comes **before** goals and philosophy — it is the first structural decision, and it shapes how the goal options read. A community garden user's goals lean toward "shared harvest," "community resilience," "teach others" rather than "feed my family."

---

## NRI Differences by Mode

NRI receives `garden_mode` in its context object. The system prompt already handles this — the relevant section is in `nri-system-prompt.md` under "Community and People Module."

**Solo context object additions:**
```json
{ "garden_mode": "solo" }
```

**Community context object additions:**
```json
{
  "garden_mode": "community",
  "community": {
    "name": "Sundown Edge Garden Co-op",
    "memberCount": 6,
    "nextWorkday": "2026-04-05",
    "nriSignals": [...]
  }
}
```

NRI adapts its language automatically from the system prompt. No additional prompt engineering needed.

---

## Stripe Tier Alignment

| Mode | Default tier shown at signup | Trial |
|---|---|---|
| Solo | Solo ($4.99/mo · $39/yr) | 14 days |
| Community | Community ($9.99/mo · $79/yr per garden) | 30 days |

The pricing page at `/pricing` shows both tiers regardless — garden mode just controls which one is pre-selected/highlighted when the user arrives from onboarding.

---

## What NOT to Do

- Do not hide the Loam Map, Weather, Planner, or any growing feature from community users — they need all of it
- Do not show community features to solo users even if they navigate directly to the URL
- Do not require community users to set up a community garden during onboarding — they can proceed solo and create/join a garden later
- Do not use garden_mode to gate NRI — NRI is available in both modes
